import { useCallback, useEffect, useRef, useState } from "react";
import type { BaseChannel } from "@/features/notification/channel/base-channel";
import { wsService } from "@/features/notification/services/websocket.service";

interface UseChannelOptions<TMessage> {
	channel: BaseChannel<TMessage>;
	destinationArgs?: any[];
	onMessage?: (message: TMessage) => void;
	onError?: (error: Error) => void;
	autoConnect?: boolean;
	autoSubscribe?: boolean;
	deps?: any[];
}

export function useChannel<TMessage = any>(
	options: UseChannelOptions<TMessage>,
) {
	const {
		channel,
		destinationArgs = [],
		onMessage,
		onError,
		autoConnect = true,
		autoSubscribe = true,
		deps = [],
	} = options;

	const [isConnected, setIsConnected] = useState(wsService.isConnected());
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [messages, setMessages] = useState<TMessage[]>([]);

	const callbackRef = useRef(onMessage);
	const errorCallbackRef = useRef(onError);
	const handlerRef = useRef<((message: TMessage) => void) | null>(null);

	useEffect(() => {
		callbackRef.current = onMessage;
		errorCallbackRef.current = onError;
	}, [onMessage, onError]);

	const connect = useCallback(async () => {
		try {
			await wsService.connect();
			setIsConnected(true);
			setError(null);
		} catch (err) {
			const e = err instanceof Error ? err : new Error("Connection failed");
			setError(e);
			setIsConnected(false);
			errorCallbackRef.current?.(e);
		}
	}, []);

	const subscribe = useCallback(
		(...args: any[]) => {
			const argsToUse = args.length > 0 ? args : destinationArgs;

			try {
				handlerRef.current = (message: TMessage) => {
					setMessages((prev) => [...prev, message]);
					callbackRef.current?.(message);
				};

				channel.subscribe(handlerRef.current, ...argsToUse);
				setIsSubscribed(true);
				setError(null);
			} catch (err) {
				const e = err instanceof Error ? err : new Error("Subscription failed");
				setError(e);
				setIsSubscribed(false);
				errorCallbackRef.current?.(e);
			}
		},
		[channel, destinationArgs],
	);

	const unsubscribe = useCallback(
		(...args: any[]) => {
			const argsToUse = args.length > 0 ? args : destinationArgs;

			try {
				if (handlerRef.current) {
					channel.unsubscribe(handlerRef.current, ...argsToUse);
					handlerRef.current = null;
				}
				setIsSubscribed(false);
			} catch (err) {
				const e = err instanceof Error ? err : new Error("Unsubscribe failed");
				setError(e);
				errorCallbackRef.current?.(e);
			}
		},
		[channel, destinationArgs],
	);

	const send = useCallback(
		(body: any, ...args: any[]) => {
			const argsToUse = args.length > 0 ? args : destinationArgs;

			try {
				channel.send(body, ...argsToUse);
			} catch (err) {
				const e = err instanceof Error ? err : new Error("Send failed");
				setError(e);
				errorCallbackRef.current?.(e);
			}
		},
		[channel, destinationArgs],
	);

	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	useEffect(() => {
		if (autoConnect && !wsService.isConnected()) {
			connect();
		}

		const interval = setInterval(() => {
			setIsConnected(wsService.isConnected());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [autoConnect, connect]);

	useEffect(() => {
		if (autoSubscribe && isConnected) {
			subscribe();

			return () => {
				unsubscribe();
			};
		}
	}, [autoSubscribe, isConnected, subscribe, unsubscribe, ...deps]);

	return {
		isConnected,
		isSubscribed,
		error,
		connect,
		subscribe,
		unsubscribe,
		send,
		messages,
		clearMessages,
		channel,
	};
}
