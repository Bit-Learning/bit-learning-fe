import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { GenerateMindMapRequest, MindMapResponse } from "../types/mindmap.type";

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