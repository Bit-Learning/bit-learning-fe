import {
  AudioWaveform,
  Bell,
  Book,
  Command,
  FileQuestion,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  MessageSquareText,
  Monitor,
  Palette,
  School,
  Settings,
  Trophy,
  UserCog,
  Wrench,
} from "lucide-react";
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
