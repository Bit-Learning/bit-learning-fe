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
import { AnimatePresence, motion } from "framer-motion";

function LayoutComponent() {
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={location.pathname}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.2 }}
			>
				<Header />
				<main className="flex-1">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<Outlet />
					</motion.div>
				</main>

				<BotStatusWidget
					onNavigateToFull={() => navigate({ to: "/chat-ai" })}
				/>
				<ScrollToTop />
				<Footer />
			</motion.div>
		</AnimatePresence>
	);
}

export const Route = createFileRoute("/_layout")({
	component: LayoutComponent,
});
