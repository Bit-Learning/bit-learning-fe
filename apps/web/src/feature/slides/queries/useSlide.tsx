import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slideApi } from "../apis/slide.api";
import { toast } from "@/shared/components/Sonner";
import { extractApiErrorMessage } from "@/shared/lib/api-error";
import type { SlideRequest } from "../types/slide.type";

const extractGenerateSlideErrorMessage = (error: unknown) => {
	const responseData = (
		error as {
			response?: {
				data?: {
					errorData?: {
						slideCount?: string | string[];
					};
				};
			};
		}
	)?.response?.data;

	const slideCountError = responseData?.errorData?.slideCount;
	if (slideCountError) {
		const detail = Array.isArray(slideCountError)
			? slideCountError.join(", ")
			: slideCountError;

		if (detail.includes("must be less than or equal to 15")) {
			return "Số lượng slide không hợp lệ: tối đa 15 slide cho mỗi lần tạo.";
		}

		return `Số lượng slide không hợp lệ: ${detail}.`;
	}

	return extractApiErrorMessage(
		error,
		"Đã xảy ra lỗi khi tạo slide. Vui lòng thử lại.",
	);
};

export const slideKeys = {
	all: ["slide"] as const,
	mySlides: () => [...slideKeys.all, "mySlides"] as const,
	mySlidesList: (page: number, size: number) =>
		[...slideKeys.mySlides(), page, size] as const,
	slideDetail: (id: number) => [...slideKeys.all, "detail", id] as const,
	placeholders: (filename: string) =>
		[...slideKeys.all, "placeholders", filename] as const,
};

export const useMySlides = (
	page = 0,
	size = 10,
	sortBy = "createdAt",
	sortDir = "desc",
) => {
	return useQuery({
		queryKey: slideKeys.mySlidesList(page, size),
		queryFn: async () => {
			const response = await slideApi.getMySlides(page, size, sortBy, sortDir);
			return response.data;
		},
	});
};

export const useSlideDetail = (id: number) => {
	return useQuery({
		queryKey: slideKeys.slideDetail(id),
		queryFn: async () => {
			const response = await slideApi.getSlideById(id);
			return response.data;
		},
		enabled: !!id,
	});
};

export const useGenerateSlide = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: SlideRequest) => slideApi.generateSlide(request),
		onSuccess: (response) => {
			toast.success({
				title: "Tạo slide thành công!",
				description:
					response.data.message ||
					`Đã tạo ${response.data.data?.slideCount || 0} slides cho chủ đề "${response.data.data?.topic}".`,
			});
			queryClient.invalidateQueries({ queryKey: slideKeys.mySlides() });
		},
		onError: (error: unknown) => {
			toast.error({
				title: "Tạo slide thất bại!",
				description: extractGenerateSlideErrorMessage(error),
			});
		},
	});
};

export const useDeleteSlide = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => slideApi.deleteSlide(id),
		onSuccess: (response) => {
			toast.success({
				title: "Xóa slide thành công!",
				description:
					response.data.message || "Slide đã được xóa khỏi danh sách của bạn.",
			});
			queryClient.invalidateQueries({ queryKey: slideKeys.mySlides() });
		},
		onError: (error: unknown) => {
			toast.error({
				title: "Xóa slide thất bại!",
				description: extractApiErrorMessage(
					error,
					"Không thể xóa slide. Vui lòng thử lại.",
				),
			});
		},
	});
};

export const useExtractPlaceholders = () => {
	return useMutation({
		mutationFn: (file: File) => slideApi.extractPlaceholders(file),
		onSuccess: (response) => {
			const placeholderCount = response.data.data?.length || 0;
			toast.success({
				title: "Trích xuất thành công!",
				description: `Đã tìm thấy ${placeholderCount} placeholder trong template.`,
			});
		},
		onError: (error: unknown) => {
			toast.error({
				title: "Trích xuất thất bại!",
				description: extractApiErrorMessage(
					error,
					"Không thể đọc file template. Vui lòng kiểm tra lại file.",
				),
			});
		},
	});
};
