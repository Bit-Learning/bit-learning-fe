import {
	AudioWaveform,
	Bell,
	Bug,
	Command,
	Construction,
	CreditCard,
	FileText,
	FileX,
	GalleryVerticalEnd,
	HelpCircle,
	LayoutDashboard,
	ListTodo,
	Lock,
	MessagesSquare,
	Monitor,
	Package,
	PackageOpen,
	Palette,
	ServerOff,
	Settings,
	ShieldCheck,
	UserCog,
	Users,
	UserX,
	Wrench,
} from "lucide-react";
import { ClerkLogo } from "@/assets/clerk-logo";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
	user: {
		name: "Bithub",
		email: "admin@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Bithub Admin",
			logo: Command,
			plan: "Cổng Quản Trị",
		},
		{
			name: "Bithub Inc",
			logo: GalleryVerticalEnd,
			plan: "Doanh Nghiệp",
		},
		{
			name: "Bithub Corp.",
			logo: AudioWaveform,
			plan: "Khởi Nghiệp",
		},
	],
	navGroups: [
		{
			title: "Chung",
			items: [
				{
					title: "Bảng điều khiển",
					url: "/",
					icon: LayoutDashboard,
				},
				{
					title: "Nhiệm vụ",
					url: "/tasks",
					icon: ListTodo,
				},
				{
					title: "Ứng dụng",
					url: "/apps",
					icon: Package,
				},
				{
					title: "Trò chuyện",
					url: "/chats",
					badge: "3",
					icon: MessagesSquare,
				},
				{
					title: "Người dùng",
					url: "/users",
					icon: Users,
				},
				{
					title: "Đơn hàng",
					url: "/orders",
					icon: PackageOpen,
				},
				{
					title: "Mẫu",
					url: "/templates",
					icon: FileText,
				},
				// {
				//   title: 'Mẫu Slide AI',
				//   url: '/product-templates',
				//   icon: FileText,
				// },
				{
					title: "Giao dịch",
					url: "/transactions",
					icon: CreditCard,
				},
				{
					title: "Bảo mật bởi Clerk",
					icon: ClerkLogo,
					items: [
						{
							title: "Đăng nhập",
							url: "/clerk/sign-in",
						},
						{
							title: "Đăng ký",
							url: "/clerk/sign-up",
						},
						{
							title: "Quản lý người dùng",
							url: "/clerk/user-management",
						},
					],
				},
			],
		},
		{
			title: "Trang",
			items: [
				{
					title: "Xác thực",
					icon: ShieldCheck,
					items: [
						{
							title: "Đăng nhập",
							url: "/sign-in",
						},
						{
							title: "Đăng nhập (2 cột)",
							url: "/sign-in-2",
						},
						{
							title: "Đăng ký",
							url: "/sign-up",
						},
						{
							title: "Quên mật khẩu",
							url: "/forgot-password",
						},
						{
							title: "Mã OTP",
							url: "/otp",
						},
					],
				},
				{
					title: "Lỗi",
					icon: Bug,
					items: [
						{
							title: "Không có quyền",
							url: "/errors/unauthorized",
							icon: Lock,
						},
						{
							title: "Bị cấm",
							url: "/errors/forbidden",
							icon: UserX,
						},
						{
							title: "Không tìm thấy",
							url: "/errors/not-found",
							icon: FileX,
						},
						{
							title: "Lỗi máy chủ",
							url: "/errors/internal-server-error",
							icon: ServerOff,
						},
						{
							title: "Lỗi bảo trì",
							url: "/errors/maintenance-error",
							icon: Construction,
						},
					],
				},
			],
		},
		{
			title: "Khác",
			items: [
				{
					title: "Cài đặt",
					icon: Settings,
					items: [
						{
							title: "Hồ sơ",
							url: "/settings",
							icon: UserCog,
						},
						{
							title: "Tài khoản",
							url: "/settings/account",
							icon: Wrench,
						},
						{
							title: "Giao diện",
							url: "/settings/appearance",
							icon: Palette,
						},
						{
							title: "Thông báo",
							url: "/settings/notifications",
							icon: Bell,
						},
						{
							title: "Hiển thị",
							url: "/settings/display",
							icon: Monitor,
						},
					],
				},
				{
					title: "Trung tâm trợ giúp",
					url: "/help-center",
					icon: HelpCircle,
				},
			],
		},
	],
};
