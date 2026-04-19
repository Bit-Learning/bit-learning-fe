import api from "@/shared/api/api";
import type { ApiResponse, PaginationInfo } from "@/shared/api/api.type";
import type {
	BusinessDashboardFilterParams,
	BusinessDashboardOverview,
	BusinessDashboardRevenueDetailRow,
} from "../types/business-dashboard.types";

function buildDashboardParams(filter: BusinessDashboardFilterParams) {
	return {
		preset: filter.preset,
		fromDate: filter.fromDate,
		toDate: filter.toDate,
		granularity: filter.granularity,
		transactionTypes: filter.transactionTypes,
		statuses: filter.statuses,
		timezone: filter.timezone,
	};
}

export async function getBusinessDashboardOverview(
	filter: BusinessDashboardFilterParams,
): Promise<BusinessDashboardOverview> {
	const response = await api.get<ApiResponse<BusinessDashboardOverview>>(
		"/v1/admin/business-dashboard/overview",
		{
			params: buildDashboardParams(filter),
		},
	);
	return response.data.data as BusinessDashboardOverview;
}

export async function getRevenueDetailRows(
	filter: BusinessDashboardFilterParams & { page?: number; size?: number },
): Promise<{
	data: BusinessDashboardRevenueDetailRow[];
	page?: PaginationInfo;
}> {
	const response = await api.get<
		ApiResponse<BusinessDashboardRevenueDetailRow[]>
	>("/v1/admin/business-dashboard/revenue/details", {
		params: {
			...buildDashboardParams(filter),
			page: filter.page,
			size: filter.size,
		},
	});

	return {
		data: response.data.data ?? [],
		page: response.data.page,
	};
}

export async function getAllRevenueDetailRows(
	filter: BusinessDashboardFilterParams,
	size = 500,
): Promise<BusinessDashboardRevenueDetailRow[]> {
	const firstPage = await getRevenueDetailRows({
		...filter,
		page: 0,
		size,
	});

	const totalPages = firstPage.page?.totalPages ?? 1;
	if (totalPages <= 1) {
		return firstPage.data;
	}

	const remainingPages = await Promise.all(
		Array.from({ length: totalPages - 1 }, (_, index) =>
			getRevenueDetailRows({
				...filter,
				page: index + 1,
				size,
			}),
		),
	);

	return [
		...firstPage.data,
		...remainingPages.flatMap((response) => response.data),
	];
}

export async function exportBusinessRevenueXlsx(
	filter: BusinessDashboardFilterParams,
): Promise<Blob> {
	const response = await api.get<Blob>(
		"/v1/admin/business-dashboard/revenue/export.xlsx",
		{
			params: buildDashboardParams(filter),
			responseType: "blob",
		},
	);
	return response.data;
}
