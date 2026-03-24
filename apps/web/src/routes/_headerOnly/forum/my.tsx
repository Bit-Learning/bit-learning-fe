import MyPostPage from "@/feature/forum/pages/MyPost";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/forum/my")({
	component: MyPostPage,
});
