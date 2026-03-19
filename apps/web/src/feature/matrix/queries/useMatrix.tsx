import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { matrixApi, matrixVersionApi, matrixDetailApi } from "../apis/matrix.api";
import type { TMatrixRequest, TMatrixVersionRequest, TMatrixDetailRequest } from "../types/matrix.type";

export const matrixKeys = {
  all: ["matrices"] as const,
  list: (page: number, size: number) => ["matrices", "list", page, size] as const,
  detail: (id: number) => ["matrices", "detail", id] as const,
  bySubject: (subjectId: number) => ["matrices", "subject", subjectId] as const,
  myMatrices: () => ["matrices", "my"] as const,
  search: (keyword: string) => ["matrices", "search", keyword] as const,
};

export const versionKeys = {
  all: ["matrix-versions"] as const,
  detail: (id: number) => ["matrix-versions", "detail", id] as const,
  byMatrix: (matrixId: number) => ["matrix-versions", "matrix", matrixId] as const,
  latest: (matrixId: number) => ["matrix-versions", "latest", matrixId] as const,
};

export const detailKeys = {
  byVersion: (versionId: number) => ["matrix-details", "version", versionId] as const,
};

export const useMatrices = (page = 0, size = 10) => {
  return useQuery({
    queryKey: matrixKeys.list(page, size),
    queryFn: async () => {
      const res = await matrixApi.getAll({ page, size });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMatrixDetail = (id?: number) => {
  return useQuery({
    queryKey: matrixKeys.detail(id ?? 0),
    queryFn: async () => {
      if (!id) return null;
      const res = await matrixApi.getById(id);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMatricesBySubject = (subjectId?: number, page = 0, size = 10) => {
  return useQuery({
    queryKey: [...matrixKeys.bySubject(subjectId ?? 0), page, size],
    queryFn: async () => {
      if (!subjectId) return null;
      const res = await matrixApi.getBySubject(subjectId, { page, size });
      return res.data;
    },
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyMatrices = (page = 0, size = 10) => {
  return useQuery({
    queryKey: [...matrixKeys.myMatrices(), page, size],
    queryFn: async () => {
      const res = await matrixApi.getMyMatrices({ page, size });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchMatrices = (keyword: string) => {
  return useQuery({
    queryKey: matrixKeys.search(keyword),
    queryFn: async () => {
      const res = await matrixApi.search(keyword);
      return res.data.data;
    },
    enabled: keyword.length > 0,
    staleTime: 60 * 1000,
  });
};

export const useCreateMatrix = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TMatrixRequest) => matrixApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: matrixKeys.all });
      toast.success({ title: "Thành công", description: "Tạo ma trận thành công" });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Tạo ma trận thất bại" });
    },
  });
};

export const useUpdateMatrix = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TMatrixRequest }) => matrixApi.update(id, data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: matrixKeys.all });
      qc.invalidateQueries({ queryKey: matrixKeys.detail(v.id) });
      toast.success({ title: "Thành công", description: "Cập nhật ma trận thành công" });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Cập nhật ma trận thất bại" });
    },
  });
};

export const useDeleteMatrix = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => matrixApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: matrixKeys.all });
      toast.success({ title: "Thành công", description: "Xóa ma trận thành công" });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Xóa ma trận thất bại" });
    },
  });
};

export const useToggleMatrixActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => matrixApi.setActiveStatus(id, isActive),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: matrixKeys.all });
      qc.invalidateQueries({ queryKey: matrixKeys.detail(v.id) });
      toast.success({
        title: "Thành công",
        description: v.isActive ? "Đã kích hoạt ma trận" : "Đã vô hiệu hóa ma trận",
      });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Cập nhật trạng thái thất bại" });
    },
  });
};

export const useMatrixVersions = (matrixId?: number) => {
  return useQuery({
    queryKey: versionKeys.byMatrix(matrixId ?? 0),
    queryFn: async () => {
      if (!matrixId) return null;
      const res = await matrixVersionApi.getAllByMatrix(matrixId);
      return res.data.data;
    },
    enabled: !!matrixId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLatestVersion = (matrixId?: number) => {
  return useQuery({
    queryKey: versionKeys.latest(matrixId ?? 0),
    queryFn: async () => {
      if (!matrixId) return null;
      const res = await matrixVersionApi.getLatest(matrixId);
      return res.data.data;
    },
    enabled: !!matrixId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVersionDetail = (versionId?: number) => {
  return useQuery({
    queryKey: versionKeys.detail(versionId ?? 0),
    queryFn: async () => {
      if (!versionId) return null;
      const res = await matrixVersionApi.getById(versionId);
      return res.data.data;
    },
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TMatrixVersionRequest) => matrixVersionApi.create(data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: versionKeys.byMatrix(v.matrixId) });
      qc.invalidateQueries({ queryKey: matrixKeys.detail(v.matrixId) });
      toast.success({ title: "Thành công", description: "Tạo version thành công" });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Tạo version thất bại" });
    },
  });
};

export const useDeleteVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: number) => matrixVersionApi.delete(versionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: versionKeys.all });
      toast.success({ title: "Thành công", description: "Xóa version thành công" });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Xóa version thất bại" });
    },
  });
};

export const useMatrixDetails = (versionId?: number) => {
  return useQuery({
    queryKey: detailKeys.byVersion(versionId ?? 0),
    queryFn: async () => {
      if (!versionId) return null;
      const res = await matrixDetailApi.getByVersion(versionId);
      return res.data.data;
    },
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateMatrixDetail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TMatrixDetailRequest }) => matrixDetailApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matrix-details"] });
      toast.success({ title: "Thành công", description: "Cập nhật chi tiết thành công" });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Cập nhật chi tiết thất bại" });
    },
  });
};

export const useDeleteMatrixDetail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => matrixDetailApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matrix-details"] });
      toast.success({ title: "Thành công", description: "Xóa chi tiết thành công" });
    },
    onError: (e: any) => {
      toast.error({ title: "Lỗi", description: e?.response?.data?.message || "Xóa chi tiết thất bại" });
    },
  });
};
