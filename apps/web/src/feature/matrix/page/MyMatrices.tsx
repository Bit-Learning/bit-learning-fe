import PageMeta from "@/shared/components/seo/page-meta";
import MyMatricesContent from "../components/MyMatricesContent";
import MentorLayout from "@/layouts/mentor-layout";
import { MentorHeader } from "@/shared/components/mentor/mentor-header";

const MyMatricesPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Ma trận của tôi - Bit Learning" description="Các ma trận đề thi do bạn tạo" />
      <MentorLayout>
        <MentorHeader />
        <MyMatricesContent />
      </MentorLayout>
    </>
  );
};

export default MyMatricesPage;
