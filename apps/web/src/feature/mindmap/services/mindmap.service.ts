import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { MindMap } from "../types/mindmap.types";

export const getMindMapDataByUserIdAndCode = (
	userId: number,
	code: string,
): Promise<AxiosResponse<ApiResponse<MindMap>>> => {
	return api.get<ApiResponse<MindMap>>(`/products/mindmaps/${userId}/${code}`);
};

interface UpdateMindMapRequest {
	data: string;
}
export const updateMindMap = (
	data: UpdateMindMapRequest,
	code: string,
	userId: number,
): Promise<AxiosResponse<ApiResponse<MindMap>>> => {
	return api.put<ApiResponse<MindMap>>(
		`/products/mindmaps/${userId}/${code}`,
		data,
	);
};
