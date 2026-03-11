import { useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { Menu, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLogout } from "@/feature/auth/queries/useAuth";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { SidebarMentor } from "@/shared/components/mentor/sidebar-mentor";
import { Button } from "@workspace/ui/components/Button";

interface MentorLayoutProps {
  children: React.ReactNode;
}

export default function MentorLayout({ children }: MentorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userInfo } = useSelector(selectAuthStateInfo);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/signin" });
  };

  return (
    <div className="relative z-10 bg-white p-6 sm:p-0 dark:bg-gray-900">
      <div className="bg-linear-to-br relative min-h-screen from-slate-50 via-blue-50 to-indigo-50 dark:bg-gray-900">
        <SidebarMentor
          isOpen={sidebarOpen}
          isMobileOpen={mobileMenuOpen}
          userInfo={userInfo!}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onMobileClose={() => setMobileMenuOpen(false)}
          onGoHome={handleGoHome}
          onLogout={handleLogout}
        />

        <div className={cn("transition-all duration-300", sidebarOpen ? "lg:ml-72" : "lg:ml-20")}>
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm lg:hidden">
            <div className="px-6 py-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
