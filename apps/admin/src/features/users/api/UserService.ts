import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	AccountStatus,
	MentorApprovalStatus,
	PagedUsers,
	User,
} from "../data/schema";

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

export function getUserProfileById(
	userId: number,
): Promise<AxiosResponse<{ data: User }>> {
	return api.get(`${endpoints.ACCOUNT}/profile/view`, {
		params: { userId },
	});
}

interface UpdateUserAccountStatusParams {
	userId: number;
	status: AccountStatus;
	reason?: string;
	appealUrl?: string;
}

export function updateUserAccountStatus(
	params: UpdateUserAccountStatusParams,
): Promise<AxiosResponse<{ data: User }>> {
	const { userId, ...data } = params;
	return api.patch(`${endpoints.ACCOUNT}/admin/${userId}/account-status`, data);
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
