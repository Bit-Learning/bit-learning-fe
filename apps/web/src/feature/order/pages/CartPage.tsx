import PageMeta from "@/shared/components/seo/page-meta";
import type React from "react";
import CartContent from "../components/CartContent";

export const CartPage: React.FC = () => (
	<>
		<PageMeta title="Giỏ hàng - BitHub" description="Giỏ hàng của bạn" />
		<CartContent />
	</>
);
