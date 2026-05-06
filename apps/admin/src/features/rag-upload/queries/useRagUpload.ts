import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ragApi } from "../apis/rag.api";
import { toast } from "sonner";

export const useUploadTextbook = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			file,
			bookName,
			publisher,
			grade,
			productName,
		}: {
			file: File;
			bookName: string;
			publisher: string;
			grade?: string;
			productName?: string;
		}) => ragApi.uploadTextbook(file, bookName, publisher, grade, productName),
		onSuccess: (response) => {
			toast.success(
				response.data.message || "Đã gửi yêu cầu tải lên thành công",
			);
			queryClient.invalidateQueries({ queryKey: ["rag-uploads"] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Lỗi khi tải lên tài liệu");
		},
	});
};

export const useRagUploads = (page = 0, size = 10) => {
	return useQuery({
		queryKey: ["rag-uploads", page, size],
		queryFn: async () => {
			const response = await ragApi.getUploads(page, size);
			return response.data.data || [];
		},
	});
};
