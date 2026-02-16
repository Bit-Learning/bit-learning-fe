import { PostListPage } from "@/features/posts/pages/PostListPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/posts/")({
  component: PostListPage,
});
