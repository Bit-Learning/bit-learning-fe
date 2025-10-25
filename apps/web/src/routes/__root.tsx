import MainLayout from '@/components/layouts/main-layout'
import NotFoundError from '@/feature/app/page/NotFound'
import AutoSmoothScrollToTop from '@/shared/components/AutoSmoothScrollToTop'
import { Providers } from '@/shared/components/Providers'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <Providers>
            <MainLayout>
                <AutoSmoothScrollToTop />
                <Outlet />
                <TanStackRouterDevtools position="bottom-right" />
            </MainLayout>
        </Providers>
    ),
    notFoundComponent: () => <NotFoundError />,
})
