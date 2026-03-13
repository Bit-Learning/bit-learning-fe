import { TUserProfile } from "@/feature/auth/types/auth.type";
import { Link, useRouter } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/Avatar";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Menu as DropdownMenu, MenuItem, MenuPopover, MenuSeparator, MenuTrigger } from "@workspace/ui/components/Menu";
import { cn } from "@workspace/ui/lib/utils";
import {
  Award,
  Bell,
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  Code,
  FileCheck,
  FileQuestion,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  PresentationIcon,
  Puzzle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  userInfo?: TUserProfile;
  onToggle: () => void;
  onMobileClose: () => void;
  onGoHome: () => void;
  onLogout: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Trang thống kê",
    icon: LayoutDashboard,
    path: "/mentor/dashboard",
  },
  {
    id: "problems",
    label: "Bài tập thực hành",
    icon: Code,
    path: "/mentor/problem",
  },
  {
    id: "matrices",
    label: "Ma trận đề thi",
    icon: Puzzle,
    path: "/mentor/matrix/my",
  },
  {
    id: "exams",
    label: "Đề thi",
    icon: FileText,
    path: "/mentor/exam/my",
  },
  {
    id: "questions",
    label: "Câu hỏi của tôi",
    icon: FileQuestion,
    path: "/mentor/question/my",
  },
  {
    id: "my-requests",
    label: "Yêu cầu duyệt câu hỏi",
    icon: FileCheck,
    path: "/mentor/question/my-requests",
  },
  {
    id: "my-slides",
    label: "Quản lí slide",
    icon: PresentationIcon,
    path: "/mentor/slides",
  },
  {
    id: "mindmap",
    label: "Tạo Mind Map",
    icon: BrainCircuit,
    path: "/mentor/mindmap",
  },
];

export function SidebarMentor({
  isOpen,
  isMobileOpen,
  userInfo,
  onToggle,
  onMobileClose,
  onGoHome,
  onLogout,
}: SidebarProps) {
  const router = useRouter();

  const currentPath = router.state.location.pathname;

  const handleMenuClick = (item: (typeof menuItems)[0]) => {
    if (item.path) {
      router.navigate({ to: item.path });
    }

    if (isMobileOpen) {
      onMobileClose();
    }
  };

  const mergeName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`.trim();
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
          isOpen ? "w-72" : "w-20",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <Card className="flex h-full flex-col rounded-none border-r shadow-xl py-0">
          <div className="border-b border-blue-400 p-4 dark:border-gray-700">
            {isOpen ? (
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center relative z-50">
                  <img
                    src="/Logo.png"
                    alt="Bit Learning"
                    className={cn("object-contain transition-all duration-300 h-10 w-36")}
                  />
                </Link>
              </div>
            ) : (
              <div className="bg-linear-to-br mx-auto flex h-10 w-10 items-center justify-center rounded-xl from-blue-600 to-indigo-600 shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={cn(
                    "cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group",
                    "text-left",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                    !isOpen && "lg:justify-center lg:px-2",
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 transition-colors", !isActive && "group-hover:text-primary")} />
                  <span
                    className={cn("font-medium transition-opacity duration-200", !isOpen && "lg:opacity-0 lg:hidden")}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-gray-700 ">
            {isOpen ? (
              <div className="space-y-3">
                <Button variant="ghost" size="icon" className="relative w-full justify-start">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                  <span className="ml-3 font-medium text-slate-600 dark:text-gray-400">Thông báo</span>
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
                </Button>

                <MenuTrigger>
                  <Button
                    variant="ghost"
                    className="flex h-auto w-full items-center space-x-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userInfo?.avatar} alt={userInfo?.username} />
                      <AvatarFallback>{userInfo?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {mergeName(userInfo?.firstName ?? "", userInfo?.lastName ?? "")}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-gray-400">Giảng viên</span>
                    </div>
                  </Button>
                  <MenuPopover className="min-w-50">
                    <DropdownMenu>
                      <MenuItem onAction={onGoHome} className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        Về trang chủ
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem onAction={onLogout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </MenuItem>
                    </DropdownMenu>
                  </MenuPopover>
                </MenuTrigger>
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="ghost" size="icon" className="relative mx-auto flex">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                </Button>

                <MenuTrigger>
                  <Button variant="ghost" className="mx-auto flex h-auto p-0 hover:bg-transparent">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userInfo?.avatar} alt={userInfo?.username} />
                      <AvatarFallback>{userInfo?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                  <MenuPopover className="min-w-45">
                    <DropdownMenu>
                      <MenuItem onAction={onGoHome} className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        Về trang chủ
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem onAction={onLogout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </MenuItem>
                    </DropdownMenu>
                  </MenuPopover>
                </MenuTrigger>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="absolute -right-3 top-13 hidden h-10 w-10 items-center justify-center rounded-full border border-blue-400 bg-white p-0 shadow-md hover:shadow-lg lg:flex dark:border-gray-700 dark:bg-gray-800"
          >
            <ChevronLeft
              className={cn("h-6! w-6! text-blue-600 transition-transform dark:text-gray-400", !isOpen && "rotate-180")}
            />
          </Button>
        </Card>
      </aside>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onMobileClose();
            }
          }}
        />
      )}
    </>
  );
}
