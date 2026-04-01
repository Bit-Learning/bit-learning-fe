import { PaymentMethod } from "@/feature/order/types/order.type";

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum TransactionType {
  PURCHASE = "PURCHASE",
  DEPOSIT = "DEPOSIT",
  AI_REQUEST = "AI_REQUEST",
}

export interface AddBalanceToWalletRequest {
  amount: number;
  paymentMethod: PaymentMethod.VNPAY | PaymentMethod.PAYOS;
}

export interface PaymentUrlResponse {
  url: string;
}

export interface RegeneratePaymentUrlRequest {
  code: string;
}

export interface TransactionInfo {
  id: number;
  userId: number;
  amount: number;
  code: string;
  type: TransactionType;
  status: TransactionStatus;
  orderId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepositHistoryParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
}
