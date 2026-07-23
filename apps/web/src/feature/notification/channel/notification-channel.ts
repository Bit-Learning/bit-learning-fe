import { BaseChannel } from "./base-channel";

/**
 * User Summary for notification sender
 * Matches backend UserDto.UserSummaryResponse
 */
export interface NotificationSender {
	id: number;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	role?: string;
}

/**
 * Notification Message Type
 * Matches backend NotificationDto.Response
 */
export interface NotificationMessage {
	id: number;
	title: string;
	message: string;
	targetUrl?: string | null;
	type: "INTERACTION" | "SYSTEM" | "PAYMENT" | "LEARNING";
	isRead: boolean;
	sender?: NotificationSender | null;
	createdAt: string; // Format: "yyyy-MM-dd HH:mm:ss" from backend
}

/**
 * System Notification Message Type
 * Matches backend NotificationDto.SystemResponse
 */
export interface SystemNotificationMessage {
	id: number;
	title: string;
	message: string;
	targetUrl?: string | null;
	isRead: boolean;
	createdAt: string; // Format: "yyyy-MM-dd HH:mm:ss" from backend
}

/**
 * Notification Channel
 *
 * Handles user-specific notifications
 */
export class NotificationChannel extends BaseChannel<NotificationMessage> {
	getDestination(): string {
		return "/user/queue/notifications";
	}

	protected transformMessage(rawMessage: any): NotificationMessage {
		return {
			id: rawMessage.id,
			title: rawMessage.title,
			message: rawMessage.message,
			type: rawMessage.type,
			targetUrl: rawMessage.targetUrl,
			isRead: rawMessage.isRead ?? false,
			sender: rawMessage.sender || null,
			createdAt: rawMessage.createdAt,
		};
	}

	protected validateMessage(message: any): boolean {
		return (
			typeof message === "object" &&
			message !== null &&
			typeof message.id === "number" &&
			typeof message.title === "string" &&
			typeof message.message === "string" &&
			typeof message.type === "string"
		);
	}

	protected getSendDestination(): string {
		throw new Error("Cannot send notifications from client");
	}
}
export class SystemNotificationChannel extends BaseChannel<SystemNotificationMessage> {
	getDestination(): string {
		return "/topic/system/notifications";
	}

	protected transformMessage(rawMessage: any): SystemNotificationMessage {
		return {
			id: rawMessage.id,
			title: rawMessage.title,
			message: rawMessage.message,
			targetUrl: rawMessage.targetUrl,
			isRead: rawMessage.isRead ?? false,
			createdAt: rawMessage.createdAt,
		};
	}

	protected validateMessage(message: any): boolean {
		return (
			typeof message === "object" &&
			message !== null &&
			typeof message.id === "number" &&
			typeof message.title === "string" &&
			typeof message.message === "string"
		);
	}

	protected getSendDestination(): string {
		throw new Error("Cannot send system notifications from client");
	}
}

// Singleton instance
export const notificationChannel = new NotificationChannel();
export const systemNotificationChannel = new SystemNotificationChannel();
