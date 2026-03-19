import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { Button } from "../components/ui/button";

export function AppTitle() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="gap-0 py-0 hover:bg-transparent active:bg-transparent" asChild>
          <div>
            <Link to="/" onClick={() => setOpenMobile(false)} className="grid flex-1 text-start leading-tight">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200">
                  <span className="text-sm font-bold text-white">BIT</span>
                </div>
                <div>
                  <span className="block truncate text-sm font-semibold text-slate-800">BITLEARNING</span>
                  <span className="block truncate text-[11px] text-blue-500">Quản Trị Hệ Thống</span>
                </div>
              </div>
            </Link>

            <ToggleSidebar />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ToggleSidebar({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn(
        "aspect-square size-8 text-slate-400 hover:bg-blue-50 hover:text-blue-600 max-md:scale-125",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <X className="md:hidden" />
      <Menu className="max-md:hidden" />
      <span className="sr-only">Mở/Đóng Thanh Bên</span>
    </Button>
  );
}
