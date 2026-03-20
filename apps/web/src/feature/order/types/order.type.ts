export enum OrderStatus {
  PENDING = "PENDING",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export enum PaymentMethod {
  VNPAY = "VNPAY",
  PAYOS = "PAYOS",
  WALLET = "WALLET",
}

export interface OrderDetailCreateRequest {
  courseId: number;
  voucherCode?: string;
}

export interface OrderCreateRequest {
  paymentMethod: PaymentMethod;
  details: OrderDetailCreateRequest[];
}

export interface VoucherInfoInOrderDetail {
  id: number;
  code: string;
}

export interface CourseInfoInOrderDetail {
  id: number;
  title: string;
  thumbnailUrl: string;
}

export interface OrderDetailInfo {
  id: number;
  course: CourseInfoInOrderDetail;
  amount: number;
  voucher?: VoucherInfoInOrderDetail;
}

export interface OrderInfo {
  id: number;
  userId: number;
  code: string;
  totalAmount: number;
  status: OrderStatus;
  details: OrderDetailInfo[];
  transactionId?: number;
}
