import PostFormPage from "@/feature/forum/pages/PostForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/forum/create")({
	component: PostFormPage,
});
