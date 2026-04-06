import Footer from "@/layouts/footer";
import Header from "@/layouts/header";
import ScrollToTop from "@/layouts/scroll-to-top";
import BotStatusWidget from "@/shared/components/BotStatusWidget";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";

function LayoutComponent() {
	const navigate = useNavigate();

	return (
		<>
			<Header />

			<main className="flex-1">
				<Outlet />
			</main>

			<BotStatusWidget onNavigateToFull={() => navigate({ to: "/chat-ai" })} />
			<ScrollToTop />
			<Footer />
		</>
	);
}

export const Route = createFileRoute("/_layout")({
	component: LayoutComponent,
});
