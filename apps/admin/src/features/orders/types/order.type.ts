export const orderStatuses = ["PENDING", "COMPLETED", "FAILED"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type PaymentMethod = "WALLET" | "PAYOS" | "VNPAY" | null;

export type AdminOrderCourse = {
	id: number;
	code: string;
	title: string;
	instructorName: string;
	thumbnailUrl: string | null;
};

export type AdminOrderDetail = {
	id: number;
	course: AdminOrderCourse;
	amount: number;
	voucher: { id: number; code: string } | null;
};

export type AdminOrder = {
	id: number;
	code: string;
	userId: number;
	userEmail: string;
	userFullName: string | null;
	userAvatar: string | null;
	totalAmount: number;
	status: OrderStatus;
	details: AdminOrderDetail[];
	transactionId: number;
	paymentMethod: PaymentMethod;
	createdAt: string;
	updatedAt: string;
};

export const orderStatusOptions: Array<{
	label: string;
	value: OrderStatus;
}> = [
	{ label: "Chờ xử lý", value: "PENDING" },
	{ label: "Hoàn tất", value: "COMPLETED" },
	{ label: "Thất bại", value: "FAILED" },
];

export function translateOrderStatus(status: OrderStatus): string {
	return orderStatusOptions.find((o) => o.value === status)?.label ?? status;
}

export function translatePaymentMethod(paymentMethod: PaymentMethod): string {
	const map: Record<Exclude<PaymentMethod, null>, string> = {
		WALLET: "Ví",
		PAYOS: "PayOS",
		VNPAY: "VNPay",
	};
	return paymentMethod ? map[paymentMethod] : "-";
}

export function formatCurrency(amount: number): string {
	return amount.toLocaleString("vi-VN");
}

export function formatDateTime(value: string): string {
	const date = new Date(value);
	return date.toLocaleString("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}
