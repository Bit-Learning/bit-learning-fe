import type { LucideIcon } from "lucide-react";

export type NavLink = {
	title: string;
	to: string;
	description?: string;
	icon?: LucideIcon;
};

export type NavDropdown = {
	label: string;
	type: "dropdown";
	items: NavLink[];
};

export type NavSingle = {
	label: string;
	to: string;
	type?: "link";
};

export type NavItem = NavSingle | NavDropdown;

export const NAV_ITEMS: NavItem[] = [
	{
		label: "Trang chủ",
		to: "/",
	},
	{
		label: "Về chúng tôi",
		to: "/about",
	},
	{
		label: "Các sản phẩm",
		type: "dropdown",
		items: [
			{
				title: "Tất cả sản phẩm",
				to: "/products",
				description: "Xem toàn bộ danh mục sản phẩm của chúng tôi.",
			},
			{
				title: "Sản phẩm mới",
				to: "/products/new",
				description: "Khám phá những sản phẩm vừa được ra mắt.",
			},
			{
				title: "Bài thuyết trình",
				to: "/presentations",
				description: "Khám phá các sản phẩm và công cụ hỗ trợ thuyết trình.",
			},
			{
				title: "Trình tạo slide bằng AI",
				to: "/chat",
				description: "Tạo slide nhanh chóng với sự hỗ trợ của AI.",
			},
			{
				title: "Mẫu slide có sẵn",
				to: "/templates/dashboard",
				description: "Khám phá các mẫu slide được thiết kế chuyên nghiệp.",
			},
		],
	},
	{
		label: "Bài viết",
		to: "/blog",
	},
	{
		label: "Liên hệ",
		to: "/contact",
	},
];

export const PRESENTATION_ITEMS: NavItem[] = [
	{
		label: "Tạo template",
		to: "/custom-template",
	},
	// {
	//     label: 'API Docs',
	//     to: '/templates/docs',
	// },
	{
		label: "Các mẫu có sẵn",
		to: "/templates/template-preview",
	},
	{
		label: "Thống kê",
		to: "/templates/dashboard",
	},
	{
		label: "Tài khoản",
		to: "/user-profile",
	},
];
