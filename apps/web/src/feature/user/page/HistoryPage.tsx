import PageMeta from "@/shared/components/seo/page-meta";
import React from "react";
import UserProfileLayout from "../layouts/UserProfileLayout";
import { HistoryContent } from "../components/HistoryContent";

export const HistoryPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Lịch sử giao dịch - Bit Learning" description="Xem lại các đơn hàng của bạn" />
      <UserProfileLayout>
        <HistoryContent />
      </UserProfileLayout>
    </>
  );
};
