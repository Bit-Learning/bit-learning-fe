import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/shared/lib/cookies";

type MessageHandler = (message: any) => void;
type ErrorHandler = (error: any) => void;

class WebSocketService {
	private client: Client | null = null;
	private subscriptions: Map<string, StompSubscription> = new Map();
	private reconnectAttempts = 0;
	private readonly maxReconnectAttempts = 5;
	private readonly reconnectDelay = 3000;
	private isManualDisconnect = false;

	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.client?.connected) {
				resolve();
				return;
			}

			const wsUrl = import.meta.env.VITE_WS_URL ?? "http://localhost:8080/ws";
			const accessToken = getAccessToken();

			if (!accessToken) {
				reject(new Error("No access token found. Please log in."));
				return;
			}

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
					this.reconnectAttempts = 0;
					this.isManualDisconnect = false;
					resolve();
				},
				onStompError: (frame) => {
					reject(new Error(frame.headers.message || "Connection failed"));
				},
				onWebSocketClose: () => {
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
	}

	private handleReconnect(): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error("[WebSocket] Max reconnection attempts reached.");
			return;
		}

		this.reconnectAttempts += 1;
		const delay = this.reconnectDelay * this.reconnectAttempts;

		setTimeout(() => {
			if (!this.isManualDisconnect) {
				this.connect().catch((error) => {
					console.error("[WebSocket] Reconnection failed:", error);
				});
			}
		}, delay);
	}

	subscribe(
		destination: string,
		callback: MessageHandler,
		errorCallback?: ErrorHandler,
	): StompSubscription {
		if (!this.client?.connected) {
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

	unsubscribe(destination: string): void {
		const subscription = this.subscriptions.get(destination);
		if (subscription) {
			subscription.unsubscribe();
			this.subscriptions.delete(destination);
		}
	}

	send(
		destination: string,
		body: any,
		headers: Record<string, string> = {},
	): void {
		if (!this.client?.connected) {
			throw new Error("WebSocket not connected");
		}

		this.client.publish({
			destination,
			body: JSON.stringify(body),
			headers,
		});
	}

	disconnect(): void {
		if (this.client?.connected) {
			this.isManualDisconnect = true;
			this.subscriptions.clear();
			this.client.deactivate();
		}
	}

	isConnected(): boolean {
		return this.client?.connected ?? false;
	}

	getClient(): Client | null {
		return this.client;
	}
}

export const wsService = new WebSocketService();
