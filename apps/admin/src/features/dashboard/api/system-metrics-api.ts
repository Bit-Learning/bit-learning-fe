import api from "@/shared/api/api";
import type {
	MetricsHealth,
	MetricsSummary,
	MetricsTrends,
} from "../types/system-metrics.types";

interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}

export async function getSystemMetricsSummary(): Promise<MetricsSummary> {
	const response = await api.get<ApiResponse<MetricsSummary>>(
		"/v1/admin/dashboard/summary",
	);
	return response.data.data;
}

export async function getSystemMetricsHealth(): Promise<MetricsHealth> {
	const response = await api.get<ApiResponse<MetricsHealth>>(
		"/v1/admin/dashboard/health",
	);
	return response.data.data;
}

export async function getSystemMetricsTrends(): Promise<MetricsTrends> {
	const response = await api.get<ApiResponse<MetricsTrends>>(
		"/v1/admin/dashboard/trends",
	);
	return response.data.data;
}
