import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { SlideGenerationResponse, SlideRequest } from "../types/slide.type";

export const slideApi = {
  generateSlide: async (request: SlideRequest): Promise<AxiosResponse<ApiResponse<SlideGenerationResponse>>> => {
    return api.post("/pptx/generate", request);
  },

  getMySlides: async (
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  ): Promise<AxiosResponse<ApiResponse<SlideGenerationResponse[]>>> => {
    return api.get("/pptx/my-slides", {
      params: { page, size, sortBy, sortDir },
    });
  },

  getSlideById: async (id: number): Promise<AxiosResponse<ApiResponse<SlideGenerationResponse>>> => {
    return api.get(`/pptx/my-slides/${id}`);
  },

  deleteSlide: async (id: number): Promise<AxiosResponse<ApiResponse<void>>> => {
    return api.delete(`/pptx/my-slides/${id}`);
  },

  extractPlaceholders: async (templateFile: File): Promise<AxiosResponse<ApiResponse<string[]>>> => {
    const formData = new FormData();
    formData.append("file", templateFile);

    return api.post("/pptx/placeholders", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
