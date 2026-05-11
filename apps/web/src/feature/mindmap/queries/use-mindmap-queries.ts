import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mindmapApi } from "../apis/mindmap.api";
import type { GenerateMindMapRequest, RefineRequest, SaveTreeRequest } from "../types/mindmap.type";

export const mindmapKeys = {
  all: ["mindmap"] as const,
  gallery: () => [...mindmapKeys.all, "gallery"] as const,
  saved: {
    all: ["mindmap", "saved"] as const,
    list: (page: number, size: number) => [...mindmapKeys.saved.all, "list", page, size] as const,
    detail: (id: number) => [...mindmapKeys.saved.all, "detail", id] as const,
    versions: (id: number) => [...mindmapKeys.saved.all, "versions", id] as const,
    version: (id: number, versionNumber: number) => [...mindmapKeys.saved.all, "version", id, versionNumber] as const,
  },
};

export const useGetMindMapGallery = () =>
  useQuery({
    queryKey: mindmapKeys.gallery(),
    queryFn: () => mindmapApi.getGallery(),
    staleTime: 1000 * 60 * 10,
  });

export const useGenerateMindMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: GenerateMindMapRequest) => mindmapApi.generate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.all });
    },
  });
};

export const useRefineMindMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: RefineRequest }) => mindmapApi.refine(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.versions(id) });
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.detail(id) });
    },
  });
};

export const useGetSavedMindMaps = (page = 0, size = 10) =>
  useQuery({
    queryKey: mindmapKeys.saved.list(page, size),
    queryFn: () => mindmapApi.listSaved(page, size),
  });

export const useGetSavedMindMapDetail = (id: number) =>
  useQuery({
    queryKey: mindmapKeys.saved.detail(id),
    queryFn: () => mindmapApi.getById(id),
    enabled: id > 0,
  });

export const useDeleteSavedMindMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => mindmapApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.all });
    },
  });
};

export const useGetMindMapVersions = (id: number) =>
  useQuery({
    queryKey: mindmapKeys.saved.versions(id),
    queryFn: () => mindmapApi.listVersions(id),
    enabled: id > 0,
  });

export const useGetMindMapVersion = (id: number, versionNumber: number) =>
  useQuery({
    queryKey: mindmapKeys.saved.version(id, versionNumber),
    queryFn: () => mindmapApi.getVersion(id, versionNumber),
    enabled: id > 0 && versionNumber > 0,
  });

export const useRestoreMindMapVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versionNumber }: { id: number; versionNumber: number }) =>
      mindmapApi.restoreVersion(id, versionNumber),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.versions(id) });
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.detail(id) });
    },
  });
};

export const useSaveMindMapTree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: SaveTreeRequest }) => mindmapApi.saveTree(id, request),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.versions(id) });
      queryClient.invalidateQueries({ queryKey: mindmapKeys.saved.detail(id) });
    },
  });
};
