import { useParams } from "@tanstack/react-router";
import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { CourseDetailView } from "../component/CourseDetailView";

export default function CourseDetailPage() {
  return (
    <>
      <PageMeta title="Chi tiết khóa học - Mentor" description="Quản lý chương và bài học" />
      <MentorLayout>
        <div className="p-6">
          <CourseDetailView />
        </div>
      </MentorLayout>
    </>
  );
}
