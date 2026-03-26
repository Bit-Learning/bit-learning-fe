import api from "@/shared/api/api";
import type { DashboardStats } from "../types/dashboard.types";

interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}

export async function getAllDashboardStats(): Promise<DashboardStats> {
	const response =
		await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
	return response.data.data;
}

export async function triggerManualRefresh(): Promise<{ status: string }> {
	const response =
		await api.post<ApiResponse<{ status: string }>>("/dashboard/refresh");
	return response.data.data;
}

export async function getDashboardSettings(): Promise<Record<string, string>> {
	const response = await api.get<ApiResponse<Record<string, string>>>(
		"/dashboard/settings",
	);
	return response.data.data;
}

export async function updateDashboardSettings(
	updates: Record<string, string>,
): Promise<Record<string, string>> {
	const response = await api.patch<ApiResponse<Record<string, string>>>(
		"/dashboard/settings",
		updates,
	);
	return response.data.data;
}
