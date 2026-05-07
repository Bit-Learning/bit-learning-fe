import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	AdminTransaction,
	AdminUserLookupOption,
	TransactionStatus,
	TransactionType,
} from "../types/transaction.type";
import { type paymentMethods } from "../types/transaction.type";

export type AdminTransactionSearchParams = {
	page?: number;
	size?: number;
	userId?: number;
	type?: TransactionType[];
	status?: TransactionStatus[];
	paymentMethod?: (typeof paymentMethods)[number][];
	code?: string;
	fromDate?: string;
	toDate?: string;
};

export async function getAdminTransactions(
	params: AdminTransactionSearchParams,
) {
	const queryParams = new URLSearchParams();

	queryParams.append("page", String(params.page ?? 0));
	queryParams.append("size", String(params.size ?? 10));

	if (typeof params.userId === "number") {
		queryParams.append("userId", String(params.userId));
	}

	for (const type of params.type ?? []) {
		queryParams.append("type", type);
	}

	for (const status of params.status ?? []) {
		queryParams.append("status", status);
	}

	for (const pm of params.paymentMethod ?? []) {
		queryParams.append("paymentMethod", pm);
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

	const response = await api.get<ApiResponse<AdminTransaction[]>>(
		`/transactions/admin/paged?${queryParams.toString()}`,
	);

	return response.data;
}

export async function lookupAdminUsers(params: {
	keyword: string;
	limit?: number;
}) {
	const response = await api.get<ApiResponse<AdminUserLookupOption[]>>(
		"/users/admin/lookup",
		{
			params: {
				keyword: params.keyword,
				limit: params.limit ?? 10,
			},
		},
	);

	return response.data.data ?? [];
}
