import { createFileRoute } from "@tanstack/react-router";
import AboutUsPage from "@/feature/app/page/Aboutus";

export const Route = createFileRoute("/_layout/about")({
	component: AboutUsPage,
});
