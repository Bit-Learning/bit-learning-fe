import type { StompSubscription } from "@stomp/stompjs";
import { wsService } from "@/feature/notification/services/websocket.service";

/**
 * Base Channel Class
 *
 * Abstract class that provides common functionality for all channels.
 * Each channel represents a specific feature/domain (e.g., notifications, chat, course updates)
 */
export abstract class BaseChannel<TMessage = any> {
	protected subscriptions: Map<string, StompSubscription> = new Map();
	protected messageHandlers: Map<string, Set<(message: TMessage) => void>> =
		new Map();

	/**
	 * Get the destination path for this channel
	 */
	abstract getDestination(...args: any[]): string;

	/**
	 * Transform incoming message before passing to handlers
	 * Override this to add channel-specific transformation logic
	 */
	protected transformMessage(rawMessage: any): TMessage {
		return rawMessage as TMessage;
	}

	/**
	 * Validate incoming message
	 * Override this to add channel-specific validation
	 */
	protected validateMessage(_message: any): boolean {
		return true;
	}

	/**
	 * Subscribe to this channel
	 */
	subscribe(callback: (message: TMessage) => void, ...args: any[]): string {
		const destination = this.getDestination(...args);

		// Add callback to handlers
		if (!this.messageHandlers.has(destination)) {
			this.messageHandlers.set(destination, new Set());
		}
		this.messageHandlers.get(destination)!.add(callback);

		// Subscribe to WebSocket if not already subscribed
		if (!this.subscriptions.has(destination)) {
			const subscription = wsService.subscribe(
				destination,
				(rawMessage) => {
					try {
						// Validate message
						const isValid = this.validateMessage(rawMessage);
						if (!isValid) {
							return;
						}

						// Transform message
						const transformedMessage = this.transformMessage(rawMessage);

						// Call all registered handlers
						const handlers = this.messageHandlers.get(destination);
						if (handlers) {
							handlers.forEach((handler) => {
								handler(transformedMessage);
							});
						}
					} catch (error) {
						console.error(
							`[${this.constructor.name}] Error processing message:`,
							error,
						);
						this.onError(error as Error);
					}
				},
				(error) => {
					console.error(
						`[${this.constructor.name}] Subscription error:`,
						error,
					);
					this.onError(error);
				},
			);

			this.subscriptions.set(destination, subscription);
		}

		return destination;
	}

	/**
	 * Unsubscribe from this channel
	 */
	unsubscribe(callback: (message: TMessage) => void, ...args: any[]): void {
		const destination = this.getDestination(...args);
		const handlers = this.messageHandlers.get(destination);

		if (handlers) {
			handlers.delete(callback);
			// If no more handlers, unsubscribe from WebSocket
			if (handlers.size === 0) {
				this.messageHandlers.delete(destination);
				const subscription = this.subscriptions.get(destination);
				if (subscription) {
					subscription.unsubscribe();
					this.subscriptions.delete(destination);
				}
			}
		}
	}

	/**
	 * Unsubscribe all handlers
	 */
	unsubscribeAll(): void {
		this.subscriptions.forEach((subscription) => {
			subscription.unsubscribe();
		});
		this.subscriptions.clear();
		this.messageHandlers.clear();
	}

	/**
	 * Send message to this channel
	 */
	send(body: any, ...args: any[]): void {
		const destination = this.getSendDestination(...args);
		wsService.send(destination, body);
	}

	/**
	 * Get the send destination (usually different from subscribe destination)
	 * Override this if your channel needs different send/subscribe paths
	 */
	protected getSendDestination(...args: any[]): string {
		// By default, convert /topic to /app
		return this.getDestination(...args).replace("/topic/", "/app/");
	}

	/**
	 * Error handler - override to customize error handling per channel
	 */
	protected onError(error: Error): void {
		// Default error handling - can be overridden
		console.error(`[${this.constructor.name}] Channel error:`, error);
	}

	/**
	 * Check if currently subscribed to destination
	 */
	isSubscribed(...args: any[]): boolean {
		const destination = this.getDestination(...args);
		return this.subscriptions.has(destination);
	}

	/**
	 * Get number of active subscriptions
	 */
	getSubscriptionCount(): number {
		return this.subscriptions.size;
	}
}
