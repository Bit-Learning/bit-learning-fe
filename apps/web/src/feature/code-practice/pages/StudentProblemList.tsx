import PageMeta from "@/shared/components/seo/page-meta";
import StudentProblemListContent from "../components/StudentProblemListContent";

export const StudentProblemListPage: React.FC = () => (
  <>
    <PageMeta title="Problem Set - Bithub" description="Luyện tập coding với hàng trăm bài tập" />
    <StudentProblemListContent />
  </>
);
