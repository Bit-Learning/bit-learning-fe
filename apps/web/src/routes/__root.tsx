import MainLayout from '@/components/layouts/main-layout'
import { Providers } from '@/shared/components/Providers'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <MainLayout>
            <RootComponent />
        </MainLayout>
    ),
})

function RootComponent() {
    return (
        <Providers>
            <Outlet />
            <TanStackRouterDevtools position="bottom-right" />
        </Providers>
    )
}
