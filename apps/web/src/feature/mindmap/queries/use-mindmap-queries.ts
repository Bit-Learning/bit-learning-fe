import { useMutation } from "@tanstack/react-query";
import { radialmindmapApi, symmetrichorizontalmindmapApi, horizontalmindmapApi } from "../apis/mindmap.api";
import type { GenerateMindMapRequest } from "../types/mindmap.type";

export const mindmapKeys = {
    all: ["mindmap"] as const,
    generate: () => [...mindmapKeys.all, "generate"] as const,
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