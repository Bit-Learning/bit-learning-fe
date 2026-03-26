import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/Sonner";
import { mindmapApi } from "../apis/mindmap.api";
import type {
  MindMapStructurePatchRequest,
  MindMapStructureRequest,
  MindMapThemePatchRequest,
  MindMapThemeRequest,
} from "../types/mindmap.type";
export const mindmapKeys = {
  all: ["mindmap"] as const,
  gallery: () => [...mindmapKeys.all, "gallery"] as const,
  adminStructures: () => [...mindmapKeys.all, "admin", "structures"] as const,
  adminThemes: () => [...mindmapKeys.all, "admin", "themes"] as const,
};

export const useMindMapGallery = () =>
  useQuery({
    queryKey: mindmapKeys.gallery(),
    queryFn: async () => {
      const res = await mindmapApi.getGallery();
      return res.data.data;
    },
  });

export const useAdminStructures = () =>
  useQuery({
    queryKey: mindmapKeys.adminStructures(),
    queryFn: async () => {
      const res = await mindmapApi.getAllStructures();
      return res.data.data ?? [];
    },
  });

export const useAdminCreateStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ request, thumbnail }: { request: MindMapStructureRequest; thumbnail?: File | null }) =>
      mindmapApi.createStructure(request, thumbnail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mindmapKeys.adminStructures() });
      qc.invalidateQueries({ queryKey: mindmapKeys.gallery() });
      toast.success({ title: "Tạo structure thành công" });
    },
    onError: () => {
      toast.error({ title: "Tạo structure thất bại" });
    },
  });
};

export const useAdminPatchStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
      thumbnail,
    }: {
      id: number;
      request: MindMapStructurePatchRequest;
      thumbnail?: File | null;
    }) => mindmapApi.patchStructure(id, request, thumbnail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mindmapKeys.adminStructures() });
      qc.invalidateQueries({ queryKey: mindmapKeys.gallery() });
      toast.success({ title: "Cập nhật structure thành công" });
    },
    onError: () => {
      toast.error({ title: "Cập nhật structure thất bại" });
    },
  });
};

export const useAdminDeleteStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => mindmapApi.deleteStructure(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mindmapKeys.adminStructures() });
      qc.invalidateQueries({ queryKey: mindmapKeys.gallery() });
      toast.success({ title: "Xóa structure thành công" });
    },
    onError: () => {
      toast.error({ title: "Xóa structure thất bại" });
    },
  });
};

export const useAdminThemes = () =>
  useQuery({
    queryKey: mindmapKeys.adminThemes(),
    queryFn: async () => {
      const res = await mindmapApi.getAllThemes();
      return res.data.data ?? [];
    },
  });

export const useAdminCreateTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ request, thumbnail }: { request: MindMapThemeRequest; thumbnail?: File | null }) =>
      mindmapApi.createTheme(request, thumbnail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mindmapKeys.adminThemes() });
      qc.invalidateQueries({ queryKey: mindmapKeys.gallery() });
      toast.success({ title: "Tạo theme thành công" });
    },
    onError: () => {
      toast.error({ title: "Tạo theme thất bại" });
    },
  });
};

export const useAdminPatchTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
      thumbnail,
    }: {
      id: number;
      request: MindMapThemePatchRequest;
      thumbnail?: File | null;
    }) => mindmapApi.patchTheme(id, request, thumbnail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mindmapKeys.adminThemes() });
      qc.invalidateQueries({ queryKey: mindmapKeys.gallery() });
      toast.success({ title: "Cập nhật theme thành công" });
    },
    onError: () => {
      toast.error({ title: "Cập nhật theme thất bại" });
    },
  });
};

export const useAdminDeleteTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => mindmapApi.deleteTheme(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mindmapKeys.adminThemes() });
      qc.invalidateQueries({ queryKey: mindmapKeys.gallery() });
      toast.success({ title: "Xóa theme thành công" });
    },
    onError: () => {
      toast.error({ title: "Xóa theme thất bại" });
    },
  });
};
