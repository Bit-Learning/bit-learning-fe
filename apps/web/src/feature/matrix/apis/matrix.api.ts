import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
  TMatrixRequest,
  TMatrixResponse,
  TMatrixVersionRequest,
  TMatrixVersionResponse,
  TMatrixDetailRequest,
  TMatrixDetailResponse,
  TGenerateRequest,
} from "../types/matrix.type";

export const matrixApi = {
  create(data: TMatrixRequest): Promise<AxiosResponse<ApiResponse<TMatrixResponse>>> {
    return api.post("/matrices", data);
  },

  update(id: number, data: TMatrixRequest): Promise<AxiosResponse<ApiResponse<TMatrixResponse>>> {
    return api.put(`/matrices/${id}`, data);
  },

  getById(id: number): Promise<AxiosResponse<ApiResponse<TMatrixResponse>>> {
    return api.get(`/matrices/${id}`);
  },

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<AxiosResponse<ApiResponse<TMatrixResponse[]>>> {
    return api.get("/matrices", { params });
  },

  getBySubject(
    subjectId: number,
    params?: { page?: number; size?: number },
  ): Promise<AxiosResponse<ApiResponse<TMatrixResponse[]>>> {
    return api.get(`/matrices/subject/${subjectId}`, { params });
  },

  getMyMatrices(params?: { page?: number; size?: number }): Promise<AxiosResponse<ApiResponse<TMatrixResponse[]>>> {
    return api.get("/matrices/my-matrices", { params });
  },

  search(keyword: string): Promise<AxiosResponse<ApiResponse<TMatrixResponse[]>>> {
    return api.get("/matrices/search", { params: { keyword } });
  },

  setActiveStatus(id: number, isActive: boolean): Promise<AxiosResponse<ApiResponse<TMatrixResponse>>> {
    return api.put(`/matrices/${id}/active`, null, { params: { isActive } });
  },

  delete(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/matrices/${id}`);
  },
};

export const matrixVersionApi = {
  create(data: TMatrixVersionRequest): Promise<AxiosResponse<ApiResponse<TMatrixVersionResponse>>> {
    return api.post("/matrix-versions", data);
  },

  generate(data: TGenerateRequest): Promise<AxiosResponse<ApiResponse<TMatrixVersionResponse>>> {
    return api.post("/matrix-versions/generate", data);
  },

  getById(versionId: number): Promise<AxiosResponse<ApiResponse<TMatrixVersionResponse>>> {
    return api.get(`/matrix-versions/${versionId}`);
  },

  getLatest(matrixId: number): Promise<AxiosResponse<ApiResponse<TMatrixVersionResponse>>> {
    return api.get(`/matrix-versions/matrix/${matrixId}/latest`);
  },

  getAllByMatrix(matrixId: number): Promise<AxiosResponse<ApiResponse<TMatrixVersionResponse[]>>> {
    return api.get(`/matrix-versions/matrix/${matrixId}/all`);
  },

  getAll(params?: { page?: number; size?: number }): Promise<AxiosResponse<ApiResponse<TMatrixVersionResponse[]>>> {
    return api.get("/matrix-versions", { params });
  },

  delete(versionId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/matrix-versions/${versionId}`);
  },
};

export const matrixDetailApi = {
  getByVersion(versionId: number): Promise<AxiosResponse<ApiResponse<TMatrixDetailResponse[]>>> {
    return api.get(`/matrix-details/version/${versionId}`);
  },

  update(id: number, data: TMatrixDetailRequest): Promise<AxiosResponse<ApiResponse<TMatrixDetailResponse>>> {
    return api.put(`/matrix-details/${id}`, data);
  },

  delete(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/matrix-details/${id}`);
  },
};
