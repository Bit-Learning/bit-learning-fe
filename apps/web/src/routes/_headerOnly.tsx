import Header from "@/layouts/header";
import ScrollToTop from "@/layouts/scroll-to-top";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { motion } from "framer-motion";

function HeaderOnlyLayoutComponent() {
	return (
		<>
			<Header />
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
		</>
	);
}

export const Route = createFileRoute("/_headerOnly")({
	component: HeaderOnlyLayoutComponent,
});
