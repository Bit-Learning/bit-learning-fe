import api from "../../../shared/api/api";
import type { ApiResponse } from "../../../shared/api/api.type";
import type {
	NotificationListParams,
	NotificationListResponse,
} from "./notification.type";
import type { NotificationMessage } from "../channel";

const NOTIFICATION_BASE_URL = "/notifications";

export const notificationApi = {
	/**
	 * Get list of notifications with pagination
	 */
	async getNotifications(
		params: NotificationListParams = {},
	): Promise<NotificationListResponse> {
		const { page = 0, size = 10, sort = "createdAt,DESC" } = params;

		const response = await api.get<ApiResponse<NotificationMessage[]>>(
			NOTIFICATION_BASE_URL,
			{
				params: {
					page,
					size,
					sort,
				},
			},
		);

		// Backend returns: ApiResponse<NotificationMessage[]> with nested page info
		// Transform to flat NotificationListResponse for frontend
		const notifications = response.data.data || [];
		const pageInfo = response.data.page;

		return {
			content: notifications,
			page: pageInfo?.page ?? 0,
			size: pageInfo?.size ?? size,
			totalElements: pageInfo?.totalElements ?? 0,
			totalPages: pageInfo?.totalPages ?? 0,
			first: pageInfo?.first ?? true,
			last: pageInfo?.last ?? true,
		};
	},

	/**
	 * Get unread notifications count
	 */
	async getUnreadCount(): Promise<number> {
		const response = await api.get<ApiResponse<number>>(
			`${NOTIFICATION_BASE_URL}/unread-count`,
		);
		return response.data.data || 0;
	},

	/**
	 * Mark a notification as read
	 */
	async markAsRead(id: number): Promise<void> {
		await api.patch(`${NOTIFICATION_BASE_URL}/${id}/read`);
	},

	/**
	 * Mark all notifications as read
	 */
	async markAllAsRead(): Promise<void> {
		await api.patch(`${NOTIFICATION_BASE_URL}/read-all`);
	},

	/**
	 * Delete a notification
	 */
	async deleteNotification(id: number): Promise<void> {
		await api.delete(`${NOTIFICATION_BASE_URL}/${id}`);
	},
};
