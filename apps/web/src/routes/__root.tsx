import MainLayout from '@/components/layouts/main-layout'
import { LayoutProvider } from '@/context/layout-context'
import { NotFoundErrorPage } from '@/feature/app/page/NotFound'
import { Providers } from '@/shared/components/Providers'
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
