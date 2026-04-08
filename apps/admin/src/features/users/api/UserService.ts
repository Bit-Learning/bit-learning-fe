import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type { MentorApprovalStatus, PagedUsers } from "../data/schema";

interface GetPagedUsersParams {
	page?: number;
	size?: number;
	sort?: string[];
}

export function GetPagedUsers(
	params: GetPagedUsersParams = {},
): Promise<AxiosResponse<PagedUsers>> {
	const { page = 0, size = 10, sort = ["id,desc"] } = params;

	const queryParams = new URLSearchParams();
	queryParams.append("page", page.toString());
	queryParams.append("size", size.toString());
	sort.forEach((s) => void queryParams.append("sort", s));

	return api.get(`${endpoints.ACCOUNT}/paged?${queryParams.toString()}`);
}

interface UpdateMentorStatusParams {
	userId: number;
	status: MentorApprovalStatus;
	rejectionReason?: string;
}

export function updateMentorStatus(
	params: UpdateMentorStatusParams,
): Promise<AxiosResponse> {
	const { userId, status, rejectionReason } = params;
	const queryParams = new URLSearchParams();
	queryParams.append("status", status);
	if (rejectionReason) {
		queryParams.append("rejectionReason", rejectionReason);
	}

	return api.patch(
		`${endpoints.ACCOUNT}/admin/${userId}/mentor-status?${queryParams.toString()}`,
	);
}
