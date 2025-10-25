import { SearchProvider } from './contexts/search-context'
import { ThemeProvider } from './contexts/theme-context'
import { routeTree } from './routeTree.gen'
import store from './shared/redux/store'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from '@workspace/ui/components/Sonner'
import '@workspace/ui/globals.css'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'

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
        <Provider store={store}>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <HelmetProvider>
                    <SearchProvider>
                        <Toaster richColors position="top-right" />
                        <RouterProvider router={router} />
                    </SearchProvider>
                </HelmetProvider>
            </ThemeProvider>
        </Provider>,
    )
}
