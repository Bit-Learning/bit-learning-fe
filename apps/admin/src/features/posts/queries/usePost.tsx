import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../apis/post.api";
import { toast } from "sonner";

export const postKeys = {
	all: ["posts"] as const,
	list: (page: number, size: number) => ["posts", "list", page, size] as const,
	detail: (id: number) => ["posts", "detail", id] as const,
	comments: (postId: number) => ["posts", "comments", postId] as const,
};

export const useGetPosts = (page: number = 0, size: number = 10) => {
	return useQuery({
		queryKey: postKeys.list(page, size),
		queryFn: async () => {
			const response = await postApi.getAllPosts(page, size);
			return {
				content: response.data.data || [],
				page: response.data.page,
			};
		},
	});
};

export const useGetPostDetail = (id: number) => {
	return useQuery({
		queryKey: postKeys.detail(id),
		queryFn: async () => {
			const response = await postApi.getPostById(id);
			return response.data.data;
		},
		enabled: !!id,
	});
};

export const useGetComments = (postId: number) => {
	return useQuery({
		queryKey: postKeys.comments(postId),
		queryFn: async () => {
			const response = await postApi.getCommentsOfPost(postId);
			return response.data.data;
		},
		enabled: !!postId,
	});
};

export const useBanPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, isBanned }: { id: number; isBanned: boolean }) =>
			isBanned ? postApi.unbanPost(id) : postApi.banPost(id),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: postKeys.all });
			queryClient.invalidateQueries({
				queryKey: postKeys.detail(variables.id),
			});
			const action = variables.isBanned ? "mở khóa" : "khóa";
			toast.success(
				response.data.message || `Đã ${action} bài viết thành công`,
			);
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật trạng thái bài viết",
			);
		},
	});
};

export const useFeaturePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) =>
			isFeatured ? postApi.unfeaturePost(id) : postApi.featurePost(id),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: postKeys.all });
			queryClient.invalidateQueries({
				queryKey: postKeys.detail(variables.id),
			});
			const action = variables.isFeatured ? "bỏ nổi bật" : "đánh dấu nổi bật";
			toast.success(
				response.data.message || `Đã ${action} bài viết thành công`,
			);
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật trạng thái nổi bật",
			);
		},
	});
};

export const useBanComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			isBanned,
		}: {
			id: number;
			isBanned: boolean;
			postId: number;
		}) => (isBanned ? postApi.unbanComment(id) : postApi.banComment(id)),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: postKeys.comments(variables.postId),
			});
			const action = variables.isBanned ? "mở khóa" : "khóa";
			toast.success(
				response.data.message || `Đã ${action} bình luận thành công`,
			);
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật trạng thái bình luận",
			);
		},
	});
};
