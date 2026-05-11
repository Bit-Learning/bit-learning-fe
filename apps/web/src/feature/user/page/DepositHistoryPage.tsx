import PageMeta from "@/shared/components/seo/page-meta";
import React from "react";
import UserProfileLayout from "../layouts/UserProfileLayout";
import DepositHistoryContent from "../components/DepositHistoryContent";

export const DepositHistoryPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Lịch sử nạp tiền - Bit Learning" description="Xem lại lịch sử nạp tiền của bạn" />
      <UserProfileLayout>
        <div className="flex-1 w-full">
          <DepositHistoryContent />
        </div>
      </UserProfileLayout>
    </>
  );
};
