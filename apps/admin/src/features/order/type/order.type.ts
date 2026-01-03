import { z } from "zod";

// Order Status Schema
const orderStatusSchema = z.union([
	z.literal("PENDING"),
	z.literal("COMPLETED"),
	z.literal("FAILED"),
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Order Detail Schema
const orderDetailSchema = z.object({
	id: z.number(),
	productId: z.number(),
	productName: z.string(),
	quantity: z.number(),
	unitPrice: z.number(),
	amount: z.number(),
});
export type OrderDetail = z.infer<typeof orderDetailSchema>;

// Order Schema
const orderSchema = z.object({
	id: z.number(),
	userId: z.number(),
	totalAmount: z.number(),
	status: orderStatusSchema,
	createdAt: z.string(),
	updatedAt: z.string(),
	orderDetails: z.array(orderDetailSchema),
});
export type Order = z.infer<typeof orderSchema>;

export const orderListSchema = z.array(orderSchema);

// Request Types
export type OrderRequest = {
	orderDetails: OrderDetailRequest[];
};

export type OrderDetailRequest = {
	productId: number;
	quantity: number;
};
