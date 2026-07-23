import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { OrderCreateRequest, OrderInfo } from "../types/order.type";
import {
	DepositHistoryParams,
	TransactionHistoryParams,
	TransactionInfo,
} from "../types/payment.type";

export const orderApi = {
	createOrder(
		request: OrderCreateRequest,
	): Promise<AxiosResponse<ApiResponse<string | null>>> {
		return api.post("/orders", request);
	},

	cancelOrder(orderId: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/orders/${orderId}`);
	},

	getMyOrders(params?: {
		page?: number;
		size?: number;
		sort?: string;
		direction?: "ASC" | "DESC";
	}): Promise<AxiosResponse<ApiResponse<OrderInfo[]>>> {
		return api.get("/orders/users/me", { params });
	},

	getOrdersByUserIdWithPagination(
		userId: number,
		params?: {
			page?: number;
			size?: number;
			sort?: string;
			direction?: "ASC" | "DESC";
		},
	): Promise<AxiosResponse<ApiResponse<OrderInfo[]>>> {
		return api.get(`/orders/users/${userId}`, { params });
	},

	getMyDeposits(
		params?: DepositHistoryParams,
	): Promise<AxiosResponse<ApiResponse<TransactionInfo[]>>> {
		return api.get("/transactions/deposit/me", { params });
	},

	getMyTotalDeposits(): Promise<AxiosResponse<ApiResponse<number>>> {
		return api.get("/transactions/deposit/total/me");
	},

	getMyAllTransactions(
		params?: TransactionHistoryParams,
	): Promise<AxiosResponse<ApiResponse<TransactionInfo[]>>> {
		return api.get("/transactions/all/me", { params });
	},
};
