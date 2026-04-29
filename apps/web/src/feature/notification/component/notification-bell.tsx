import { notificationChannel } from "@/feature/notification/channel";
import type { NotificationMessage } from "@/feature/notification/channel";
import { useChannel } from "@/shared/hooks/use-channel";
import {
	useUnreadCount,
	useMarkAllAsRead,
	useMarkAsRead,
	useNotifications,
} from "@/feature/notification/queries/use-notification-queries";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "@/shared/components/Sonner";
import { Bell } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";

export function NotificationBell() {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	// Get unread count from API
	const { data: unreadCountFromApi = 0, refetch: refetchUnreadCount } =
		useUnreadCount();
	const [localUnreadCount, setLocalUnreadCount] = useState(0);

	// Fetch last 5 notifications from API
	const { data: notificationsData, refetch: refetchNotifications } =
		useNotifications({
			page: 0,
			size: 5,
			sort: "createdAt,DESC",
		});

	const markAsReadMutation = useMarkAsRead();
	const markAllAsReadMutation = useMarkAllAsRead();

	// Sync local count with API count
	useEffect(() => {
		setLocalUnreadCount(unreadCountFromApi);
	}, [unreadCountFromApi]);

	// Subscribe to WebSocket for real-time updates
	useChannel<NotificationMessage>({
		channel: notificationChannel,
		onMessage: (notification) => {
			// Show toast notification
			const toastFn =
				notification.type === "PAYMENT"
					? toast.success
					: notification.type === "LEARNING"
						? toast.info
						: notification.type === "SYSTEM"
							? toast.info
							: toast.info; // INTERACTION

			toastFn({
				title: notification.title,
				description: notification.message,
			});

			// Increment local unread count for immediate UI feedback
			if (!notification.isRead) {
				setLocalUnreadCount((prev) => prev + 1);
				// Refetch data to get latest notifications
				refetchUnreadCount();
				refetchNotifications();
			}
		},
		autoConnect: true,
		autoSubscribe: true,
	});

	// Get notifications from API data
	const recentNotifications = notificationsData?.content || [];

	const handleNotificationClick = async (notification: NotificationMessage) => {
		// Mark as read if not already read
		if (!notification.isRead) {
			try {
				await markAsReadMutation.mutateAsync(notification.id);
				setLocalUnreadCount((prev) => Math.max(0, prev - 1));
			} catch (error) {
				console.error("Failed to mark as read:", error);
			}
		}

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

	const containerRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
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
				onClick={() => setIsOpen(!isOpen)}
				className="relative rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
			>
				<Bell className="h-7 w-7 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors" />
				{localUnreadCount > 0 && (
					<span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-inter text-white">
						{localUnreadCount > 99 ? "99+" : localUnreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<>
					{/* Dropdown */}
					<div className="absolute right-0 top-full mt-2 z-50 w-96 flex flex-col rounded-2xl border border-white/40 dark:border-white/20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
						{/* Header */}
						<div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 p-4">
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">
								Thông báo
							</h3>
							{localUnreadCount > 0 && (
								<button
									onClick={handleMarkAllRead}
									disabled={markAllAsReadMutation.isPending}
									className="text-sm text-primary hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 hover:cursor-pointer"
								>
									Đánh dấu đã đọc
								</button>
							)}
						</div>

						{/* Notifications List */}
						<div className="max-h-80 overflow-y-auto">
							{recentNotifications.length === 0 ? (
								<div className="p-8 text-center">
									<Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Chưa có thông báo nào
									</p>
								</div>
							) : (
								recentNotifications.map((notif) => (
									<div
										key={notif.id}
										className={cn(
											"border-b border-gray-200/50 dark:border-gray-700/50 p-4",
											"hover:bg-gray-50/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors",
											!notif.isRead && "bg-blue-50/70 dark:bg-blue-900/20",
										)}
										onClick={() => handleNotificationClick(notif)}
									>
										<div className="flex items-start gap-3">
											{/* Unread Indicator Dot */}
											{!notif.isRead && (
												<div className="h-2 w-2 rounded-full bg-blue-500 mt-4 flex-shrink-0" />
											)}

											{/* Avatar or Icon */}
											{notif.sender?.avatar ? (
												<img
													src={notif.sender.avatar}
													alt={`${notif.sender.firstName} ${notif.sender.lastName}`}
													className="h-10 w-10 rounded-full object-cover flex-shrink-0"
												/>
											) : (
												<div
													className={cn(
														"h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0",
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

											{/* Content */}
											<div className="flex-1 min-w-0">
												<p
													className={cn(
														"font-semibold text-sm",
														!notif.isRead
															? "text-gray-900 dark:text-gray-100"
															: "text-gray-600 dark:text-gray-400",
													)}
												>
													{notif.title}
												</p>
												{notif.sender && (
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
														từ {notif.sender.firstName} {notif.sender.lastName}
													</p>
												)}
												<p
													className={cn(
														"text-sm mt-1 line-clamp-2",
														!notif.isRead
															? "text-gray-700 dark:text-gray-200"
															: "text-gray-500 dark:text-gray-400",
													)}
												>
													{notif.message}
												</p>
												<div className="flex items-center justify-between mt-2">
													<p className="text-xs text-gray-400 dark:text-gray-500">
														{new Date(notif.createdAt).toLocaleString("vi-VN")}
													</p>
													{/* <span
														className={cn(
															"text-xs px-2 py-0.5 rounded-full font-medium",
															notif.type === "INTERACTION"
																? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
																: notif.type === "SYSTEM"
																	? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
																	: notif.type === "PAYMENT"
																		? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
																		: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
														)}
													>
														{notif.type}
													</span> */}
												</div>
											</div>
										</div>
									</div>
								))
							)}
						</div>

						{/* Footer */}
						{recentNotifications.length > 0 && (
							<div className="border-t border-gray-200/50 dark:border-gray-700/50 p-3">
								<button
									onClick={() => {
										navigate({ to: "/notifications" });
										setIsOpen(false);
									}}
									className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
								>
									Xem tất cả thông báo
								</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
