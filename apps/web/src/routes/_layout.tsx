import Footer from "@/layouts/footer";
import Header from "@/layouts/header";
import ScrollToTop from "@/layouts/scroll-to-top";
import BotStatusWidget from "@/shared/components/BotStatusWidget";
import { requireStudentOrMentorRole } from "@/shared/lib/auth-utils";
import { createFileRoute, Outlet } from "@tanstack/react-router";

function LayoutComponent() {
	return (
		<>
			<Header />

			<main className="flex-1 bg-slate-50">
				<Outlet />
			</main>

			<BotStatusWidget onNavigateToFull={() => {}} />
			<ScrollToTop />
			<Footer />
		</>
	);
}

export const Route = createFileRoute("/_layout")({
	beforeLoad: ({ location }) => {
		requireStudentOrMentorRole(location);
	},
	component: LayoutComponent,
});
