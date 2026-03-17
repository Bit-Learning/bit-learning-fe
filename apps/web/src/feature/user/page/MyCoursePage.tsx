import PageMeta from "@/shared/components/seo/page-meta";
import React from "react";
import UserProfileLayout from "../layouts/UserProfileLayout";
import MyCoursesContent from "../components/MyCourseContent";

export const MyCoursePage: React.FC = () => {
  return (
    <>
      <PageMeta title="Khóa học của tôi - Bit Learning" description="Xem các khóa học của bạn" />
      <UserProfileLayout>
        <MyCoursesContent />
      </UserProfileLayout>
    </>
  );
};
