import { NotFoundErrorPage } from '@/feature/app/page/NotFound'
import { Providers } from '@/shared/components/Providers'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <Providers>
            <Outlet />
            <TanStackRouterDevtools position="bottom-right" />
        </Providers>
    ),
    notFoundComponent: () => <NotFoundErrorPage />,
})
