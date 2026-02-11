import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ForumContent from "../components/ForumContent";

const ForumPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Diễn đàn - Bithub"
        description="Nơi trao đổi, học hỏi và chia sẻ kiến thức lập trình cùng cộng đồng Bithub"
      />
      <ForumContent />
    </>
  );
};

export default ForumPage;
