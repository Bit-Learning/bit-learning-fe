import { NavigationProgress } from "@/components/navigation-progress";
import { Toaster } from "@/components/ui/sonner";
import { GeneralError } from "@/features/errors/general-error";
import { NotFoundError } from "@/features/errors/not-found-error";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => {
		return (
			<>
				<NavigationProgress />
				<Outlet />
				<Toaster duration={5000} />
				{import.meta.env.MODE === "development" && (
					<div className="flex fixed bottom-0 left-0 z-50 space-x-2">
						<ReactQueryDevtools buttonPosition="bottom-right" />
						<TanStackRouterDevtools position="bottom-right" />
					</div>
				)}
			</>
		);
	},
	notFoundComponent: NotFoundError,
	errorComponent: GeneralError,
});
