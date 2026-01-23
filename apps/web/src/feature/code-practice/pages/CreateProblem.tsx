import PageMeta from "@/shared/components/seo/page-meta";
import CreateProblemContent from "../components/CreateProblemContent";
import MentorLayout from "@/layouts/mentor-layout";

export const CreateProblemPage: React.FC = () => (
  <>
    <PageMeta title="Tạo Problem - Mentor" description="Tạo bài tập coding mới" />
    <MentorLayout>
      <div className="p-6">
        <CreateProblemContent />
      </div>
    </MentorLayout>
  </>
);
