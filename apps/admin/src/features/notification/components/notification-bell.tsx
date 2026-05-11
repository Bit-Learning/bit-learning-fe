import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/components/Sonner";
import { useChannel } from "@/shared/hooks/use-channel";
import {
	useNotifications,
	useUnreadCount,
	useMarkAllAsRead,
	useMarkAsRead,
} from "@/features/notification/queries/use-notification-queries";
import {
	notificationChannel,
	type NotificationMessage,
} from "@/features/notification/channel";

export function NotificationBell() {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	const { data: unreadCountFromApi = 0, refetch: refetchUnreadCount } =
		useUnreadCount();
	const [localUnreadCount, setLocalUnreadCount] = useState(0);

	const { data: notificationsData, refetch: refetchNotifications } =
		useNotifications({
			page: 0,
			size: 5,
			sort: "createdAt,DESC",
		});

	const markAsReadMutation = useMarkAsRead();
	const markAllAsReadMutation = useMarkAllAsRead();

	useEffect(() => {
		setLocalUnreadCount(unreadCountFromApi);
	}, [unreadCountFromApi]);

	useChannel<NotificationMessage>({
		channel: notificationChannel,
		onMessage: (notification) => {
			const toastFn =
				notification.type === "PAYMENT"
					? toast.success
					: notification.type === "LEARNING" ||
							notification.type === "SYSTEM" ||
							notification.type === "INTERACTION"
						? toast.info
						: toast.info;

			toastFn({
				title: notification.title,
				description: notification.message,
			});

			if (!notification.isRead) {
				setLocalUnreadCount((prev) => prev + 1);
				refetchUnreadCount();
				refetchNotifications();
			}
		},
		autoConnect: true,
		autoSubscribe: true,
	});

	const recentNotifications = notificationsData?.content || [];

	const handleNotificationClick = async (notification: NotificationMessage) => {
		if (!notification.isRead) {
			try {
				await markAsReadMutation.mutateAsync(notification.id);
				setLocalUnreadCount((prev) => Math.max(0, prev - 1));
			} catch (error) {
				console.error("Failed to mark as read:", error);
			}
		}

		if (notification.targetUrl) {
			let path = notification.targetUrl;

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
				try {
					const url = new URL(notification.targetUrl);
					path = url.pathname + url.search + url.hash;
				} catch {
					// ignore, use as-is
				}
				navigate({ to: path });
			}
			setIsOpen(false);
		}
	};

	const handleMarkAllRead = async () => {
		try {
			await markAllAsReadMutation.mutateAsync();
			setLocalUnreadCount(0);
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	const containerRef = useRef<HTMLDivElement | null>(null);

	const handleClickOutside = useCallback((e: MouseEvent) => {
		if (
			containerRef.current &&
			!containerRef.current.contains(e.target as Node)
		) {
			setIsOpen(false);
		}
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, handleClickOutside]);

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					"relative rounded-xl p-2 transition-all duration-200",
					"backdrop-blur-sm hover:bg-slate-100/80 dark:hover:bg-slate-800/70",
					isOpen && "bg-slate-100/80 dark:bg-slate-800/70",
				)}
			>
				<Bell className="h-6 w-6 text-slate-600 dark:text-slate-300" />
				{localUnreadCount > 0 && (
					<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-medium text-white">
						{localUnreadCount > 99 ? "99+" : localUnreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_8px_32px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_8px_32px_rgba(2,6,23,0.6)]">
					<div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-slate-800/80">
						<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
							Thông báo
						</h3>
						{localUnreadCount > 0 && (
							<button
								type="button"
								onClick={handleMarkAllRead}
								disabled={markAllAsReadMutation.isPending}
								className="text-xs font-medium text-sky-600 hover:text-sky-700 disabled:opacity-50"
							>
								Đánh dấu đã đọc
							</button>
						)}
					</div>

					<div className="max-h-80 overflow-y-auto">
						{recentNotifications.length === 0 ? (
							<div className="flex flex-col items-center justify-center px-6 py-10 text-center">
								<Bell className="mb-2 h-10 w-10 text-slate-300 dark:text-slate-700" />
								<p className="text-sm text-slate-500 dark:text-slate-400">
									Chưa có thông báo nào
								</p>
							</div>
						) : (
							recentNotifications.map((notif) => (
								<button
									key={notif.id}
									type="button"
									className={cn(
										"w-full cursor-pointer border-b border-slate-100 px-4 py-3 text-left transition-colors dark:border-slate-800",
										"hover:bg-slate-50 dark:hover:bg-slate-900/70",
										!notif.isRead && "bg-sky-50/60 dark:bg-sky-950/30",
									)}
									onClick={() => handleNotificationClick(notif)}
								>
									<div className="flex items-start gap-3">
										{!notif.isRead && (
											<div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-sky-500" />
										)}

										<div className="flex-1 min-w-0">
											<p
												className={cn(
													"text-sm font-semibold",
													!notif.isRead
														? "text-slate-900 dark:text-slate-100"
														: "text-slate-600 dark:text-slate-300",
												)}
											>
												{notif.title}
											</p>
											<p
												className={cn(
													"mt-0.5 text-sm line-clamp-2",
													!notif.isRead
														? "text-slate-700 dark:text-slate-300"
														: "text-slate-500 dark:text-slate-400",
												)}
											>
												{notif.message}
											</p>
											<p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
												{new Date(notif.createdAt).toLocaleString("vi-VN")}
											</p>
										</div>
									</div>
								</button>
							))
						)}
					</div>

					{recentNotifications.length > 0 && (
						<div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2.5 text-center dark:border-slate-800 dark:bg-slate-900/90">
							<button
								type="button"
								onClick={() => {
									navigate({ to: "/settings/notifications" });
									setIsOpen(false);
								}}
								className="text-xs font-medium text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
							>
								Xem tất cả thông báo
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
