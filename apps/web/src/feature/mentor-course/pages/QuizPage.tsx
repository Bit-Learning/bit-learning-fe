import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { QuizForm } from "../component/QuizForm";

export default function QuizPage() {
  return (
    <>
      <PageMeta title="Quản lý khóa học - Mentor" description="Tạo Quiz cho khóa học" />
      <MentorLayout>
        <div className="p-8">
          <QuizForm />
        </div>
      </MentorLayout>
    </>
  );
}
