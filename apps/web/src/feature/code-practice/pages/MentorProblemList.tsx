import PageMeta from "@/shared/components/seo/page-meta";
import MentorProblemListContent from "../components/MentorProblemListContent";
import MentorLayout from "@/layouts/mentor-layout";

export const MentorProblemListPage: React.FC = () => (
  <>
    <PageMeta title="Quản lý Problem - Mentor" description="Quản lý bài tập coding" />
    <MentorLayout>
      <MentorProblemListContent />
    </MentorLayout>
  </>
);
