import React, { useState } from "react";
import {
	Bell,
	Settings,
	MessageSquare,
	Award,
	DollarSign,
	Megaphone,
	Users,
	ChevronDown,
	Trash2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import {
	useDeleteNotification,
	useMarkAllAsRead,
	useMarkAsRead,
	useNotifications,
} from "@/feature/notification/queries/use-notification-queries";
import { NotificationMessage } from "@/feature/notification/channel";

export const NotificationsContent = () => {
	const [page, setPage] = useState(0);
	const size = 10;
	const navigate = useNavigate();

	const { data, isLoading } = useNotifications({ page, size });
	const markAsReadMutation = useMarkAsRead();
	const markAllAsReadMutation = useMarkAllAsRead();
	const deleteNotificationMutation = useDeleteNotification();

	const notifications = (data?.content || []) as NotificationMessage[];
	const totalPages = data?.totalPages || 1;

	const getNotificationIcon = (type: string) => {
		const icons = {
			COMMENT: {
				Icon: MessageSquare,
				color: "text-primary",
				bg: "bg-blue-100",
			},
			BADGE: { Icon: Award, color: "text-[#f7941e]", bg: "bg-orange-100" },
			PAYMENT: {
				Icon: DollarSign,
				color: "text-green-600",
				bg: "bg-green-100",
			},
			ANNOUNCEMENT: {
				Icon: Megaphone,
				color: "text-slate-500",
				bg: "bg-slate-100",
			},
			INVITE: { Icon: Users, color: "text-slate-500", bg: "bg-slate-100" },
		};
		return icons[type as keyof typeof icons] || icons.ANNOUNCEMENT;
	};

	const handleNotificationClick = async (notification: NotificationMessage) => {
		// Mark as read if unread
		if (!notification.isRead) {
			try {
				await markAsReadMutation.mutateAsync(notification.id);
			} catch (error) {
				console.error("Failed to mark as read:", error);
			}
		}

		// Navigate to target URL if exists
		if (notification.targetUrl) {
			// Check if it's an external URL
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
				// Domain without protocol
				window.open(`https://${notification.targetUrl}`, "_blank");
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

	const handleLoadMore = () => {
		setPage((prev) => Math.min(prev + 1, totalPages - 1));
	};

	return (
		<div className="grow space-y-6">
			<Card>
				<div className="p-8 border-b border-slate-50 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
							<Bell className="w-5 h-5 text-primary" />
						</div>
						<h2 className="text-xl font-bold text-slate-900">Thông báo</h2>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="text-primary"
							onClick={() => markAllAsReadMutation.mutate()}
							isDisabled={markAllAsReadMutation.isPending}
						>
							Đánh dấu đã đọc tất cả
						</Button>
						<Button variant="outline" size="sm">
							<Settings className="w-5 h-5" />
						</Button>
					</div>
				</div>

				<div className="p-8 space-y-4">
					{isLoading ? (
						<div className="text-center py-12 text-slate-500">Đang tải...</div>
					) : notifications.length === 0 ? (
						<div className="text-center py-12 text-slate-500">
							Không có thông báo nào
						</div>
					) : (
						notifications.map((notif) => {
							const { Icon, color, bg } = getNotificationIcon(notif.type);
							return (
								<div
									key={notif.id}
									className={`flex gap-4 p-5 rounded-xl border transition-all cursor-pointer hover:border-primary/20 hover:bg-slate-50 group ${
										!notif.isRead
											? "bg-blue-50/50 border-blue-100"
											: "border-slate-100"
									}`}
									onClick={() => handleNotificationClick(notif)}
								>
									<div
										className={`size-12 rounded-full shrink-0 ${bg} flex items-center justify-center ${color}`}
									>
										<Icon className="w-6 h-6" />
									</div>
									<div className="grow min-w-0">
										<div className="flex items-start justify-between gap-4 mb-1">
											<h4 className="font-bold text-slate-900 grow">
												{notif.title}
											</h4>
											<div className="flex items-center gap-2 shrink-0">
												<span className="text-xs font-medium text-slate-400">
													{new Date(notif.createdAt).toLocaleDateString(
														"vi-VN",
													)}
												</span>
												<Button
													variant="ghost"
													size="sm"
													className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
													onClick={(e) => handleDelete(notif.id, e)}
												>
													<Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
												</Button>
											</div>
										</div>
										<p className="text-[14px] text-slate-600 leading-relaxed">
											{notif.message}
										</p>
										{!notif.isRead && (
											<div className="mt-2">
												<div className="size-2 rounded-full bg-primary inline-block" />
											</div>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>

				{notifications.length > 0 && (
					<div className="p-6 border-t border-slate-50">
						<div className="flex items-center justify-between">
							<p className="text-sm text-slate-500">
								Trang {page + 1} / {totalPages}
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(0, p - 1))}
									isDisabled={page === 0}
								>
									<ChevronLeft className="w-5 h-5" />
								</Button>
								{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									const p = page - 2 + i;
									if (p < 0 || p >= totalPages) return null;
									return (
										<Button
											key={p}
											variant={page === p ? "default" : "outline"}
											size="sm"
											onClick={() => setPage(p)}
										>
											{p + 1}
										</Button>
									);
								})}
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setPage((p) => Math.min(totalPages - 1, p + 1))
									}
									isDisabled={page === totalPages - 1}
								>
									<ChevronRight className="w-5 h-5" />
								</Button>
							</div>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
};
