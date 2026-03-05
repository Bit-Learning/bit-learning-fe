import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import { ContestLayout } from "../layouts/ContestLayout";
import ContestQAContent from "../components/ContestQAContent";

const ContestQAPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Hỏi đáp - Cuộc thi lập trình"
        description="Gửi thắc mắc về đề bài và nhận câu trả lời từ Ban tổ chức. Xem các câu hỏi thường gặp của thí sinh khác."
      />

      <ContestLayout>
        <ContestQAContent />
      </ContestLayout>
    </>
  );
};

export default ContestQAPage;
