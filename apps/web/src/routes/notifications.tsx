import { createFileRoute } from "@tanstack/react-router";
import { notificationChannel } from "@/feature/notification/channel";
import type { NotificationMessage } from "@/feature/notification/channel";
import { useChannel } from "@/shared/hooks/use-channel";
import {
	useNotifications,
	useMarkAsRead,
	useMarkAllAsRead,
	useDeleteNotification,
} from "@/feature/notification/queries/use-notification-queries";
import { cn } from "@workspace/ui/lib/utils";
import { Bell, Check, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const size = 20;

	// Fetch notifications from API
	const { data, isLoading, refetch } = useNotifications({ page, size });
	const markAsReadMutation = useMarkAsRead();
	const markAllAsReadMutation = useMarkAllAsRead();
	const deleteNotificationMutation = useDeleteNotification();

	// Subscribe to real-time updates
	useChannel<NotificationMessage>({
		channel: notificationChannel,
		onMessage: () => {
			// Refetch when new notification arrives
			refetch();
		},
		autoConnect: true,
		autoSubscribe: true,
	});

	const notifications = data?.content || [];
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const handleNotificationClick = async (notification: NotificationMessage) => {
		// Mark as read if not already read
		if (!notification.isRead) {
			try {
				await markAsReadMutation.mutateAsync(notification.id);
			} catch (error) {
				console.error("Failed to mark as read:", error);
			}
		}

		if (notification.targetUrl) {
			navigate({ to: notification.targetUrl });
		}
	};

	const handleMarkAllRead = async () => {
		try {
			await markAllAsReadMutation.mutateAsync();
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	const handleDelete = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
			try {
				await deleteNotificationMutation.mutateAsync(id);
			} catch (error) {
				console.error("Failed to delete:", error);
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
			<div className="container mx-auto max-w-4xl px-4">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
							Thông báo
						</h1>
						{unreadCount > 0 && (
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Bạn có {unreadCount} thông báo chưa đọc
							</p>
						)}
					</div>
					{unreadCount > 0 && (
						<button
							onClick={handleMarkAllRead}
							disabled={markAllAsReadMutation.isPending}
							className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{markAllAsReadMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CheckCheck className="h-4 w-4" />
							)}
							Đánh dấu tất cả đã đọc
						</button>
					)}
				</div>

				{/* Notifications List */}
				<div className="space-y-3">
					{isLoading ? (
						<div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
							<Loader2 className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4 animate-spin" />
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Đang tải thông báo...
							</p>
						</div>
					) : notifications.length === 0 ? (
						<div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
							<Bell className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
								Chưa có thông báo
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Các thông báo của bạn sẽ xuất hiện ở đây
							</p>
						</div>
					) : (
						notifications.map((notif) => (
							<div
								key={notif.id}
								className={cn(
									"rounded-2xl border bg-white dark:bg-gray-800 p-6 transition-all cursor-pointer",
									"hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800",
									notif.isRead
										? "border-gray-200 dark:border-gray-700"
										: "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10"
								)}
								onClick={() => handleNotificationClick(notif)}
							>
								<div className="flex items-start gap-4">
									{/* Icon/Avatar */}
									<div className="flex-shrink-0">
										{notif.sender?.avatar ? (
											<img
												src={notif.sender.avatar}
												alt={`${notif.sender.firstName} ${notif.sender.lastName}`}
												className="h-12 w-12 rounded-full object-cover"
											/>
										) : (
											<div
												className={cn(
													"h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-medium",
													notif.type === "PAYMENT"
														? "bg-green-500"
														: notif.type === "LEARNING"
															? "bg-purple-500"
															: notif.type === "SYSTEM"
																? "bg-blue-500"
																: "bg-gray-500"
												)}
											>
												{notif.type[0]}
											</div>
										)}
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<h3 className="font-semibold text-gray-900 dark:text-gray-100">
													{notif.title}
													<div className="flex items-center gap-2">
														{!notif.isRead && (
															<div className="flex-shrink-0">
																<div className="h-2 w-2 rounded-full bg-blue-600" />
															</div>
														)}
														<button
															onClick={(e) => handleDelete(notif.id, e)}
															disabled={deleteNotificationMutation.isPending}
															className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
															title="Xóa thông báo"
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div></h3>
												
											</div>
											{!notif.isRead && (
												<div className="flex-shrink-0">
													<div className="h-2 w-2 rounded-full bg-blue-600" />
												</div>
											)}
										</div>

										<p className="mt-2 text-gray-600 dark:text-gray-300">
											{notif.message}
										</p>

										<div className="mt-3 flex items-center justify-between">
											<p className="text-sm text-gray-400 dark:text-gray-500">
												{new Date(notif.createdAt).toLocaleString("vi-VN", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
											<span
												className={cn(
													"text-xs px-3 py-1 rounded-full font-medium",
													notif.type === "INTERACTION"
														? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
														: notif.type === "SYSTEM"
															? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
															: notif.type === "PAYMENT"
																? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
																: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
												)}
											>
												{notif.type}
											</span>
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Pagination */}
				{data && data.totalPages > 1 && (
					<div className="mt-6 flex items-center justify-center gap-2">
						<button
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={data.first || isLoading}
							className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Trước
						</button>
						<span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
							Trang {data.page + 1} / {data.totalPages}
						</span>
						<button
							onClick={() => setPage((p) => p + 1)}
							disabled={data.last || isLoading}
							className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Sau
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
