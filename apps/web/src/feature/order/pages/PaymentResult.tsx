import PageMeta from "@/shared/components/seo/page-meta";
import type React from "react";
import PaymentResultContent from "../components/PaymentResultContent";

export const PaymentResultPage: React.FC = () => (
  <>
    <PageMeta title="Kết quả thanh toán - BitHub" description="Kết quả thanh toán đơn hàng" />
    <PaymentResultContent />
  </>
);
