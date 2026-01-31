import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "@workspace/ui/components/Sonner";
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

	/**
	 * Initialize WebSocket connection
	 */
	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			// Prevent multiple connections
			if (this.client?.connected) {
				console.log("[WebSocket] Already connected");
				resolve();
				return;
			}

			const wsUrl = import.meta.env.VITE_WS_URL ?? "http://localhost:8080/ws";
			const accessToken = getAccessToken();

			if (!accessToken) {
				const error = "No access token found. Please log in.";
				console.error("[WebSocket]", error);
				toast.error({
					title: "Kết nối thất bại",
					description: error,
				});
				reject(new Error(error));
				return;
			}

			console.log("[WebSocket] Connecting to:", wsUrl);
			console.log(
				"[WebSocket] Using token:",
				accessToken?.substring(0, 20) + "...",
			);

			// Create STOMP client with SockJS
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
				reconnectDelay: this.reconnectDelay,
				heartbeatIncoming: 4000,
				heartbeatOutgoing: 4000,

				onConnect: () => {
					console.log("[WebSocket] Connected successfully");
					this.reconnectAttempts = 0;
					this.isManualDisconnect = false;
					toast.success({
						title: "Kết nối thành công",
						description: "Đã kết nối tới hệ thống thông báo thời gian thực.",
					});
					resolve();
				},

				onStompError: (frame) => {
					console.error("[WebSocket] STOMP Error:", frame);
					toast.error({
						title: "Kết nối thất bại",
						description: frame.headers.message || "Lỗi kết nối WebSocket",
					});
					reject(new Error(frame.headers.message || "Connection failed"));
				},

				onWebSocketClose: (event) => {
					console.log("[WebSocket] Connection closed:", event);

					// Only attempt reconnect if not manually disconnected
					if (!this.isManualDisconnect) {
						this.handleReconnect();
					}
				},

				onWebSocketError: (error) => {
					console.error("[WebSocket] Error:", error);
					toast.error({
						title: "Kết nối thất bại",
						description: "Lỗi kết nối WebSocket",
					});
				},
			});

			this.client.activate();
		});
	}

	/**
	 * Handle reconnection logic
	 */
	private handleReconnect(): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error(
				"[WebSocket] Max reconnection attempts reached. Please refresh the page.",
			);
			toast.error({
				title: "Kết nối thất bại",
				description:
					"Không thể kết nối lại sau nhiều lần thử. Vui lòng làm mới trang.",
			});
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * this.reconnectAttempts;

		console.log(
			`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`,
		);

		setTimeout(() => {
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

		console.log("[WebSocket] Subscribing to:", destination);

		const subscription = this.client.subscribe(
			destination,
			(message: IMessage) => {
				console.log("[WebSocket] ✉️ Message received on", destination);
				console.log("[WebSocket] Raw message body:", message.body);
				try {
					const parsedMessage = JSON.parse(message.body);
					console.log("[WebSocket] Parsed message:", parsedMessage);
					callback(parsedMessage);
				} catch (error) {
					console.error("[WebSocket] Error parsing message:", error);
					if (errorCallback) {
						errorCallback(error);
					}
				}
			},
		);

		console.log("[WebSocket] ✅ Subscribed successfully to:", destination);

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
			console.log("[WebSocket] Unsubscribed from:", destination);
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

		console.log("[WebSocket] Message sent to:", destination);
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		if (this.client?.connected) {
			this.isManualDisconnect = true;
			this.subscriptions.clear();
			this.client.deactivate();
			console.log("[WebSocket] Disconnected");
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
