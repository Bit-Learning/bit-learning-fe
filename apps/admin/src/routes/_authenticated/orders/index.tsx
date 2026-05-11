import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { orderStatuses } from "@/features/orders/types/order.type";

const ordersSearchSchema = z.object({
	page: z.coerce.number().optional().catch(1),
	pageSize: z.coerce.number().optional().catch(10),
	userId: z.coerce.number().optional().catch(undefined),
	status: z.array(z.enum(orderStatuses)).optional().catch([]),
	code: z.string().optional().catch(""),
	fromDate: z.string().optional().catch(""),
	toDate: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/orders/")({
	validateSearch: ordersSearchSchema,
	component: OrdersPage,
});
