import React, { useState } from "react";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import {
	useDeleteNotification,
	useMarkAllAsRead,
	useMarkAsRead,
	useNotifications,
} from "@/feature/notification/queries/use-notification-queries";
import { NotificationMessage } from "@/feature/notification/channel";
import { Pagination } from "@/shared/components/Pagination";

const formatDateTime = (iso: string) => {
	const date = new Date(iso);
	const formattedDate = date.toLocaleDateString("vi-VN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const formattedTime = date.toLocaleTimeString("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${formattedDate} ${formattedTime}`;
};

export const NotificationsContent = () => {
	const [page, setPage] = useState(0);
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
	const size = 10;
	const navigate = useNavigate();

	const { data, isLoading } = useNotifications({ page, size });
	const markAsReadMutation = useMarkAsRead();
	const markAllAsReadMutation = useMarkAllAsRead();
	const deleteNotificationMutation = useDeleteNotification();

	const notifications = (data?.content || []) as NotificationMessage[];
	const totalPages = data?.totalPages || 1;
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const handleNotificationClick = async (notification: NotificationMessage) => {
		if (!notification.isRead) {
			try {
				await markAsReadMutation.mutateAsync(notification.id);
			} catch (error) {
				console.error("Failed to mark as read:", error);
			}
		}
		if (notification.targetUrl) {
			if (
				notification.targetUrl.startsWith("http://") ||
				notification.targetUrl.startsWith("https://")
			) {
				window.open(notification.targetUrl, "_blank");
			} else if (
				notification.targetUrl.includes(".com") ||
				notification.targetUrl.includes(".net") ||
				notification.targetUrl.includes(".org")
			) {
				window.open(`https://${notification.targetUrl}`, "_blank");
			} else {
				let path = notification.targetUrl;
				try {
					const url = new URL(notification.targetUrl);
					path = url.pathname + url.search + url.hash;
				} catch {}
				navigate({ to: path });
			}
		}
	};

	const handleDeleteClick = (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		setConfirmDeleteId(id);
	};

	const handleDeleteConfirm = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirmDeleteId === null) return;
		try {
			await deleteNotificationMutation.mutateAsync(confirmDeleteId);
		} catch (error) {
			console.error("Failed to delete:", error);
		} finally {
			setConfirmDeleteId(null);
		}
	};

	const handleDeleteCancel = (e: React.MouseEvent) => {
		e.stopPropagation();
		setConfirmDeleteId(null);
	};

	return (
		<div className="grow space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
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
						onClick={() => markAllAsReadMutation.mutate()}
						disabled={markAllAsReadMutation.isPending}
						className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{markAllAsReadMutation.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<CheckCheck className="h-4 w-4" />
						)}
						Đánh dấu tất cả là đã đọc
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
									: "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10",
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
															: "bg-gray-500",
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
											</h3>
										</div>
										{!notif.isRead && (
											<div className="flex-shrink-0">
												<div className="h-2 w-2 rounded-full bg-primary" />
											</div>
										)}
									</div>

									<p className="mt-2 text-gray-600 dark:text-gray-300">
										{notif.message}
									</p>

									<div className="mt-3 flex items-center justify-between">
										<p className="text-sm text-gray-400 dark:text-gray-500">
											{formatDateTime(notif.createdAt)}
										</p>

										{confirmDeleteId === notif.id ? (
											<div
												className="flex items-center gap-2"
												onClick={(e) => e.stopPropagation()}
											>
												<span className="text-sm text-gray-500 dark:text-gray-400">
													Xóa thông báo?
												</span>
												<button
													onClick={handleDeleteConfirm}
													disabled={deleteNotificationMutation.isPending}
													className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
												>
													{deleteNotificationMutation.isPending ? (
														<Loader2 className="h-3 w-3 animate-spin" />
													) : null}
													Xóa
												</button>
												<button
													onClick={handleDeleteCancel}
													className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
												>
													Hủy
												</button>
											</div>
										) : (
											<button
												onClick={(e) => handleDeleteClick(notif.id, e)}
												className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
												title="Xóa thông báo"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Pagination */}
			{notifications.length > 0 && totalPages > 1 && (
				<div className="flex items-center justify-between pt-2">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Trang {page + 1} / {totalPages}
					</p>
					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</div>
			)}
		</div>
	);
};
