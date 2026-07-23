import { PaymentMethod } from "./order.type";

export enum TransactionStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
}

export enum TransactionType {
	PURCHASE = "PURCHASE",
	DEPOSIT = "DEPOSIT",
	AI_REQUEST = "AI_REQUEST",
	AI_REFUND = "AI_REFUND",
	CONTEST_PRIZE = "CONTEST_PRIZE",
}

export interface AddBalanceToWalletRequest {
	amount: number;
	paymentMethod: PaymentMethod.VNPAY | PaymentMethod.PAYOS;
}
export interface DepositHistoryParams {
	page?: number;
	size?: number;
	sort?: string;
	direction?: "ASC" | "DESC";
}

export interface TransactionHistoryParams {
	page?: number;
	size?: number;
	sort?: string;
	direction?: "ASC" | "DESC";
}

export interface TransactionInfo {
	id: number;
	code: string;
	userId: number;
	orderId?: number;
	amount: number;
	type: TransactionType;
	paymentMethod?: string;
	status: TransactionStatus;
	createdAt: string;
	updatedAt: string;
}
