import {
  Book,
  FileQuestion,
  LayoutDashboard,
  MessageSquareText,
  PresentationIcon,
  School,
  Trophy,
  Gamepad2,
  BarChart3,
  Users,
  Network,
  MessageCircle,
  Shield,
  ToolboxIcon,
  Tag,
  CreditCard,
  Code,
} from "lucide-react";
import type { NavGroup } from "../types";

const ADMIN_ONLY_URLS = ["/metrics", "/tools-metrics", "/system-prompt", "/users", "/transactions"];

export const navGroups: NavGroup[] = [
  {
    title: "Chung",
    items: [
      { title: "Bảng thống kê", url: "/", icon: LayoutDashboard },
      { title: "Tình trạng hệ thống", url: "/metrics", icon: Shield },
      { title: "Quản lý người dùng", url: "/users", icon: Users },
      { title: "Tra cứu giao dịch", url: "/transactions", icon: CreditCard },
      { title: "Quản lý khóa học", url: "/courses", icon: Book },
      { title: "Quản lý chương trình", url: "/curriculum", icon: School },
      { title: "Quản lý bài viết", url: "/posts", icon: MessageSquareText },
      { title: "Quản lý bài tập thực hành", url: "/problems", icon: Code },
      { title: "Quản lý câu hỏi", url: "/questions", icon: FileQuestion },
      { title: "Quản lý cuộc thi", url: "/contests", icon: Trophy },
      {
        title: "Quản lý mẫu thuyết trình",
        url: "/templates",
        icon: PresentationIcon,
      },
      { title: "Quản lý trò chơi", url: "/apps/games", icon: Gamepad2 },
      {
        title: "Analytics trò chơi",
        url: "/apps/games/analytics",
        icon: BarChart3,
      },
      { title: "Quản lý sơ đồ tư duy", url: "/mindmap", icon: Network },
      { title: "Quản lý tags", url: "/tags", icon: Tag },
      { title: "Quản lý AI", url: "/system-prompt", icon: MessageCircle },
      {
        title: "Công cụ giám sát nâng cao",
        url: "/tools-metrics",
        icon: ToolboxIcon,
      },
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
