import { useInitializeAuth } from "@/feature/user/queries/useUser";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import {
	matchQuery,
	MutationCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ConfirmDialog } from "@workspace/ui/components/ConfirmDialog";
import { BsProvider } from "@workspace/ui/components/Provider";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import store from "../redux/store";

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
				predicate: (query) =>
					(mutation.meta?.invalidates as any)?.some((queryKey: any) =>
						matchQuery({ queryKey }, query),
					) ?? true,
			});
		},
	}),
});

const AuthInitializer = () => {
	const initializeAuth = useInitializeAuth();

	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	return null;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<BsProvider>
			<Provider store={store}>
				<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
					<HelmetProvider>
						<QueryClientProvider client={queryClient}>
							<AuthInitializer />
							{children}
							<ConfirmDialog />
						</QueryClientProvider>
					</HelmetProvider>
				</ThemeProvider>
			</Provider>
		</BsProvider>
	);
};
