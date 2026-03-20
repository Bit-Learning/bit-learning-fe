import React from "react";
import { User, Lock, History, Bell, BookOpen, Wallet } from "lucide-react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { Card } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/Avatar";
import { cn } from "@workspace/ui/lib/utils";
import { TUserProfile } from "../types/user.type";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

interface ProfileSidebarProps {
  unreadCount?: number;
  userInfo?: TUserProfile;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ unreadCount = 0, userInfo }) => {
  const matchRoute = useMatchRoute();

  const menuItems = [
    {
      id: "profile",
      icon: User,
      label: "Thông tin cá nhân",
      badge: null,
      to: "/profile",
    },
    {
      id: "top-up",
      icon: Wallet,
      label: "Nạp xu BIT",
      badge: null,
      to: "/profile/top-up",
    },
    {
      id: "my-course",
      icon: BookOpen,
      label: "Khóa học của tôi",
      badge: null,
      to: "/profile/my-course",
    },
    {
      id: "password",
      icon: Lock,
      label: "Đổi mật khẩu",
      badge: null,
      to: "/profile/password",
    },
    {
      id: "history",
      icon: History,
      label: "Lịch sử giao dịch",
      badge: null,
      to: "/profile/history",
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Thông báo",
      badge: unreadCount || null,
      to: "/profile/notifications",
    },
  ];

  return (
    <aside className="w-full lg:w-70 shrink-0 lg:sticky lg:top-28">
      <Card className="overflow-hidden">
        <div className="p-3 border-b border-slate-50 flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage
              src={
                userInfo?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
              }
            />
            <AvatarFallback>{userInfo?.firstName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-900 truncate">
              {(userInfo?.firstName || "") + (userInfo?.lastName || "") || "Người dùng"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Học viên tại bit learning</p>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2 bg-amber-50">
          <BitCoinIcon size={32} />
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-slate-500 font-medium">Số dư xu</span>
            <span className="text-base font-bold text-amber-700">
              {userInfo?.wallet.balance.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-semibold text-amber-500">BIT</span>
            </span>
          </div>
          <Link to="/profile/top-up" className="ml-auto text-[11px] font-semibold text-primary hover:underline">
            + Nạp thêm
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = matchRoute({ to: item.to, fuzzy: false });

            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-[15px] w-full",
                  isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "destructive"}
                    className={cn("ml-auto text-[10px]", isActive && "bg-white text-primary")}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </Card>
    </aside>
  );
};
