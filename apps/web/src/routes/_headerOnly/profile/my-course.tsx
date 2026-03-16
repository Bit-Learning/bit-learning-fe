import { MyCoursePage } from "@/feature/user/page/MyCoursePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/my-course")({
  component: MyCoursePage,
});
