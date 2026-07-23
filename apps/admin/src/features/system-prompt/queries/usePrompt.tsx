import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/Sonner";
import { promptApi } from "../apis/prompt.api";
import {
	SystemPromptPatchRequest,
	SystemPromptRequest,
} from "../types/prompt.type";

export const promptKeys = {
	all: ["system-prompts"] as const,
	list: () => [...promptKeys.all, "list"] as const,
};

export const usePrompts = () =>
	useQuery({
		queryKey: promptKeys.list(),
		queryFn: async () => {
			const res = await promptApi.getAll();
			return res.data.data ?? [];
		},
	});

export const useCreatePrompt = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: SystemPromptRequest) => promptApi.create(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: promptKeys.list() });
			toast.success({ title: "Tạo system prompt thành công" });
		},
		onError: () => {
			toast.error({ title: "Tạo system prompt thất bại" });
		},
	});
};

export const usePatchPrompt = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: SystemPromptPatchRequest;
		}) => promptApi.patch(id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: promptKeys.list() });
			toast.success({ title: "Cập nhật system prompt thành công" });
		},
		onError: () => {
			toast.error({ title: "Cập nhật system prompt thất bại" });
		},
	});
};

export const useDeletePrompt = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => promptApi.delete(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: promptKeys.list() });
			toast.success({ title: "Xóa system prompt thành công" });
		},
		onError: () => {
			toast.error({ title: "Xóa system prompt thất bại" });
		},
	});
};
