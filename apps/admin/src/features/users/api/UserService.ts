import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type { PagedUsers } from "../data/schema";

interface GetPagedUsersParams {
	page?: number;
	size?: number;
	sort?: string[];
}

export function GetPagedUsers(
	params: GetPagedUsersParams = {},
): Promise<AxiosResponse<PagedUsers>> {
	const { page = 0, size = 20, sort = ["id,desc"] } = params;

	const queryParams = new URLSearchParams();
	queryParams.append("page", page.toString());
	queryParams.append("size", size.toString());
	sort.forEach((s) => queryParams.append("sort", s));

	return api.get(`${endpoints.ACCOUNT}/paged?${queryParams.toString()}`);
}
