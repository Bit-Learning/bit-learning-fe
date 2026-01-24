export interface CartItemInfo {
  courseId: number;
  courseTitle: string;
  courseThumbnail: string;
  coursePrice: number;
  instructorName: string;
  voucherCode?: string;
  discountAmount?: number;
  finalPrice: number;
}

export interface CartInfo {
  items: CartItemInfo[];
  totalAmount: number;
  totalItems: number;
}
