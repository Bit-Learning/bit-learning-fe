import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import GameHeader from "@/layouts/game-header";
import Header from "@/layouts/header";
import ScrollToTop from "@/layouts/scroll-to-top";
import TransparentHeader from "@/layouts/transparent-header";

function HeaderOnlyLayoutComponent() {
	const matches = useMatches();
	// Get the last match (current active route) to extract staticData
	const currentMatch = matches.at(-1);
	const headerStyle = currentMatch?.staticData?.headerStyle || "default";

	// Conditionally render header component based on style
	const renderHeader = () => {
		switch (headerStyle) {
			case "transparent":
				return <TransparentHeader />;
			case "game":
				return <GameHeader />;
			default:
				return <Header />;
		}
	};

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={location.pathname}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.2 }}
			>
				{renderHeader()}
				<main className="flex-1 bg-[#FFFFFF]">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<Outlet />
					</motion.div>
				</main>
				<ScrollToTop />
			</motion.div>
		</AnimatePresence>
	);
}

export const Route = createFileRoute("/_headerOnly")({
	component: HeaderOnlyLayoutComponent,
});
