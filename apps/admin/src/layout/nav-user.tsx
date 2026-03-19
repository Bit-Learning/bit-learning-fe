import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
import { SignOutDialog } from "@/components/sign-out-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import useDialogState from "@/shared/hooks/use-dialog-state";

type NavUserProps = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
};

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useDialogState();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="group rounded-xl border border-transparent px-2.5 py-2 transition-all duration-150 hover:border-blue-100 hover:bg-blue-50 data-[state=open]:border-blue-100 data-[state=open]:bg-blue-50"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                </div>

                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate text-[13px] font-semibold text-slate-700">{user.name}</span>
                  <span className="truncate text-[11px] text-slate-400">{user.email}</span>
                </div>

                <ChevronsUpDown className="ms-auto size-4 text-slate-400 transition-colors group-hover:text-blue-500" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={6}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate text-sm font-semibold text-slate-800">{user.name}</span>
                    <span className="truncate text-xs text-slate-400">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
                >
                  <Link to="/settings/account">
                    <BadgeCheck className="mr-2 size-4 text-blue-500" />
                    Tài Khoản
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
                >
                  <Link to="/settings/notifications">
                    <Bell className="mr-2 size-4 text-blue-500" />
                    Thông Báo
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="mr-2 size-4" />
                Đăng Xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  );
}
