import { NotFoundErrorPage } from "@/feature/app/pages/NotFound";
import { Providers } from "@/shared/components/Providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
export const Route = createRootRoute({
  component: () => (
    <Providers>
      <Outlet />
      {import.meta.env.MODE === "development" && (
        <>
          <ReactQueryDevtools position="bottom" buttonPosition="bottom-left" theme="system" initialIsOpen={false} />
          <TanStackRouterDevtools position="bottom-left" />
        </>
      )}
    </Providers>
  ),
  notFoundComponent: () => <NotFoundErrorPage />,
});
