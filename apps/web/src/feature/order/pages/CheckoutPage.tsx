import PageMeta from "@/shared/components/seo/page-meta";
import type React from "react";
import CheckoutContent from "../components/CheckoutContent";

export const CheckoutPage: React.FC = () => (
	<>
		<PageMeta title="Thanh toán - BitHub" description="Thanh toán khóa học" />
		<CheckoutContent />
	</>
);
