import { useRouter } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";
import {
  Award,
  BookOpen,
  ChevronLeft,
  Code,
  FileCheck,
  FileQuestion,
  FileText,
  LayoutDashboard,
  PresentationIcon,
  Puzzle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  activeMenu: string;
  onToggle: () => void;
  onMobileClose: () => void;
  onMenuClick: (id: string) => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Trang thống kê",
    icon: LayoutDashboard,
    path: "/mentor/dashboard",
  },
  {
    id: "courses",
    label: "Khóa học",
    icon: BookOpen,
    path: "/mentor/course/list",
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
];

export function SidebarMentor({
  isOpen,
  isMobileOpen,
  activeMenu,
  onToggle,
  onMobileClose,
  onMenuClick,
}: SidebarProps) {
  const router = useRouter();

  const handleMenuClick = (item: (typeof menuItems)[0]) => {
    onMenuClick(item.id);

    if (item.path) {
      router.navigate({ to: item.path });
    }

    if (isMobileOpen) {
      onMobileClose();
    }
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
        <Card className="flex h-full flex-col rounded-none border-r shadow-xl">
          <div className="border-b border-blue-400 p-4 dark:border-gray-700">
            {isOpen ? (
              <div className="flex items-center space-x-3">
                <div className="bg-linear-to-br flex h-10 w-10 items-center justify-center rounded-xl from-blue-600 to-indigo-600 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">MentorHub</h1>
                </div>
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
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group",
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

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="absolute -right-3 top-20 hidden h-10 w-10 items-center justify-center rounded-full border border-blue-400 bg-white p-0 shadow-md hover:shadow-lg lg:flex dark:border-gray-700 dark:bg-gray-800"
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
