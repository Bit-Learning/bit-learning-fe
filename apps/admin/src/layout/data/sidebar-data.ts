import {
  AudioWaveform,
  Book,
  Command,
  FileQuestion,
  GalleryVerticalEnd,
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
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "Bit Learning",
    email: "admin@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Bit Learning",
      logo: Command,
      plan: "Cổng Quản Trị",
    },
    {
      name: "Bit Learning Inc",
      logo: GalleryVerticalEnd,
      plan: "Doanh Nghiệp",
    },
    {
      name: "Bit Learning Corp.",
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
          title: "Quản lí người dùng",
          url: "/users",
          icon: Users,
        },
        {
          title: "Quản lí khóa học",
          url: "/courses",
          icon: Book,
        },
        {
          title: "Chương trình giảng dạy",
          url: "/curriculum",
          icon: School,
        },
        {
          title: "Quản lí bài viết",
          url: "/posts",
          icon: MessageSquareText,
        },
        {
          title: "Quản lí câu hỏi",
          url: "/questions",
          icon: FileQuestion,
        },
        {
          title: "Quản lí cuộc thi",
          url: "/contests",
          icon: Trophy,
        },
        {
          title: "Quản lí template",
          url: "/templates",
          icon: PresentationIcon,
        },
        {
          title: "Quản lí game học tập",
          url: "/apps/games",
          icon: Gamepad2,
        },
        {
          title: "Mindmap Themes",
          url: "/mindmap/themes",
          icon: Palette,
        },
        {
          title: "Mindmap Structure",
          url: "/mindmap/structure",
          icon: Network,
        },
        {
          title: "System Prompt",
          url: "/system-prompt",
          icon: MessageCircle,
        },
      ],
    },
  ],
};
