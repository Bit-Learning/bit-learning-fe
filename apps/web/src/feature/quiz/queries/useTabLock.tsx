import { useEffect, useRef, useState, useCallback } from "react";

const createTabId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const HEARTBEAT_INTERVAL = 5000;
const HEARTBEAT_TIMEOUT = 15000;

export type LockStatus = "acquiring" | "granted" | "denied";

interface TabLockResult {
  status: LockStatus;
  releaseLock: () => void;
}

export function useTabLock(attemptId: number): TabLockResult {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<LockStatus>("acquiring");

  const tabIdRef = useRef<string>(createTabId());
  const TAB_ID = tabIdRef.current;

  const statusRef = useRef<LockStatus>("acquiring");
  const resolvedRef = useRef(false);
  const mountedRef = useRef(true);

  const storageKey = `quiz_lock_${attemptId}`;
  const channelName = `quiz-attempt-${attemptId}`;

  const writeHeartbeat = useCallback(() => {
    localStorage.setItem(storageKey, JSON.stringify({ tabId: TAB_ID, ts: Date.now() }));
  }, [storageKey, TAB_ID]);

  const readLock = useCallback((): { tabId: string; ts: number } | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const releaseLock = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    const lock = readLock();
    if (lock?.tabId === TAB_ID) {
      localStorage.removeItem(storageKey);
    }
    channelRef.current?.postMessage({ type: "RELEASED", tabId: TAB_ID });
  }, [storageKey, readLock, TAB_ID]);

  useEffect(() => {
    if (!attemptId) return;

    mountedRef.current = true;
    resolvedRef.current = false;
    statusRef.current = "acquiring";

    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    const grant = () => {
      if (resolvedRef.current || !mountedRef.current) return;
      resolvedRef.current = true;
      statusRef.current = "granted";
      setStatus("granted");
      writeHeartbeat();
      heartbeatRef.current = setInterval(writeHeartbeat, HEARTBEAT_INTERVAL);
    };

    const deny = () => {
      if (resolvedRef.current || !mountedRef.current) return;
      resolvedRef.current = true;
      statusRef.current = "denied";
      setStatus("denied");
    };

    const tryAcquire = () => {
      const lock = readLock();
      if (lock && lock.tabId !== TAB_ID) {
        const age = Date.now() - lock.ts;
        if (age < HEARTBEAT_TIMEOUT) {
          deny();
          return;
        }
      }

      channel.postMessage({ type: "PING", tabId: TAB_ID });

      const jitter = Math.random() * 200;
      setTimeout(() => {
        if (!resolvedRef.current && mountedRef.current) grant();
      }, 300 + jitter);
    };

    channel.onmessage = (e) => {
      const { type, tabId } = e.data as { type: string; tabId: string };

      if (type === "PING" && tabId !== TAB_ID) {
        if (statusRef.current === "granted") {
          channel.postMessage({ type: "PONG", tabId: TAB_ID });
        }
      }

      if (type === "PONG" && !resolvedRef.current) {
        deny();
      }

      if (type === "RELEASED" && mountedRef.current) {
        if (statusRef.current === "denied") {
          resolvedRef.current = false;
          statusRef.current = "acquiring";
          setStatus("acquiring");
          setTimeout(() => {
            if (mountedRef.current) tryAcquire();
          }, 50);
        }
      }
    };

    tryAcquire();

    const handleUnload = () => releaseLock();
    window.addEventListener("beforeunload", handleUnload);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue === null && mountedRef.current) {
        if (statusRef.current === "denied") {
          resolvedRef.current = false;
          statusRef.current = "acquiring";
          setStatus("acquiring");
          setTimeout(
            () => {
              if (mountedRef.current) tryAcquire();
            },
            50 + Math.random() * 100,
          );
        }
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      mountedRef.current = false;
      releaseLock();
      channel.close();
      channelRef.current = null;
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("storage", handleStorageEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  return { status, releaseLock };
}
