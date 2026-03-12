import PageMeta from "@/shared/components/seo/page-meta";
import React from "react";
import UserProfileLayout from "../layouts/UserProfileLayout";
import { NotificationsContent } from "../components/NotificationsContent";

export const NotificationsPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Thông báo - Bit Learning" description="Xem các thông báo của bạn" />
      <UserProfileLayout>
        <NotificationsContent />
      </UserProfileLayout>
    </>
  );
};
