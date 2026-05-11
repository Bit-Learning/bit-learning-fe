import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "@/shared/components/Sonner";
import "@/shared/i18n/i18n";
import "@workspace/ui/globals.css";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import { SearchProvider } from "./shared/context/search-context";

// Set up a Router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	trailingSlash: "never",
});

// Register things for typesafety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<SearchProvider>
			<Toaster richColors position="bottom-right" />
			<RouterProvider router={router} />
		</SearchProvider>,
	);
}
