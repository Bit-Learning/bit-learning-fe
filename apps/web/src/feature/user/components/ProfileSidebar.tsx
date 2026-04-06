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
	Copy,
	Check,
	X,
	CreditCard,
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
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
import type { TUserProfile } from "../types/user.type";
import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { useDeactivateAccount } from "../queries/useUser";
import { useEnable2FA, useVerify2FA, useDisable2FA } from "../queries/useMfa";

interface ProfileSidebarProps {
	unreadCount?: number;
	userInfo?: TUserProfile;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
	unreadCount = 0,
	userInfo,
}) => {
	const matchRoute = useMatchRoute();
	const deactivateMutation = useDeactivateAccount();
	const enable2FAMutation = useEnable2FA();
	const verify2FAMutation = useVerify2FA();
	const disable2FAMutation = useDisable2FA();

	const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
	const [showMfaSetup, setShowMfaSetup] = useState(false);
	const [mfaSetupData, setMfaSetupData] = useState<{
		secret: string;
		qrCodeUrl: string;
	} | null>(null);
	const [totpCode, setTotpCode] = useState("");
	const [copied, setCopied] = useState(false);

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
			label: "Lịch sử mua hàng",
			badge: null,
			to: "/profile/history",
		},
		{
			id: "deposit",
			icon: CreditCard,
			label: "Lịch sử nạp tiền",
			badge: null,
			to: "/profile/deposit",
		},
		{
			id: "notifications",
			icon: Bell,
			label: "Thông báo",
			badge: unreadCount || null,
			to: "/profile/notifications",
		},
	];

	const handleMfaToggle = async () => {
		if (!userInfo) return;

		if (userInfo.mfaEnabled) {
			// Disable 2FA
			disable2FAMutation.mutate();
		} else {
			// Enable 2FA — call backend to get QR code
			enable2FAMutation.mutate(undefined, {
				onSuccess: (data) => {
					setMfaSetupData(data);
					setShowMfaSetup(true);
					setTotpCode("");
				},
			});
		}
	};

	const handleVerifyTotp = () => {
		if (totpCode.length !== 6) return;
		verify2FAMutation.mutate(totpCode, {
			onSuccess: () => {
				setShowMfaSetup(false);
				setMfaSetupData(null);
				setTotpCode("");
			},
		});
	};

	const handleCancelSetup = () => {
		// User cancelled — disable the secret that was just set
		disable2FAMutation.mutate();
		setShowMfaSetup(false);
		setMfaSetupData(null);
		setTotpCode("");
	};

	const handleCopySecret = () => {
		if (mfaSetupData?.secret) {
			navigator.clipboard.writeText(mfaSetupData.secret);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleDeactivate = () => {
		deactivateMutation.mutate();
		setShowDeactivateConfirm(false);
	};

	const isMfaLoading =
		enable2FAMutation.isPending ||
		verify2FAMutation.isPending ||
		disable2FAMutation.isPending;

	return (
		<>
			<aside className="w-full lg:w-70 shrink-0 lg:sticky lg:top-28">
				<Card className="overflow-hidden">
					<div className="p-3 border-b border-slate-50 flex items-center gap-3">
						<Avatar className="size-16">
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
								{(userInfo?.firstName || "") +
									" " +
									(userInfo?.lastName || "") || "Người dùng"}
							</h3>
							<p className="text-xs text-slate-500 mt-1">
								Học viên tại Bit Learning
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
								<span className="text-xs font-semibold text-amber-500">
									BIT
								</span>
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

						{/* MFA Toggle */}
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
								isDisabled={isMfaLoading}
								aria-label="Toggle MFA"
							/>
						</div>

						{/* Deactivate Account */}
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
									Bạn có chắc chắn muốn vô hiệu hóa tài khoản? Tài khoản sẽ bị
									tạm khóa.
								</p>
								<div className="flex gap-2">
									<button
										onClick={handleDeactivate}
										disabled={deactivateMutation.isPending}
										className="flex-1 bg-red-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
									>
										{deactivateMutation.isPending
											? "Đang xử lý..."
											: "Xác nhận"}
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
					</nav>
				</Card>
			</aside>

			{/* MFA Setup Dialog (overlay) */}
			{showMfaSetup && mfaSetupData && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
						<button
							onClick={handleCancelSetup}
							className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
							aria-label="Đóng"
						>
							<X className="w-5 h-5" />
						</button>

						<div className="text-center mb-6">
							<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
								<Shield className="h-7 w-7 text-emerald-600" />
							</div>
							<h2 className="text-lg font-bold text-slate-900">
								Thiết lập xác thực 2 lớp
							</h2>
							<p className="text-sm text-slate-500 mt-1">
								Quét mã QR bằng ứng dụng xác thực (Google Authenticator,
								Authy...)
							</p>
						</div>

						{/* QR Code */}
						<div className="flex justify-center mb-5">
							<div className="bg-white p-3 rounded-xl border-2 border-slate-100">
								<img
									src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaSetupData.qrCodeUrl)}`}
									alt="QR Code for 2FA setup"
									className="w-48 h-48"
								/>
							</div>
						</div>

						{/* Manual entry key */}
						<div className="mb-5">
							<p className="text-xs text-slate-500 mb-2 text-center">
								Hoặc nhập mã thủ công vào ứng dụng:
							</p>
							<div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
								<code className="flex-1 text-sm font-mono text-slate-700 break-all select-all">
									{mfaSetupData.secret}
								</code>
								<button
									onClick={handleCopySecret}
									className="shrink-0 p-1.5 rounded-md hover:bg-slate-200 transition-colors"
									aria-label="Copy secret"
								>
									{copied ? (
										<Check className="w-4 h-4 text-emerald-600" />
									) : (
										<Copy className="w-4 h-4 text-slate-400" />
									)}
								</button>
							</div>
						</div>

						{/* TOTP verification */}
						<div className="space-y-3">
							<p className="text-sm font-medium text-slate-700">
								Nhập mã 6 chữ số từ ứng dụng để xác nhận:
							</p>
							<Input
								value={totpCode}
								onChange={(e) =>
									setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
								}
								placeholder="000000"
								maxLength={6}
								className="text-center font-mono text-2xl tracking-[0.3em] h-14"
								autoComplete="off"
							/>
							<Button
								onPress={handleVerifyTotp}
								isDisabled={
									totpCode.length !== 6 || verify2FAMutation.isPending
								}
								className="w-full"
							>
								{verify2FAMutation.isPending
									? "Đang xác thực..."
									: "Xác nhận & Kích hoạt"}
							</Button>
						</div>

						<div className="mt-4 rounded-lg bg-blue-50 p-3">
							<p className="text-xs text-blue-700">
								💡 Sau khi kích hoạt, mỗi lần đăng nhập bạn sẽ cần nhập mã từ
								ứng dụng xác thực.
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
