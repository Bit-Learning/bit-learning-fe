import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    radialmindmapApi,
    symmetrichorizontalmindmapApi,
    horizontalmindmapApi,
    savedMindMapApi,
} from "../apis/mindmap.api";
import type { GenerateMindMapRequest, SaveMindMapRequest } from "../types/mindmap.type";

export const mindmapKeys = {
    all: ["mindmap"] as const,
    generate: () => [...mindmapKeys.all, "generate"] as const,
};

export const savedMindMapKeys = {
    all: ["savedMindMap"] as const,
    list: (page: number, size: number) => [...savedMindMapKeys.all, "list", page, size] as const,
    detail: (id: number) => [...savedMindMapKeys.all, "detail", id] as const,
};

export const useGenerateRadialMindMap = () => {
    return useMutation({
        mutationFn: (request: GenerateMindMapRequest) =>
            radialmindmapApi.generateRadialLayout(request),
    });
};

export const useGenerateSymmetricHorizontalMindMap = () => {
    return useMutation({
        mutationFn: (request: GenerateMindMapRequest) =>
            symmetrichorizontalmindmapApi.generateSymmetricHorizontalLayout(request),
    });
};

export const useGenerateHorizontalMindMap = () => {
    return useMutation({
        mutationFn: (request: GenerateMindMapRequest) =>
            horizontalmindmapApi.generateHorizontalLayout(request),
    });
};

export const useSaveMindMap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: SaveMindMapRequest) => savedMindMapApi.save(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: savedMindMapKeys.all });
        },
    });
};

export const useGetSavedMindMaps = (page = 0, size = 12) => {
    return useQuery({
        queryKey: savedMindMapKeys.list(page, size),
        queryFn: () => savedMindMapApi.list(page, size),
    });
};

export const useDeleteSavedMindMap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => savedMindMapApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: savedMindMapKeys.all });
        },
    });
};
