import PageMeta from "@/shared/components/seo/page-meta";
import MentorLayout from "@/layouts/mentor-layout";
import MentorProblemDetailContent from "../components/MentorProblemDetailContent";

export const MentorProblemDetailPage: React.FC = () => (
  <>
    <PageMeta title="Quản lý Problem - Mentor" description="Quản lý bài tập coding" />
    <MentorLayout>
      <MentorProblemDetailContent />
    </MentorLayout>
  </>
);
