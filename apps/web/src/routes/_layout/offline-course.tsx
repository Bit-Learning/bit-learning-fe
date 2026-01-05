import { createFileRoute } from "@tanstack/react-router";
import OfflineCoursePage from "@/feature/course/page/OfflineCourse";

export const Route = createFileRoute("/_layout/offline-course")({
	component: OfflineCoursePage,
});
