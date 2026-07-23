import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TSubjectResponse } from "../types/subject.type";

export const subjectApi = {
	getAllList(): Promise<AxiosResponse<ApiResponse<TSubjectResponse[]>>> {
		return api.get("/subjects/all");
	},
};
