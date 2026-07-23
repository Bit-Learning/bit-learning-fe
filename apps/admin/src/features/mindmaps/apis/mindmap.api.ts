import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	MindMapGalleryResponse,
	MindMapStructurePatchRequest,
	MindMapStructureRequest,
	MindMapThemePatchRequest,
	MindMapThemeRequest,
	StructureConfigDto,
	ThemeConfigDto,
} from "../types/mindmap.type";

function buildFormData(
	requestJson: unknown,
	thumbnail?: File | null,
): FormData {
	const form = new FormData();
	form.append(
		"request",
		new Blob([JSON.stringify(requestJson)], { type: "application/json" }),
	);
	if (thumbnail) form.append("thumbnail", thumbnail);
	return form;
}

const multipart = {
	headers: { "Content-Type": "multipart/form-data" },
} as const;

export const mindmapApi = {
	getGallery(): Promise<AxiosResponse<ApiResponse<MindMapGalleryResponse>>> {
		return api.get("/mindmap/gallery");
	},

	getAllStructures(): Promise<
		AxiosResponse<ApiResponse<StructureConfigDto[]>>
	> {
		return api.get("/admin/mindmap/structures");
	},

	createStructure(
		request: MindMapStructureRequest,
		thumbnail?: File | null,
	): Promise<AxiosResponse<ApiResponse<StructureConfigDto>>> {
		return api.post(
			"/admin/mindmap/structures",
			buildFormData(request, thumbnail),
			multipart,
		);
	},

	patchStructure(
		id: number,
		request: MindMapStructurePatchRequest,
		thumbnail?: File | null,
	): Promise<AxiosResponse<ApiResponse<StructureConfigDto>>> {
		return api.patch(
			`/admin/mindmap/structures/${id}`,
			buildFormData(request, thumbnail),
			multipart,
		);
	},

	deleteStructure(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/admin/mindmap/structures/${id}`);
	},

	getAllThemes(): Promise<AxiosResponse<ApiResponse<ThemeConfigDto[]>>> {
		return api.get("/admin/mindmap/themes");
	},

	createTheme(
		request: MindMapThemeRequest,
		thumbnail?: File | null,
	): Promise<AxiosResponse<ApiResponse<ThemeConfigDto>>> {
		return api.post(
			"/admin/mindmap/themes",
			buildFormData(request, thumbnail),
			multipart,
		);
	},

	patchTheme(
		id: number,
		request: MindMapThemePatchRequest,
		thumbnail?: File | null,
	): Promise<AxiosResponse<ApiResponse<ThemeConfigDto>>> {
		return api.patch(
			`/admin/mindmap/themes/${id}`,
			buildFormData(request, thumbnail),
			multipart,
		);
	},

	deleteTheme(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/admin/mindmap/themes/${id}`);
	},
};
