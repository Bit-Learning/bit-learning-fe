import type { StompSubscription } from "@stomp/stompjs";
import { wsService } from "@/features/notification/services/websocket.service";

export abstract class BaseChannel<TMessage = any> {
	protected subscriptions: Map<string, StompSubscription> = new Map();
	protected messageHandlers: Map<string, Set<(message: TMessage) => void>> =
		new Map();

	abstract getDestination(...args: any[]): string;

	protected transformMessage(rawMessage: any): TMessage {
		return rawMessage as TMessage;
	}

	protected validateMessage(_message: any): boolean {
		return true;
	}

	subscribe(callback: (message: TMessage) => void, ...args: any[]): string {
		const destination = this.getDestination(...args);

		if (!this.messageHandlers.has(destination)) {
			this.messageHandlers.set(destination, new Set());
		}
		this.messageHandlers.get(destination)!.add(callback);

		if (!this.subscriptions.has(destination)) {
			const subscription = wsService.subscribe(
				destination,
				(rawMessage) => {
					try {
						const isValid = this.validateMessage(rawMessage);
						if (!isValid) return;

						const transformedMessage = this.transformMessage(rawMessage);
						const handlers = this.messageHandlers.get(destination);
						if (handlers) {
							handlers.forEach((handler) => handler(transformedMessage));
						}
					} catch (error) {
						this.onError(error as Error);
					}
				},
				(error) => {
					this.onError(error);
				},
			);

			this.subscriptions.set(destination, subscription);
		}

		return destination;
	}

	unsubscribe(callback: (message: TMessage) => void, ...args: any[]): void {
		const destination = this.getDestination(...args);
		const handlers = this.messageHandlers.get(destination);

		if (handlers) {
			handlers.delete(callback);
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

	unsubscribeAll(): void {
		this.subscriptions.forEach((subscription) => {
			subscription.unsubscribe();
		});
		this.subscriptions.clear();
		this.messageHandlers.clear();
	}

	send(body: any, ...args: any[]): void {
		const destination = this.getSendDestination(...args);
		wsService.send(destination, body);
	}

	protected getSendDestination(...args: any[]): string {
		return this.getDestination(...args).replace("/topic/", "/app/");
	}

	protected onError(error: Error): void {
		console.error(`[${this.constructor.name}] Channel error:`, error);
	}

	isSubscribed(...args: any[]): boolean {
		const destination = this.getDestination(...args);
		return this.subscriptions.has(destination);
	}

	getSubscriptionCount(): number {
		return this.subscriptions.size;
	}
}
