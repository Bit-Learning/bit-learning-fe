import type { NotificationMessage } from "@/feature/notification/channel";

export interface NotificationListParams {
	page?: number;
	size?: number;
	sort?: string;
}

// Frontend response after transforming backend API response
export interface NotificationListResponse {
	content: NotificationMessage[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
	first: boolean;
	last: boolean;
}

export interface UnreadCountResponse {
	count: number;
}
