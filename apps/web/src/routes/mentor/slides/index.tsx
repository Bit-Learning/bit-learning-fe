import SlideManagementPage from "@/feature/slides/pages/SlideManagementPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/slides/")({
  component: SlideManagementPage,
});
