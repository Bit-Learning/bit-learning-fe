import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from '@workspace/ui/components/Sonner'
import '@workspace/ui/globals.css'
import ReactDOM from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import { SearchProvider } from './shared/context/search-context'

// Set up a Router instance
const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
})

// Register things for typesafety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <SearchProvider>
            <Toaster richColors position="top-right" />
            <RouterProvider router={router} />
        </SearchProvider>,
    )
}
