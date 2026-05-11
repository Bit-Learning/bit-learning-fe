import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/shared/lib/cookies";

type MessageHandler = (message: any) => void;
type ErrorHandler = (error: any) => void;

class WebSocketService {
	private client: Client | null = null;
	private subscriptions: Map<string, StompSubscription> = new Map();
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 3000;
	private isManualDisconnect = false;
	private connectPromise: Promise<void> | null = null;
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

	private clearReconnectTimeout(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
	}

	/**
	 * Initialize WebSocket connection
	 */
	connect(): Promise<void> {
		if (this.client?.connected) {
			return Promise.resolve();
		}

		if (this.connectPromise) {
			return this.connectPromise;
		}

		const wsUrl = import.meta.env.VITE_WS_URL ?? "http://localhost:8080/ws";
		const accessToken = getAccessToken();

		if (!accessToken) {
			const error = "No access token found. Please log in.";
			console.error("[WebSocket]", error);
			this.disconnect();
			return Promise.reject(new Error(error));
		}

		this.clearReconnectTimeout();
		this.isManualDisconnect = false;

		this.connectPromise = new Promise((resolve, reject) => {
			let settled = false;
			const resolveOnce = () => {
				if (settled) {
					return;
				}
				settled = true;
				this.connectPromise = null;
				resolve();
			};
			const rejectOnce = (error: Error) => {
				if (settled) {
					return;
				}
				settled = true;
				this.connectPromise = null;
				reject(error);
			};

			// Recreate the client so every new connect/reconnect uses the latest token.
			this.client = new Client({
				webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
				connectHeaders: {
					Authorization: `Bearer ${accessToken}`,
				},
				debug: (str: string) => {
					if (import.meta.env.DEV) {
						console.log("[WebSocket Debug]", str);
					}
				},
				// Disable STOMP built-in reconnect. We manage reconnect manually to avoid
				// reusing stale connect headers from an old client instance.
				reconnectDelay: 0,
				heartbeatIncoming: 4000,
				heartbeatOutgoing: 4000,

				onConnect: () => {
					this.reconnectAttempts = 0;
					this.isManualDisconnect = false;
					resolveOnce();
				},

				onStompError: (frame) => {
					console.error("[WebSocket] STOMP Error:", frame);
					rejectOnce(new Error(frame.headers.message || "Connection failed"));
				},

				onWebSocketClose: () => {
					this.connectPromise = null;

					if (!settled) {
						rejectOnce(new Error("WebSocket connection closed"));
					}

					// Only attempt reconnect if not manually disconnected.
					if (!this.isManualDisconnect) {
						this.handleReconnect();
					}
				},

				onWebSocketError: (error) => {
					console.error("[WebSocket] Error:", error);
				},
			});

			this.client.activate();
		});

		return this.connectPromise;
	}

	/**
	 * Handle reconnection logic
	 */
	private handleReconnect(): void {
		if (this.reconnectTimeout || this.connectPromise) {
			return;
		}

		if (!getAccessToken()) {
			this.disconnect();
			return;
		}

		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error(
				"[WebSocket] Max reconnection attempts reached. Please refresh the page.",
			);
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * this.reconnectAttempts;

		this.reconnectTimeout = setTimeout(() => {
			this.reconnectTimeout = null;

			if (!this.isManualDisconnect) {
				this.connect().catch((error) => {
					console.error("[WebSocket] Reconnection failed:", error);
				});
			}
		}, delay);
	}

	/**
	 * Subscribe to a destination
	 * @param destination - The STOMP destination (e.g., "/topic/notifications", "/user/queue/messages")
	 * @param callback - Function to handle incoming messages
	 * @param errorCallback - Optional error handler
	 * @returns Subscription ID
	 */
	subscribe(
		destination: string,
		callback: MessageHandler,
		errorCallback?: ErrorHandler,
	): StompSubscription {
		if (!this.client?.connected) {
			console.error("[WebSocket] Not connected. Call connect() first.");
			throw new Error("WebSocket not connected");
		}

		const subscription = this.client.subscribe(
			destination,
			(message: IMessage) => {
				try {
					const parsedMessage = JSON.parse(message.body);
					callback(parsedMessage);
				} catch (error) {
					console.error("[WebSocket] Error parsing message:", error);
					if (errorCallback) {
						errorCallback(error);
					}
				}
			},
		);

		this.subscriptions.set(destination, subscription);
		return subscription;
	}

	/**
	 * Unsubscribe from a destination
	 */
	unsubscribe(destination: string): void {
		const subscription = this.subscriptions.get(destination);
		if (subscription) {
			subscription.unsubscribe();
			this.subscriptions.delete(destination);
		}
	}

	/**
	 * Send a message to a destination
	 * @param destination - The STOMP destination
	 * @param body - The message body (will be stringified)
	 * @param headers - Optional headers
	 */
	send(
		destination: string,
		body: any,
		headers: Record<string, string> = {},
	): void {
		if (!this.client?.connected) {
			console.error("[WebSocket] Not connected. Cannot send message.");
			throw new Error("WebSocket not connected");
		}

		this.client.publish({
			destination,
			body: JSON.stringify(body),
			headers,
		});
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		this.isManualDisconnect = true;
		this.clearReconnectTimeout();
		this.reconnectAttempts = 0;
		this.connectPromise = null;
		this.subscriptions.clear();

		const client = this.client;
		this.client = null;

		if (client) {
			void client.deactivate();
		}
	}

	/**
	 * Check if WebSocket is connected
	 */
	isConnected(): boolean {
		return this.client?.connected ?? false;
	}

	/**
	 * Get current client instance
	 */
	getClient(): Client | null {
		return this.client;
	}
}

// Export singleton instance
export const wsService = new WebSocketService();
