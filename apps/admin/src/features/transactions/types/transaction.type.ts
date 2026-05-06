export const transactionTypes = [
	"PURCHASE",
	"DEPOSIT",
	"AI_REQUEST",
	"CONTEST_PRIZE",
] as const;

export type TransactionType = (typeof transactionTypes)[number];

export const transactionStatuses = ["PENDING", "COMPLETED", "FAILED"] as const;

export type TransactionStatus = (typeof transactionStatuses)[number];

export type PaymentMethod = "WALLET" | "PAYOS" | "VNPAY" | null;

export type AdminTransactionUser = {
	id: number;
	fullName: string | null;
	email: string;
	avatar: string | null;
};

export type AdminTransactionOrder = {
	id: number;
	code: string;
} | null;

export type AdminTransaction = {
	id: number;
	code: string;
	amount: number;
	type: TransactionType;
	paymentMethod: PaymentMethod;
	status: TransactionStatus;
	payosId: string | null;
	createdAt: string;
	updatedAt: string;
	user: AdminTransactionUser;
	order: AdminTransactionOrder;
};

export type AdminUserLookupOption = {
	id: number;
	fullName: string | null;
	email: string;
	avatar: string | null;
};

export const transactionTypeOptions: Array<{
	label: string;
	value: TransactionType;
}> = [
	{ label: "Mua hàng", value: "PURCHASE" },
	{ label: "Nạp tiền", value: "DEPOSIT" },
	{ label: "AI Request", value: "AI_REQUEST" },
	{ label: "Thưởng cuộc thi", value: "CONTEST_PRIZE" },
];

export const transactionStatusOptions: Array<{
	label: string;
	value: TransactionStatus;
}> = [
	{ label: "Chờ xử lý", value: "PENDING" },
	{ label: "Hoàn tất", value: "COMPLETED" },
	{ label: "Thất bại", value: "FAILED" },
];

export function translateTransactionType(
	type: TransactionType,
	paymentMethod?: PaymentMethod,
): string {
	if (type === "PURCHASE") {
		// Phân biệt mua hàng qua tiền thật (VNPay/PayOS) vs qua ví nội bộ
		if (paymentMethod === "VNPAY" || paymentMethod === "PAYOS") {
			return "Mua khóa học trực tiếp";
		}
		return "Thanh toán ví";
	}
	return (
		transactionTypeOptions.find((option) => option.value === type)?.label ??
		type
	);
}

export function translateTransactionStatus(status: TransactionStatus): string {
	return (
		transactionStatusOptions.find((option) => option.value === status)?.label ??
		status
	);
}

export function translatePaymentMethod(paymentMethod: PaymentMethod): string {
	const paymentMethodMap: Record<Exclude<PaymentMethod, null>, string> = {
		WALLET: "Ví",
		PAYOS: "PayOS",
		VNPAY: "VNPay",
	};

	return paymentMethod ? paymentMethodMap[paymentMethod] : "-";
}

export function formatCurrency(amount: number): string {
	return `${amount.toLocaleString("vi-VN")} UP`;
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
