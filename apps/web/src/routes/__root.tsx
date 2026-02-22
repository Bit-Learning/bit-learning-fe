import { NotFoundErrorPage } from "@/feature/app/page/NotFound";
import { AudioProvider } from "@/feature/game/components/AudioProvider";
import { ThemeProvider } from "@/feature/game/components/ThemeProvider";
import { Providers } from "@/shared/components/Providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

function RootComponent() {
	const { state } = useRouter();
	const isMatchingRoute = state.matches.some((match) =>
		match.routeId.startsWith("/matching"),
	);
	const content = <Outlet />;

	if (isMatchingRoute) {
		return (
			<ThemeProvider>
				<AudioProvider>{content}</AudioProvider>
			</ThemeProvider>
		);
	}

	return (
		<Providers>
			{content}
			{import.meta.env.MODE === "development" && (
				<>
					<ReactQueryDevtools
						position="bottom"
						buttonPosition="bottom-left"
						theme="system"
						initialIsOpen={false}
					/>
					<TanStackRouterDevtools position="bottom-left" />
				</>
			)}
		</Providers>
	);
}

export const Route = createRootRoute({
	component: () => <RootComponent />,
	notFoundComponent: () => <NotFoundErrorPage />,
});
