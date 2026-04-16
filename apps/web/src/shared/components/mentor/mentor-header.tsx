import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, Home, LogOut, User, Settings, Link, Coins, Presentation } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useLogout } from "@/feature/auth/queries/useAuth";
import { NotificationBell } from "@/feature/notification/component/notification-bell";
import { mergeName } from "@/shared/lib/string-utils";
import BitCoinIcon from "../BitCoinIcon";
import { cn } from "@workspace/ui/lib/utils";

export function MentorHeader() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated, userInfo } = useSelector(selectAuthStateInfo);
  const logout = useLogout();
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate({ to: "/signin-role" });
  };
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 relative z-50">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-md
               bg-blue-600 text-white"
            >
              <Presentation className="w-6 h-6" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Giảng viên</span>
              <span className="text-md text-gray-500 dark:text-gray-400">Quản lý nội dung giảng dạy</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/" })}
              type="button"
              className={cn(
                "relative rounded-xl p-2 transition-all duration-200",
                "hover:bg-white/50 dark:hover:bg-white/10 backdrop-blur-sm",
              )}
              title="Về trang chủ"
            >
              <Home className="h-7 w-7 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer" />
            </button>
            {isAuthenticated && userInfo && <NotificationBell />}

            {isAuthenticated && userInfo ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                >
                  <div className="relative size-13 shrink-0 overflow-hidden rounded-full pointer-events-none">
                    {userInfo.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt={userInfo.username}
                        className="aspect-square size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-white text-xs">
                        {userInfo.username?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-md font-bold text-gray-900 dark:text-gray-100">
                      {mergeName(userInfo.firstName, userInfo.lastName)}
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[16px] font-semibold text-amber-700 dark:text-gray-100 mt-0.5">
                        {userInfo.wallet.balance.toLocaleString("vi-VN")}
                      </span>
                      <BitCoinIcon size={19} />
                    </div>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 min-w-50 rounded-lg border bg-white dark:bg-gray-800/80 shadow-lg p-1.5">
                    <button
                      onClick={() => {
                        navigate({ to: "/profile" });
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate({ to: "/profile/top-up" });
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    >
                      <Coins className="h-4 w-4" />
                      <span>Nạp xu BIT</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate({ to: "/profile/password" });
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Đổi mật khẩu</span>
                    </button>
                    <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
