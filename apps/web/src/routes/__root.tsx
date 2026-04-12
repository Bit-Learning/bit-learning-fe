import { NotFoundErrorPage } from "@/feature/app/pages/NotFound";
import { AudioProvider } from "@/feature/game/contexts/AudioProvider";
import { ThemeProvider } from "@/feature/game/contexts/ThemeProvider";
import { ErrorBoundary } from "@/feature/errors/ErrorBoundary";
import { Providers } from "@/shared/components/Providers";
import DefaultSeo from "@/shared/components/seo/default-seo";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

function RootComponent() {
	const { state } = useRouter();
	const isMatchingRoute = state.matches.some((match) =>
		match.routeId.startsWith("/matching"),
	);
	const content = <Outlet />;

	return (
		<ErrorBoundary>
			<AudioProvider>
				{isMatchingRoute ? (
					<Providers>
						<DefaultSeo />
						<ThemeProvider>{content}</ThemeProvider>
					</Providers>
				) : (
					<Providers>
						<DefaultSeo />
						{content}
					</Providers>
				)}
			</AudioProvider>
		</ErrorBoundary>
	);
}

export const Route = createRootRoute({
	component: () => <RootComponent />,
	notFoundComponent: () => <NotFoundErrorPage />,
});
