import MainLayout from '@/components/layouts/main-layout'
import { LayoutProvider } from '@/context/layout-context'
import { NotFoundErrorPage } from '@/feature/app/page/NotFound'
import AutoSmoothScrollToTop from '@/shared/components/AutoSmoothScrollToTop'
import { Providers } from '@/shared/components/Providers'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <Providers>
            <LayoutProvider>
                <MainLayout>
                    <AutoSmoothScrollToTop />
                    <Outlet />
                    <TanStackRouterDevtools position="bottom-right" />
                </MainLayout>
            </LayoutProvider>
        </Providers>
    ),
    notFoundComponent: () => <NotFoundErrorPage />,
})
