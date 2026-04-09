import PageMeta from "@/shared/components/seo/page-meta";
import MentorProblemListContent from "../components/MentorProblemListContent";
import MentorLayout from "@/layouts/mentor-layout";
import { MentorHeader } from "@/shared/components/mentor/mentor-header";

export const MentorProblemListPage: React.FC = () => (
  <>
    <PageMeta title="Quản lý Problem - Mentor" description="Quản lý bài tập coding" />
    <MentorLayout>
      <MentorHeader />
      <MentorProblemListContent />
    </MentorLayout>
  </>
);
