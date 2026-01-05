import "@tanstack/react-router";

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		headerStyle?: "default" | "transparent" | "game";
	}
}
