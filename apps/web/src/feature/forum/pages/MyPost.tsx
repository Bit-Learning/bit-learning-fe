import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import MyPostContent from "../components/MyPostContent";

const MyPostPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Bài đăng của tôi - Bithub" description="Quản lý và theo dõi các bài viết của bạn trên Bithub" />
      <MyPostContent />
    </>
  );
};

export default MyPostPage;
