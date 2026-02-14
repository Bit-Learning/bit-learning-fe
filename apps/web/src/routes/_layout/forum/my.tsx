import MyPostPage from "@/feature/forum/pages/MyPost";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/forum/my")({
  component: MyPostPage,
});
