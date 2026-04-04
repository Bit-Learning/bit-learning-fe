import {
  Book,
  FileQuestion,
  LayoutDashboard,
  MessageSquareText,
  PresentationIcon,
  School,
  Trophy,
  Gamepad2,
  Users,
  Palette,
  Network,
  MessageCircle,
  Shield,
  ToolboxIcon,
  Tag,
} from "lucide-react";
import type { NavGroup } from "../types";

const ADMIN_ONLY_URLS = ["/metrics", "/tools-metrics", "/system-prompt", "/users"];

export const navGroups: NavGroup[] = [
  {
    title: "Chung",
    items: [
      { title: "Bảng thống kê", url: "/", icon: LayoutDashboard },
      { title: "Tình trạng hệ thống", url: "/metrics", icon: Shield },
      { title: "Quản lí người dùng", url: "/users", icon: Users },
      { title: "Quản lí khóa học", url: "/courses", icon: Book },
      { title: "Chương trình giảng dạy", url: "/curriculum", icon: School },
      { title: "Quản lí bài viết", url: "/posts", icon: MessageSquareText },
      { title: "Quản lí câu hỏi", url: "/questions", icon: FileQuestion },
      { title: "Quản lí cuộc thi", url: "/contests", icon: Trophy },
      { title: "Quản lí template", url: "/templates", icon: PresentationIcon },
      { title: "Quản lí game học tập", url: "/apps/games", icon: Gamepad2 },
      { title: "Quản lý tags", url: "/tags", icon: Tag },
      { title: "Mindmap Themes", url: "/mindmap/themes", icon: Palette },
      { title: "Mindmap Structure", url: "/mindmap/structure", icon: Network },
      { title: "System Prompt", url: "/system-prompt", icon: MessageCircle },
      { title: "Công cụ giám sát nâng cao", url: "/tools-metrics", icon: ToolboxIcon },
    ],
  },
];

export function getNavGroupsForRole(role: "ADMIN" | "MANAGER" | undefined): NavGroup[] {
  if (role === "ADMIN") return navGroups;

  if (role === "MANAGER") {
    return navGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => !("url" in item) || !ADMIN_ONLY_URLS.includes(item.url as string)),
    }));
  }

  return navGroups;
}

export const sidebarData = {
  navGroups,
};
