import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
    GenerateMindMapRequest,
    MindMapResponse,
    SaveMindMapRequest,
    SavedMindMapDetailDto,
    SavedMindMapDto,
} from "../types/mindmap.type";

export const radialmindmapApi = {
    generateRadialLayout: async (
        request: GenerateMindMapRequest,
    ): Promise<AxiosResponse<ApiResponse<MindMapResponse>>> => {
        return api.post("/mindmap/generate/radial-layout", request);
    },
};


export const symmetrichorizontalmindmapApi = {
    generateSymmetricHorizontalLayout: async (
        request: GenerateMindMapRequest,
    ): Promise<AxiosResponse<ApiResponse<MindMapResponse>>> => {
        return api.post("/mindmap/generate/symmetric-horizontal-layout", request);
    },
};

export const horizontalmindmapApi = {
    generateHorizontalLayout: async (
        request: GenerateMindMapRequest,
    ): Promise<AxiosResponse<ApiResponse<MindMapResponse>>> => {
        return api.post("/mindmap/generate/horizontal-layout", request);
    },
};

export const savedMindMapApi = {
    save: async (request: SaveMindMapRequest): Promise<AxiosResponse<ApiResponse<SavedMindMapDto>>> => {
        return api.post("/mindmap/saved", request);
    },
    list: async (page = 0, size = 12): Promise<AxiosResponse<ApiResponse<SavedMindMapDto[]>>> => {
        return api.get("/mindmap/saved", { params: { page, size } });
    },
    getById: async (id: number): Promise<AxiosResponse<ApiResponse<SavedMindMapDetailDto>>> => {
        return api.get(`/mindmap/saved/${id}`);
    },
    delete: async (id: number): Promise<AxiosResponse<ApiResponse<void>>> => {
        return api.delete(`/mindmap/saved/${id}`);
    },
};