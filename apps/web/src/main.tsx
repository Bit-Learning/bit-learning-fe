import * as Sentry from "@sentry/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "@workspace/ui/components/Sonner";
import "@workspace/ui/globals.css";
import ReactDOM from "react-dom/client";
import "./instrument";
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
  const root = ReactDOM.createRoot(rootElement, {
    // Callback called when an error is thrown and not caught by an ErrorBoundary.
    onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
      console.warn("Uncaught error", error, errorInfo.componentStack);
    }),
    // Callback called when React catches an error in an ErrorBoundary.
    onCaughtError: Sentry.reactErrorHandler(),
    // Callback called when React automatically recovers from errors.
    onRecoverableError: Sentry.reactErrorHandler(),
  });
  root.render(
    <SearchProvider>
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
    </SearchProvider>,
  );
}
