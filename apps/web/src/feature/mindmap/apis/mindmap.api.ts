import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
    GenerateMindMapRequest,
    MindMapGalleryResponse,
    MindMapGenerateResponse,
    MindMapVersionDto,
    RefineRequest,
    SavedMindMapDto,
    SaveTreeRequest,
    SaveTreeResponse,
} from "../types/mindmap.type";

export const mindmapApi = {
    // GET /mindmap/gallery
    getGallery: (): Promise<AxiosResponse<ApiResponse<MindMapGalleryResponse>>> =>
        api.get("/mindmap/gallery"),

    // POST /mindmap/generate — auto-saves, trả về id
    generate: (
        request: GenerateMindMapRequest,
    ): Promise<AxiosResponse<ApiResponse<MindMapGenerateResponse>>> =>
        api.post("/mindmap/generate", request),

    // POST /mindmap/saved/{id}/refine
    refine: (
        id: number,
        request: RefineRequest,
    ): Promise<AxiosResponse<ApiResponse<MindMapGenerateResponse>>> =>
        api.post(`/mindmap/saved/${id}/refine`, request),

    // GET /mindmap/saved
    listSaved: (
        page = 0,
        size = 10,
    ): Promise<AxiosResponse<ApiResponse<SavedMindMapDto[]>>> =>
        api.get("/mindmap/saved", { params: { page, size, sort: "createdAt,DESC" } }),

    // GET /mindmap/saved/{id}
    getById: (
        id: number,
    ): Promise<AxiosResponse<ApiResponse<SavedMindMapDto>>> =>
        api.get(`/mindmap/saved/${id}`),

    // DELETE /mindmap/saved/{id}
    delete: (id: number): Promise<AxiosResponse<ApiResponse<void>>> =>
        api.delete(`/mindmap/saved/${id}`),

    // GET /mindmap/saved/{id}/versions
    listVersions: (
        id: number,
    ): Promise<AxiosResponse<ApiResponse<MindMapVersionDto[]>>> =>
        api.get(`/mindmap/saved/${id}/versions`),

    // GET /mindmap/saved/{id}/versions/{version_number}
    getVersion: (
        id: number,
        versionNumber: number,
    ): Promise<AxiosResponse<ApiResponse<MindMapVersionDto>>> =>
        api.get(`/mindmap/saved/${id}/versions/${versionNumber}`),

    // POST /mindmap/saved/{id}/versions/{version_number}/restore
    restoreVersion: (
        id: number,
        versionNumber: number,
    ): Promise<AxiosResponse<ApiResponse<MindMapGenerateResponse>>> =>
        api.post(`/mindmap/saved/${id}/versions/${versionNumber}/restore`),

    // POST /mindmap/saved/{id}/save
    saveTree: (
        id: number,
        request: SaveTreeRequest,
    ): Promise<AxiosResponse<ApiResponse<SaveTreeResponse>>> =>
        api.post(`/mindmap/saved/${id}/save`, request),
};
