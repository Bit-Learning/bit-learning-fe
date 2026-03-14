import {
	createFileRoute,
	Outlet,
	useMatches,
	useNavigate,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import Footer from "@/layouts/footer";
import GameHeader from "@/layouts/game-header";
import Header from "@/layouts/header";
import ScrollToTop from "@/layouts/scroll-to-top";
import { Bot } from "lucide-react";
import BotStatusWidget from "@/shared/components/BotStatusWidget";

function LayoutComponent() {
	const matches = useMatches();
	// Get the last match (current active route) to extract staticData
	const currentMatch = matches.at(-1);
	const headerStyle = currentMatch?.staticData?.headerStyle || "default";
	const navigate = useNavigate();

	// Conditionally render header component based on style
	const renderHeader = () => {
		switch (headerStyle) {
			case "game":
				return <GameHeader />;
			default:
				return <Header />;
		}
	};

	return (
		<motion.div
			className="flex min-h-screen flex-col"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
		>
			{renderHeader()}
			<main className="flex-1">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<Outlet />
				</motion.div>
			</main>

			<BotStatusWidget onNavigateToFull={() => navigate({ to: "/chat-ai" })} />
			<ScrollToTop />
			<Footer />
		</motion.div>
	);
}

export const Route = createFileRoute("/_layout")({
	component: LayoutComponent,
});
