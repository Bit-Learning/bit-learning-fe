import { notificationChannel } from "./notification-channel";

export { BaseChannel } from "./base-channel";
export {
	NotificationChannel,
	notificationChannel,
	SystemNotificationChannel,
	systemNotificationChannel,
} from "./notification-channel";
export type {
	NotificationMessage,
	NotificationSender,
	SystemNotificationMessage,
} from "./notification-channel";

export const channels = {
	notification: notificationChannel,
} as const;

export type ChannelType = keyof typeof channels;
