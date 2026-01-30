import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useNotifications, useMarkAsRead, useDeleteNotification } from "@/feature/notification/queries/use-notification-queries";
import type { NotificationMessage } from "@/feature/notification/channel";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { Bell, Trash2 } from "lucide-react";

export function NotificationsList() {
	const [page, setPage] = useState(0);
	const size = 10;
	const navigate = useNavigate();

	const { data, isLoading } = useNotifications({ page, size });
	const markAsReadMutation = useMarkAsRead();
	const deleteNotificationMutation = useDeleteNotification();

	const notifications = data?.content || [];

	const handleNotificationClick = async (notification: NotificationMessage) => {
		if (!notification.isRead) {
			try {
				await markAsReadMutation.mutateAsync(notification.id);
			} catch (error) {
				console.error("Failed to mark as read:", error);
			}
		}

		if (notification.targetUrl) {
			// Check if it's an external URL
			if (notification.targetUrl.startsWith('http://') || notification.targetUrl.startsWith('https://')) {
				window.open(notification.targetUrl, '_blank');
			} else if (notification.targetUrl.includes('.com') || notification.targetUrl.includes('.net') || notification.targetUrl.includes('.org')) {
				// Domain without protocol
				window.open(`https://${notification.targetUrl}`, '_blank');
			} else {
				// Internal route - extract pathname if it's a full URL with localhost
				let path = notification.targetUrl;
				try {
					const url = new URL(notification.targetUrl);
					path = url.pathname + url.search + url.hash;
				} catch {
					// If it's not a valid URL, use as-is (already a path)
				}
				navigate({ to: path });
			}
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
		<Card>
			<CardContent className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-semibold">Thông báo</h3>
					{notifications.length > 0 && (
						<Badge variant="secondary">{notifications.length} thông báo</Badge>
					)}
				</div>

				{isLoading ? (
					<Loader />
				) : notifications.length === 0 ? (
					<div className="text-muted-foreground py-8 text-center">
						<Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<p className="mb-2 text-lg font-medium">Chưa có thông báo</p>
						<p className="text-sm">Các thông báo của bạn sẽ xuất hiện ở đây</p>
					</div>
				) : (
					<div className="space-y-3">
						{notifications.map((notif) => (
							<div
								key={notif.id}
								className={`rounded-lg border p-4 transition-all cursor-pointer hover:shadow-md ${notif.isRead
									? "border-gray-200 dark:border-gray-700"
									: "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10"
									}`}
								onClick={() => handleNotificationClick(notif)}
							>
								<div className="flex items-start gap-3">
									{/* Icon/Avatar */}
									<div className="flex-shrink-0">
										{notif.sender?.avatar ? (
											<img
												src={notif.sender.avatar}
												alt={`${notif.sender.firstName} ${notif.sender.lastName}`}
												className="h-10 w-10 rounded-full object-cover"
											/>
										) : (
											<div
												className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${notif.type === "PAYMENT"
													? "bg-green-500"
													: notif.type === "LEARNING"
														? "bg-purple-500"
														: notif.type === "SYSTEM"
															? "bg-blue-500"
															: "bg-gray-500"
													}`}
											>
												{notif.type[0]}
											</div>
										)}
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h4 className="font-semibold text-sm">{notif.title}</h4>
													{!notif.isRead && (
														<div className="h-2 w-2 rounded-full bg-blue-600" />
													)}
												</div>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
													{notif.sender?.firstName || notif.sender?.lastName ? (
														<span>
															Từ: {notif.sender.firstName} {notif.sender.lastName}
														</span>
													) : (
														<span>Từ: Hệ thống</span>
													)}
												</p>
												<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
													{notif.message}
												</p>
												<div className="flex items-center justify-between mt-2">
													<p className="text-xs text-gray-400">
														{new Date(notif.createdAt).toLocaleString("vi-VN", {
															month: "short",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</p>
													<span
														className={`text-xs px-2 py-0.5 rounded-full font-medium ${notif.type === "INTERACTION"
															? "bg-gray-100 text-gray-600"
															: notif.type === "SYSTEM"
																? "bg-blue-100 text-blue-600"
																: notif.type === "PAYMENT"
																	? "bg-green-100 text-green-600"
																	: "bg-purple-100 text-purple-600"
															}`}
													>
														{notif.type}
													</span>
												</div>
											</div>
											<button
												onClick={(e) => handleDelete(notif.id, e)}
												disabled={deleteNotificationMutation.isPending}
												className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
												title="Xóa thông báo"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{data && data.totalPages > 1 && (
					<div className="mt-4 flex items-center justify-center gap-2">
						<Button
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={data.first || isLoading}
							variant="outline"
							size="sm"
						>
							Trước
						</Button>
						<span className="text-sm text-gray-600">
							Trang {data.page + 1} / {data.totalPages}
						</span>
						<Button
							onClick={() => setPage((p) => p + 1)}
							disabled={data.last || isLoading}
							variant="outline"
							size="sm"
						>
							Sau
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
