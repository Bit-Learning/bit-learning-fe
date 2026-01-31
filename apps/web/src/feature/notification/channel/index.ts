/**
 * WebSocket Channels
 * 
 * This module exports all available WebSocket channels.
 * Each channel provides type-safe messaging for a specific feature/domain.
 * 
 * Architecture:
 * Component → Hook → Channel → Service → STOMP Client
 * 
 * Benefits:
 * - Type safety per channel
 * - Separation of concerns
 * - Reusable business logic
 * - Easier testing
 * - Better error handling
 */

import { notificationChannel } from "./notification-channel";

export { BaseChannel } from "./base-channel";

// Notification Channel
export { NotificationChannel, notificationChannel } from "./notification-channel";
export type { NotificationMessage, NotificationSender, SystemNotificationMessage } from "./notification-channel";

/**
 * All available channels as a registry
 */
export const channels = {
	notification: notificationChannel,
} as const;

export type ChannelType = keyof typeof channels;
