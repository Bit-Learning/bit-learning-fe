import { Outlet } from "@tanstack/react-router";
import { SkipToMain } from "@/components/skip-to-main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutProvider } from "@/shared/context/layout-provider";
import { SearchProvider } from "@/shared/context/search-provider";
import { getCookie } from "@/shared/lib/cookies";
import { cn } from "@/shared/lib/utils";
import AppSidebar from "./app-sidebar";

type AuthenticatedLayoutProps = {
  children?: React.ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie("sidebar_state") !== "false";
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              "@container/content",

              "has-data-[layout=fixed]:h-svh",

              "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  );
}
