import { NotFoundErrorPage } from '@/feature/app/page/NotFound'
import MainLayout from '@/layouts/main-layout'
import { Providers } from '@/shared/components/Providers'
import { LayoutProvider } from '@/shared/context/layout-context'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <Providers>
            <LayoutProvider>
                <MainLayout>
                    <Outlet />
                </MainLayout>
                <TanStackRouterDevtools position="bottom-right" />
            </LayoutProvider>
        </Providers>
    ),
    notFoundComponent: () => <NotFoundErrorPage />,
})
