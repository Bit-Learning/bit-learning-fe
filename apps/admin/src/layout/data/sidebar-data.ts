import {
	BookOpen,
	CreditCard,
	FileText,
	LayoutDashboard,
	MessageSquareText,
	School,
	Settings,
	Users,
} from "lucide-react";
import type { NavGroup } from "../types";

const ADMIN_ONLY_URLS = [
	"/metrics",
	"/tools-metrics",
	"/system-prompt",
	"/users",
	"/transactions",
	"/post-appeals",
];

export const navGroups: NavGroup[] = [
	{
		title: "Tổng quan",
		items: [
			{ title: "Dashboard", url: "/", icon: LayoutDashboard },
			{
				title: "Giao dịch & Doanh thu",
				url: "/transactions",
				icon: CreditCard,
			},
		],
	},
	{
		title: "Nội dung",
		items: [
			{
				title: "Nội dung đào tạo",
				icon: BookOpen,
				items: [
					{ title: "Chương trình học", url: "/curriculum" },
					{ title: "Khóa học", url: "/courses" },
					{ title: "Bài tập thực hành", url: "/problems" },
				],
			},
			{
				title: "Khảo thí & Đánh giá",
				icon: FileText,
				items: [
					{ title: "Ngân hàng câu hỏi", url: "/questions" },
					{ title: "Đề thi", url: "/exams" },
					{ title: "Cuộc thi", url: "/contests" },
				],
			},
			{
				title: "Kho học liệu & Công cụ",
				icon: School,
				items: [
					{ title: "Trò chơi giáo dục", url: "/apps/games" },
					{ title: "Mẫu thuyết trình", url: "/templates" },
					{ title: "Sơ đồ tư duy", url: "/mindmap" },
				],
			},
		],
	},
	{
		title: "Quản trị",
		items: [
			{ title: "Người dùng", url: "/users", icon: Users },
			{
				title: "Truyền thông & Hỗ trợ",
				icon: MessageSquareText,
				items: [
					{ title: "Bài viết", url: "/posts" },
					{ title: "Khiếu nại / Hỗ trợ", url: "/post-appeals" },
				],
			},
			{
				title: "Hệ thống & Cấu hình",
				icon: Settings,
				items: [
					{ title: "Trợ lý AI", url: "/system-prompt" },
					{ title: "Danh mục Tags", url: "/tags" },
					{ title: "Cài đặt hệ thống", url: "/metrics" },
				],
			},
		],
	},
];

export function getNavGroupsForRole(
	role: "ADMIN" | "MANAGER" | undefined,
): NavGroup[] {
	if (role === "ADMIN") return navGroups;

	if (role === "MANAGER") {
		return navGroups.map((group) => ({
			...group,
			items: group.items
				.map((item) => {
					// NavLink: lọc trực tiếp
					if (!item.items) {
						return ADMIN_ONLY_URLS.includes(item.url as string) ? null : item;
					}
					// NavCollapsible: lọc sub-items
					const filteredSubs = item.items.filter(
						(sub) => !ADMIN_ONLY_URLS.includes(sub.url as string),
					);
					if (filteredSubs.length === 0) return null;
					return { ...item, items: filteredSubs };
				})
				.filter(Boolean) as typeof group.items,
		}));
	}

	return navGroups;
}

export const sidebarData = {
	navGroups,
};
