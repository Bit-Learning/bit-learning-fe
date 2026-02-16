import { PostDetailPage } from "@/features/posts/pages/PostDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/posts/$id")({
  component: PostDetailPage,
});
