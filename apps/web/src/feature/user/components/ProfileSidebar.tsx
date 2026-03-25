import React, { useState } from "react";
import {
	User,
	Lock,
	History,
	Bell,
	BookOpen,
	Wallet,
	Shield,
	UserX,
} from "lucide-react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { Card } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@workspace/ui/components/Avatar";
import { Switch } from "@workspace/ui/components/Switch";
import { cn } from "@workspace/ui/lib/utils";
import type { TUserProfile } from "../types/user.type";
import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { useToggleMfa, useDeactivateAccount } from "../queries/useUser";

interface ProfileSidebarProps {
	unreadCount?: number;
	userInfo?: TUserProfile;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
	unreadCount = 0,
	userInfo,
}) => {
	const matchRoute = useMatchRoute();
	const toggleMfaMutation = useToggleMfa();
	const deactivateMutation = useDeactivateAccount();
	const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

	const menuItems = [
		{
			id: "profile",
			icon: User,
			label: "Thông tin cá nhân",
			badge: null,
			to: "/profile",
		},
		{
			id: "top-up",
			icon: Wallet,
			label: "Nạp xu BIT",
			badge: null,
			to: "/profile/top-up",
		},
		{
			id: "my-course",
			icon: BookOpen,
			label: "Khóa học của tôi",
			badge: null,
			to: "/profile/my-course",
		},
		{
			id: "password",
			icon: Lock,
			label: "Đổi mật khẩu",
			badge: null,
			to: "/profile/password",
		},
		{
			id: "history",
			icon: History,
			label: "Lịch sử giao dịch",
			badge: null,
			to: "/profile/history",
		},
		{
			id: "notifications",
			icon: Bell,
			label: "Thông báo",
			badge: unreadCount || null,
			to: "/profile/notifications",
		},
	];

	const handleMfaToggle = () => {
		if (userInfo) {
			toggleMfaMutation.mutate(!userInfo.mfaEnabled);
		}
	};

	const handleDeactivate = () => {
		deactivateMutation.mutate();
		setShowDeactivateConfirm(false);
	};

	return (
		<aside className="w-full lg:w-70 shrink-0 lg:sticky lg:top-28">
			<Card className="overflow-hidden">
				<div className="p-3 border-b border-slate-50 flex items-center gap-3">
					<Avatar className="size-12">
						<AvatarImage
							src={
								userInfo?.avatar ||
								"https://api.dicebear.com/9.x/adventurer/svg?seed=User"
							}
						/>
						<AvatarFallback>
							{userInfo?.firstName?.charAt(0) || "U"}
						</AvatarFallback>
					</Avatar>
					<div className="overflow-hidden">
						<h3 className="font-bold text-slate-900 truncate">
							{(userInfo?.firstName || "") + " " + (userInfo?.lastName || "") ||
								"Người dùng"}
						</h3>
						<p className="text-xs text-slate-500 mt-1">
							Học viên tại bit learning
						</p>
					</div>
				</div>
				<div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2 bg-amber-50">
					<BitCoinIcon size={32} />
					<div className="flex flex-col leading-tight">
						<span className="text-[11px] text-slate-500 font-medium">
							Số dư xu
						</span>
						<span className="text-base font-bold text-amber-700">
							{userInfo?.wallet?.balance?.toLocaleString("vi-VN") ?? 0}{" "}
							<span className="text-xs font-semibold text-amber-500">BIT</span>
						</span>
					</div>
					<Link
						to="/profile/top-up"
						className="ml-auto text-[11px] font-semibold text-primary hover:underline"
					>
						+ Nạp thêm
					</Link>
				</div>

				<nav className="p-4 space-y-1">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = matchRoute({ to: item.to, fuzzy: false });
						return (
							<Link
								key={item.id}
								to={item.to}
								className={cn(
									"flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-[15px] w-full",
									isActive
										? "bg-primary text-white shadow-md shadow-primary/20"
										: "text-slate-600 hover:bg-slate-50",
								)}
							>
								<Icon className="w-5 h-5" />
								<span>{item.label}</span>
								{item.badge && (
									<Badge
										variant={isActive ? "secondary" : "destructive"}
										className={cn(
											"ml-auto text-[10px]",
											isActive && "bg-white text-primary",
										)}
									>
										{item.badge}
									</Badge>
								)}
							</Link>
						);
					})}
				</nav>

				{/* MFA Toggle */}
				<div className="px-4 py-3 border-t border-slate-100">
					<div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 transition-all">
						<div className="flex items-center gap-3">
							<Shield className="w-5 h-5 text-emerald-600" />
							<div>
								<span className="text-[15px] font-medium text-slate-600">
									Xác thực 2 lớp
								</span>
								<p className="text-[11px] text-slate-400">
									{userInfo?.mfaEnabled ? "Đang bật" : "Đang tắt"}
								</p>
							</div>
						</div>
						<Switch
							isSelected={userInfo?.mfaEnabled ?? false}
							onChange={handleMfaToggle}
							isDisabled={toggleMfaMutation.isPending}
							aria-label="Toggle MFA"
						/>
					</div>
				</div>

				{/* Deactivate Account */}
				<div className="px-4 pb-4 border-t border-slate-100 pt-3">
					{!showDeactivateConfirm ? (
						<button
							onClick={() => setShowDeactivateConfirm(true)}
							className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-[15px] w-full text-red-500 hover:bg-red-50"
						>
							<UserX className="w-5 h-5" />
							<span>Vô hiệu hóa tài khoản</span>
						</button>
					) : (
						<div className="bg-red-50 rounded-xl p-4 space-y-3">
							<p className="text-sm text-red-700">
								Bạn có chắc chắn muốn vô hiệu hóa tài khoản? Tài khoản sẽ bị tạm
								khóa.
							</p>
							<div className="flex gap-2">
								<button
									onClick={handleDeactivate}
									disabled={deactivateMutation.isPending}
									className="flex-1 bg-red-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
								>
									{deactivateMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
								</button>
								<button
									onClick={() => setShowDeactivateConfirm(false)}
									className="flex-1 bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-300 transition-colors"
								>
									Hủy
								</button>
							</div>
						</div>
					)}
				</div>
			</Card>
		</aside>
	);
};
