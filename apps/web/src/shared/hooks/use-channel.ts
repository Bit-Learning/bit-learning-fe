import { useCallback, useEffect, useRef, useState } from "react";
import type { BaseChannel } from "@/feature/notification/channel/base-channel";
import { wsService } from "@/feature/notification/services/websocket.service";

interface UseChannelOptions<TMessage> {
	/**
	 * The channel instance to use
	 */
	channel: BaseChannel<TMessage>;

	/**
	 * Arguments to pass to channel's getDestination method
	 * e.g., [roomId] for chat, [courseId] for course updates
	 */
	destinationArgs?: any[];

	/**
	 * Callback when message is received
	 */
	onMessage?: (message: TMessage) => void;

	/**
	 * Callback when error occurs
	 */
	onError?: (error: Error) => void;

	/**
	 * Auto-connect to WebSocket on mount
	 */
	autoConnect?: boolean;

	/**
	 * Auto-subscribe to channel on mount
	 */
	autoSubscribe?: boolean;

	/**
	 * Dependencies array - when changed, will resubscribe
	 */
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

	// Keep refs updated
	useEffect(() => {
		callbackRef.current = onMessage;
		errorCallbackRef.current = onError;
	}, [onMessage, onError]);

	// Connect to WebSocket
	const connect = useCallback(async () => {
		try {
			await wsService.connect();
			setIsConnected(true);
			setError(null);
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Connection failed");
			setError(error);
			setIsConnected(false);
			errorCallbackRef.current?.(error);
		}
	}, []);

	// Subscribe to channel
	const subscribe = useCallback(
		(...args: any[]) => {
			const argsToUse = args.length > 0 ? args : destinationArgs;

			try {
				// Tạo handler và lưu vào ref
				handlerRef.current = (message: TMessage) => {
					console.log("[useChannel] Received message:", message);
					setMessages((prev) => [...prev, message]);
					callbackRef.current?.(message);
				};

				console.log(
					"[useChannel] Subscribing to channel with args:",
					argsToUse,
				);
				channel.subscribe(handlerRef.current, ...argsToUse);
				setIsSubscribed(true);
				setError(null);
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Subscription failed");
				console.error("[useChannel] Subscribe error:", error);
				setError(error);
				setIsSubscribed(false);
				errorCallbackRef.current?.(error);
			}
		},
		[channel, destinationArgs],
	);

	// Unsubscribe from channel
	const unsubscribe = useCallback(
		(...args: any[]) => {
			const argsToUse = args.length > 0 ? args : destinationArgs;

			try {
				if (handlerRef.current) {
					console.log(
						"[useChannel] Unsubscribing from channel with args:",
						argsToUse,
					);
					channel.unsubscribe(handlerRef.current, ...argsToUse);
					handlerRef.current = null;
				}
				setIsSubscribed(false);
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unsubscribe failed");
				console.error("[useChannel] Unsubscribe error:", error);
				setError(error);
				errorCallbackRef.current?.(error);
			}
		},
		[channel, destinationArgs],
	);

	// Send message through channel
	const send = useCallback(
		(body: any, ...args: any[]) => {
			const argsToUse = args.length > 0 ? args : destinationArgs;

			try {
				console.log("[useChannel] Sending message:", body, "to:", argsToUse);
				channel.send(body, ...argsToUse);
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Send failed");
				console.error("[useChannel] Send error:", error);
				setError(error);
				errorCallbackRef.current?.(error);
			}
		},
		[channel, destinationArgs],
	);

	// Clear all messages
	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	// Auto-connect on mount
	useEffect(() => {
		if (autoConnect && !wsService.isConnected()) {
			connect();
		}

		// Update connection state periodically
		const interval = setInterval(() => {
			const connected = wsService.isConnected();
			setIsConnected(connected);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [autoConnect, connect]);

	// Auto-subscribe when connected and destination args change
	useEffect(() => {
		if (autoSubscribe && isConnected) {
			console.log("[useChannel] Auto-subscribing...");
			subscribe();

			return () => {
				console.log("[useChannel] Cleaning up subscription...");
				unsubscribe();
			};
		}
	}, [autoSubscribe, isConnected, subscribe, unsubscribe, ...deps]);

	return {
		// Connection state
		isConnected,
		isSubscribed,
		error,

		// Actions
		connect,
		subscribe,
		unsubscribe,
		send,

		// Data
		messages,
		clearMessages,

		// Channel info
		channel,
	};
}
