import { z } from 'zod'

// Use the same schema as the type file for consistency
const orderStatusSchema = z.union([
  z.literal('PENDING'),
  z.literal('COMPLETED'),
  z.literal('FAILED'),
])
export type OrderStatus = z.infer<typeof orderStatusSchema>

const orderDetailSchema = z.object({
  id: z.number(),
  productId: z.number(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
})
export type OrderDetail = z.infer<typeof orderDetailSchema>

const orderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  totalAmount: z.number(),
  status: orderStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  orderDetails: z.array(orderDetailSchema),
})
export type Order = z.infer<typeof orderSchema>

export const orderListSchema = z.array(orderSchema)
