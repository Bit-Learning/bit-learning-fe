import { ThemeProvider } from '@/shared/components/ThemeProvider'
import { AuthProvider } from '@/shared/context/AuthContext'
import { matchQuery, MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BsProvider } from '@workspace/ui/components/Provider'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import store from '../redux/store'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60,
        },
    },
    mutationCache: new MutationCache({
        onSuccess: async (_data, _variables, _context, mutation) => {
            await queryClient.invalidateQueries({
                predicate: query =>
                    // invalidate all matching tags at once
                    // or everything if no meta is provided
                    (mutation.meta?.invalidates as any)?.some((queryKey: any) => matchQuery({ queryKey }, query)) ??
                    true,
            })
        },
    }),
})

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <BsProvider>
            <Provider store={store}>
                <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                    <HelmetProvider>
                        <QueryClientProvider client={queryClient}>
                            <AuthProvider>
                                {children}
                                <ReactQueryDevtools initialIsOpen={false} />
                            </AuthProvider>
                        </QueryClientProvider>
                    </HelmetProvider>
                </ThemeProvider>
            </Provider>
        </BsProvider>
    )
}
