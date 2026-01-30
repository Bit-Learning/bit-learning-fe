import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/feature/notification/api/notification.api";
import type { NotificationListParams } from "@/feature/notification/api/notification.type";
import { toast } from "@workspace/ui/components/Sonner";

export const NOTIFICATION_QUERY_KEYS = {
    all: ["notifications"] as const,
    list: (params: NotificationListParams) => ["notifications", "list", params] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
};

/**
 * Get list of notifications
 */
export function useNotifications(params: NotificationListParams = {}) {
    return useQuery({
        queryKey: NOTIFICATION_QUERY_KEYS.list(params),
        queryFn: () => notificationApi.getNotifications(params),
    });
}

/**
 * Get unread count
 */
export function useUnreadCount() {
    return useQuery({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
        queryFn: () => notificationApi.getUnreadCount(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

/**
 * Mark notification as read
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => notificationApi.markAsRead(id),
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
        },
        onError: () => {
            toast.error("Không thể đánh dấu đã đọc");
        },
    });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: () => {
            toast.success("Đã đánh dấu tất cả đã đọc");
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
        },
        onError: () => {
            toast.error("Không thể đánh dấu tất cả đã đọc");
        },
    });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => notificationApi.deleteNotification(id),
        onSuccess: () => {
            toast.success("Đã xóa thông báo");
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
        },
        onError: () => {
            toast.error("Không thể xóa thông báo");
        },
    });
}
