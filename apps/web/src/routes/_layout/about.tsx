import { createFileRoute } from "@tanstack/react-router";
import AboutUsPage from "@/feature/app/pages/Aboutus";

export const Route = createFileRoute("/_layout/about")({
  component: AboutUsPage,
});
