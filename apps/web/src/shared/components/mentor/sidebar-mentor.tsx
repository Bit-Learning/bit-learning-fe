import { useRouter } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";
import { Award, BookOpen, ChevronLeft, Code, LayoutDashboard } from "lucide-react";

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

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeMenu === item.id ? "default" : "ghost"}
                  onClick={() => handleMenuClick(item)}
                  className={cn(
                    "w-full justify-between",
                    activeMenu === item.id
                      ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
                      : "text-slate-700 dark:text-gray-300",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn("h-5 w-5", !isOpen && "mx-auto")} />
                    {isOpen && <span className="font-medium">{item.label}</span>}
                  </div>
                </Button>
              ))}
            </div>
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
