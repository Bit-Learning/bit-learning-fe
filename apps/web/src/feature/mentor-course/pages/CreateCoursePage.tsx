import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { CreateCourseForm } from "../component/CreateCourseForm";

export default function CreateCoursePage() {
  return (
    <>
      <PageMeta title="Tạo khóa học mới - Mentor" description="Tạo khóa học mới" />
      <MentorLayout>
        <div className="flex h-full w-full items-center justify-center p-8">
          <CreateCourseForm />
        </div>
      </MentorLayout>
    </>
  );
}
