import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { syncTimeFromServerAction } from "../stores/quiz.store";
import { useSendHeartbeat } from "../queries/useQuiz";

interface UseTimerSyncOptions {
  attemptId: number;
  enabled: boolean;
  intervalMs?: number;
}

export function useTimerSync({ attemptId, enabled, intervalMs = 30000 }: UseTimerSyncOptions) {
  const dispatch = useDispatch();
  const heartbeatMutation = useSendHeartbeat();
  const lastSyncRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const syncWithServer = async () => {
      try {
        const response = await heartbeatMutation.mutateAsync({
          attemptId,
          data: {
            currentTime: new Date().toISOString(),
          },
        });

        if (response?.data?.data?.timeRemaining !== undefined) {
          dispatch(syncTimeFromServerAction(response.data.data.timeRemaining));
        }

        lastSyncRef.current = Date.now();
      } catch (error) {
        console.error("Failed to sync timer with server:", error);
      }
    };

    syncWithServer();

    const intervalId = setInterval(syncWithServer, intervalMs);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        if (timeSinceLastSync > intervalMs) {
          syncWithServer();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, attemptId, intervalMs, dispatch]);
}
