import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/Sonner";
import { mlectureApi } from "../api/mlecture.api";
import type {
	CreateLectureQuizRequest,
	CreateLectureRequest,
	CreateLectureTextRequest,
	QuizUpdateRequest,
	UpdateLectureRequest,
	UpdateLectureTextRequest,
} from "../types/mlecture.api";

export const mlectureKeys = {
	all: ["mlectures"] as const,
	bySection: (sectionId: number) =>
		["mlectures", "section", sectionId] as const,
	detail: (id: number) => ["mlectures", "detail", id] as const,
	quiz: (id: number) => ["mlectures", "quiz", id] as const,
};

export const useUpdateLecture = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateLectureRequest }) =>
			mlectureApi.updateLecture(id, data),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			queryClient.invalidateQueries({
				queryKey: mlectureKeys.detail(variables.id),
			});
			toast.success({
				title: "Cập nhật bài học thành công!",
				description:
					response.data.message || "Thông tin bài học đã được cập nhật.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Cập nhật bài học thất bại!",
				description:
					error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật bài học.",
			});
		},
	});
};

export const useDeleteLecture = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => mlectureApi.deleteLecture(id),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			toast.success({
				title: "Xóa bài học thành công!",
				description: response.data.message || "Bài học đã được xóa vĩnh viễn.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Xóa bài học thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi xóa bài học.",
			});
		},
	});
};

export const useHideOrShowLecture = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) =>
			mlectureApi.hideOrShowLecture(id, isHidden),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			const action = variables.isHidden ? "ẩn" : "hiển thị";
			toast.success({
				title: `${action === "ẩn" ? "Ẩn" : "Hiển thị"} bài học thành công!`,
				description: response.data.message || `Bài học đã được ${action}.`,
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Cập nhật trạng thái thất bại!",
				description:
					error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật trạng thái.",
			});
		},
	});
};

export const useCreateLectureVideo = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			request,
			video,
		}: {
			request: CreateLectureRequest;
			video: File;
		}) => {
			const requestJson = JSON.stringify(request);
			return mlectureApi.createLectureVideo(requestJson, video);
		},
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			queryClient.invalidateQueries({
				queryKey: mlectureKeys.bySection(variables.request.sectionId),
			});
			toast.success({
				title: "Tạo bài học video thành công!",
				description:
					response.data.message ||
					"Video đã được tải lên và bài học đã sẵn sàng.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Tạo bài học video thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi tải lên video.",
			});
		},
	});
};

export const useUpdateLectureVideo = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, video }: { id: number; video: File }) =>
			mlectureApi.updateLectureVideo(id, video),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			queryClient.invalidateQueries({
				queryKey: mlectureKeys.detail(variables.id),
			});
			toast.success({
				title: "Cập nhật video thành công!",
				description: response.data.message || "Video mới đã được tải lên.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Cập nhật video thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi tải lên video.",
			});
		},
	});
};

export const useCreateLectureQuiz = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateLectureQuizRequest) =>
			mlectureApi.createLectureQuiz(data),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			queryClient.invalidateQueries({
				queryKey: mlectureKeys.bySection(variables.lecture.sectionId),
			});
			toast.success({
				title: "Tạo bài kiểm tra thành công!",
				description:
					response.data.message || "Bài kiểm tra đã được tạo với các câu hỏi.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Tạo bài kiểm tra thất bại!",
				description:
					error?.response?.data?.message ||
					"Đã xảy ra lỗi khi tạo bài kiểm tra.",
			});
		},
	});
};

export const useUpdateLectureQuiz = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			quizzes,
		}: {
			id: number;
			quizzes: QuizUpdateRequest[];
		}) => mlectureApi.updateLectureQuiz(id, quizzes),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			queryClient.invalidateQueries({
				queryKey: mlectureKeys.quiz(variables.id),
			});
			toast.success({
				title: "Cập nhật bài kiểm tra thành công!",
				description: response.data.message || "Các câu hỏi đã được cập nhật.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Cập nhật bài kiểm tra thất bại!",
				description:
					error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật bài kiểm tra.",
			});
		},
	});
};

export const useCreateLectureText = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateLectureTextRequest) =>
			mlectureApi.createLectureText(data),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			queryClient.invalidateQueries({
				queryKey: mlectureKeys.bySection(variables.lecture.sectionId),
			});
			toast.success({
				title: "Tạo bài học văn bản thành công!",
				description: response.data.message || "Nội dung văn bản đã được lưu.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Tạo bài học văn bản thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi lưu nội dung.",
			});
		},
	});
};

export const useUpdateLectureText = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: UpdateLectureTextRequest;
		}) => mlectureApi.updateLectureText(id, data),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: mlectureKeys.all });
			queryClient.invalidateQueries({
				queryKey: mlectureKeys.detail(variables.id),
			});
			toast.success({
				title: "Cập nhật nội dung thành công!",
				description:
					response.data.message || "Nội dung văn bản đã được cập nhật.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Cập nhật nội dung thất bại!",
				description:
					error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật nội dung.",
			});
		},
	});
};
