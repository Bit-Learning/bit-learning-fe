import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { AdminOrder, OrderStatus } from "../types/order.type";

export type AdminOrderSearchParams = {
	page?: number;
	size?: number;
	userId?: number;
	status?: OrderStatus[];
	code?: string;
	fromDate?: string;
	toDate?: string;
};

export async function getAdminOrders(params: AdminOrderSearchParams) {
	const queryParams = new URLSearchParams();

	queryParams.append("page", String(params.page ?? 0));
	queryParams.append("size", String(params.size ?? 10));

	if (typeof params.userId === "number") {
		queryParams.append("userId", String(params.userId));
	}

	for (const status of params.status ?? []) {
		queryParams.append("status", status);
	}

	if (params.code?.trim()) {
		queryParams.append("code", params.code.trim());
	}

	if (params.fromDate) {
		queryParams.append("fromDate", params.fromDate);
	}

	if (params.toDate) {
		queryParams.append("toDate", params.toDate);
	}

	const response = await api.get<ApiResponse<AdminOrder[]>>(
		`/orders/admin/paged?${queryParams.toString()}`,
	);

	return response.data;
}
