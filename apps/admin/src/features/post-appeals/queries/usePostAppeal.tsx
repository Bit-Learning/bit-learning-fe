import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postAppealApi } from "../apis/post-appeal.api";
import type { AppealTicketStatus } from "../types/post-appeal.type";

function getErrorMessage(error: unknown, fallback: string) {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return fallback;
}

export const postAppealKeys = {
	all: ["post-appeals"] as const,
	list: (page: number, size: number, status?: AppealTicketStatus) =>
		["post-appeals", "list", page, size, status ?? "ALL"] as const,
	detail: (id: number) => ["post-appeals", "detail", id] as const,
};

export const useGetPostAppeals = (
	page = 0,
	size = 10,
	status?: AppealTicketStatus,
) => {
	return useQuery({
		queryKey: postAppealKeys.list(page, size, status),
		queryFn: async () => {
			const response = await postAppealApi.getPostAppeals(page, size, status);
			return {
				content: response.data.data || [],
				page: response.data.page,
			};
		},
	});
};

export const useGetPostAppealDetail = (id: number) => {
	return useQuery({
		queryKey: postAppealKeys.detail(id),
		queryFn: async () => {
			const response = await postAppealApi.getPostAppealDetail(id);
			return response.data.data;
		},
		enabled: !!id,
	});
};

export const useClosePostAppeal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: number }) => postAppealApi.closePostAppeal(id),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: postAppealKeys.all });
			queryClient.invalidateQueries({
				queryKey: postAppealKeys.detail(variables.id),
			});
			toast.success(
				response.data.message || "Đã đóng khiếu nại bài viết thành công",
			);
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Đã xảy ra lỗi khi đóng khiếu nại"));
		},
	});
};

export const useUnbanAppealPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId }: { postId: number; ticketId: number }) =>
			postAppealApi.unbanAppealPost(postId),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: postAppealKeys.all });
			queryClient.invalidateQueries({
				queryKey: postAppealKeys.detail(variables.ticketId),
			});
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success(response.data.message || "Đã mở khóa bài viết thành công");
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Đã xảy ra lỗi khi mở khóa bài viết"));
		},
	});
};

export const useCommentOnPostAppeal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, content }: { id: number; content: string }) =>
			postAppealApi.commentOnPostAppeal(id, content),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: postAppealKeys.detail(variables.id),
			});
			queryClient.invalidateQueries({ queryKey: postAppealKeys.all });
			toast.success(response.data.message || "Đã gửi phản hồi cho khiếu nại");
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Đã xảy ra lỗi khi gửi phản hồi"));
		},
	});
};

export const useReplyPostAppealComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			ticketCommentId,
			content,
		}: {
			ticketId: number;
			ticketCommentId: number;
			content: string;
		}) => postAppealApi.replyOnPostAppeal(ticketCommentId, content),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: postAppealKeys.detail(variables.ticketId),
			});
			queryClient.invalidateQueries({ queryKey: postAppealKeys.all });
			toast.success(response.data.message || "Đã gửi trả lời thành công");
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Đã xảy ra lỗi khi gửi trả lời"));
		},
	});
};
