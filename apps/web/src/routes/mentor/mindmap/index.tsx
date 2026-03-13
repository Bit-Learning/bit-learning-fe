import MindMapPage from "@/feature/mindmap/pages/MindMapPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/mindmap/")({
    component: MindMapPage,
});
