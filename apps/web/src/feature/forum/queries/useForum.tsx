import {
	useMutation,
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { categoryApi } from "../apis/category.api";
import { commentApi } from "../apis/comment.api";
import { hashtagApi } from "../apis/hashtag.api";
import { postApi } from "../apis/post.api";
import { forumSubscriptionApi } from "../apis/subscription.api";
import { toast } from "@/shared/components/Sonner";
import {
	setCommentsAction,
	setHashtagsAction,
	setMyPostsAction,
	setPostsAction,
	setSelectedPostAction,
} from "../stores/forum.store";
import type {
	CreateCommentRequest,
	CreatePostRequest,
	FilterByAuthorParams,
	ForumSubscriptionRequest,
	PaginationParams,
	PostBanAppealRequest,
	PostFeedParams,
	ReactionType,
	UpdateCommentRequest,
	UpdatePostRequest,
} from "../types/forum.type";

export const useForumPosts = (params: PostFeedParams = {}) => {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ["forum-posts", params],
		queryFn: async () => {
			const response = await postApi.getAllPosts(params);
			if (response.data) dispatch(setPostsAction(response.data));
			return response;
		},
	});
};

export const useInfiniteForumPosts = (
	params: Omit<PostFeedParams, "page"> & { size?: number } = {},
) => {
	return useInfiniteQuery({
		queryKey: ["forum-posts-infinite", params],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) =>
			postApi.getAllPosts({
				...params,
				page: pageParam,
				size: params.size ?? 12,
			}),
		getNextPageParam: (lastPage) => {
			if (!lastPage.page || lastPage.page.last) return undefined;
			return lastPage.page.page + 1;
		},
	});
};

export const useFeaturedForumPosts = (limit = 4) =>
	useQuery({
		queryKey: ["forum-featured-posts", limit],
		queryFn: () => postApi.getFeaturedPosts(limit),
	});

export const useTrendingForumPosts = (limit = 8, enabled = true) =>
	useQuery({
		queryKey: ["forum-trending-posts", limit],
		queryFn: () => postApi.getTrendingPosts(limit),
		enabled,
	});

export const useRecommendedForumPosts = (limit = 6, enabled = true) =>
	useQuery({
		queryKey: ["forum-recommended-posts", limit],
		queryFn: () => postApi.getRecommendedPosts(limit),
		enabled,
	});

export const useMostViewedForumPosts = (limit = 5, enabled = true) =>
	useQuery({
		queryKey: ["forum-most-viewed-posts", limit],
		queryFn: () =>
			postApi.getAllPosts({
				page: 0,
				size: limit,
				sort: "most_viewed",
			}),
		select: (response) => response.data ?? [],
		enabled,
	});

export const useLatestForumList = (limit = 5, enabled = true) =>
	useQuery({
		queryKey: ["forum-latest-list", limit],
		queryFn: () => postApi.getLatestPosts({ page: 0, size: limit }),
		select: (response) => response.data ?? [],
		enabled,
	});

export const useForumCategories = () =>
	useQuery({
		queryKey: ["forum-categories"],
		queryFn: () => categoryApi.getAllCategories(),
	});

export const usePopularForumTags = (limit = 20) =>
	useQuery({
		queryKey: ["forum-popular-tags", limit],
		queryFn: () => hashtagApi.getPopularTags(limit),
	});

export const useForumPostById = (id: number) => {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ["forum-post", id],
		queryFn: async () => {
			const response = await postApi.getPostById(id);
			if (response.data) dispatch(setSelectedPostAction(response.data));
			return response;
		},
		enabled: !!id,
	});
};

export const useForumPostBySlug = (slug?: string) => {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ["forum-post-slug", slug],
		queryFn: async () => {
			const response = await postApi.getPostBySlug(slug!);
			if (response.data) dispatch(setSelectedPostAction(response.data));
			return response;
		},
		enabled: !!slug,
	});
};

export const useForumPostsByAuthor = (params: FilterByAuthorParams) => {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ["forum-posts-by-author", params],
		queryFn: async () => {
			const response = await postApi.getPostsByAuthor(params);
			if (response.data) dispatch(setMyPostsAction(response.data));
			return response;
		},
		enabled: !!params.authorId,
	});
};

export const useSubscribeToForumPosts = () =>
	useMutation({
		mutationFn: (data: ForumSubscriptionRequest) =>
			forumSubscriptionApi.subscribe(data),
		onSuccess: () => {
			toast.success({
				title: "Subscribed successfully",
				description:
					"You will receive email updates when new forum posts are published.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title:
					error?.response?.data?.message ||
					error?.message ||
					"Could not save your subscription",
			});
		},
	});

function invalidateForumQueries(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
	queryClient.invalidateQueries({ queryKey: ["forum-posts-infinite"] });
	queryClient.invalidateQueries({ queryKey: ["forum-post"] });
	queryClient.invalidateQueries({ queryKey: ["forum-post-slug"] });
	queryClient.invalidateQueries({ queryKey: ["forum-posts-by-author"] });
	queryClient.invalidateQueries({ queryKey: ["forum-featured-posts"] });
	queryClient.invalidateQueries({ queryKey: ["forum-trending-posts"] });
	queryClient.invalidateQueries({ queryKey: ["forum-recommended-posts"] });
	queryClient.invalidateQueries({ queryKey: ["forum-most-viewed-posts"] });
	queryClient.invalidateQueries({ queryKey: ["forum-latest-list"] });
	queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
	queryClient.invalidateQueries({ queryKey: ["forum-popular-tags"] });
}

export const useCreateForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			data,
			attachments,
		}: {
			data: CreatePostRequest;
			attachments?: File[];
		}) => postApi.createPost(data, attachments),
		onSuccess: () => {
			invalidateForumQueries(queryClient);
			toast.success({ title: "Tạo bài viết thành công!" });
		},
		onError: (error: any) => {
			toast.error({ title: error.message || "Có lỗi xảy ra khi tạo bài viết" });
		},
	});
};

export const useUpdateForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
			attachments,
		}: {
			id: number;
			data: UpdatePostRequest;
			attachments?: File[];
		}) => postApi.updatePost(id, data, attachments),
		onSuccess: () => {
			invalidateForumQueries(queryClient);
			toast.success({ title: "Cập nhật bài viết thành công!" });
		},
		onError: (error: any) => {
			toast.error({
				title: error.message || "Có lỗi xảy ra khi cập nhật bài viết",
			});
		},
	});
};

export const useDeleteForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => postApi.deletePost(id),
		onSuccess: () => {
			invalidateForumQueries(queryClient);
			toast.success({ title: "Xóa bài viết thành công!" });
		},
		onError: (error: any) => {
			toast.error({ title: error.message || "Có lỗi xảy ra khi xóa bài viết" });
		},
	});
};

export const useAppealBannedForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: PostBanAppealRequest }) =>
			postApi.appealPostBan(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["forum-post"] });
			queryClient.invalidateQueries({ queryKey: ["forum-post-slug"] });
			queryClient.invalidateQueries({ queryKey: ["forum-posts-by-author"] });
			toast.success({
				title: "Đã gửi khiếu nại",
				description:
					"Quản trị viên sẽ xem xét lại bài viết của bạn trong thời gian sớm nhất.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title:
					error?.response?.data?.message ||
					error?.message ||
					"Không thể gửi khiếu nại cho bài viết này",
			});
		},
	});
};

export const useReactToForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			reactionType,
		}: {
			id: number;
			reactionType: ReactionType;
		}) => postApi.reactToPost(id, reactionType),
		onSuccess: () => invalidateForumQueries(queryClient),
	});
};

export const useLikeForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => postApi.likePost(id),
		onSuccess: () => invalidateForumQueries(queryClient),
	});
};

export const useDislikeForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => postApi.dislikePost(id),
		onSuccess: () => invalidateForumQueries(queryClient),
	});
};

export const useUnlikeOrUndislikeForumPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => postApi.unlikeOrUndislikePost(id),
		onSuccess: () => invalidateForumQueries(queryClient),
	});
};

export const useForumComments = (
	postId: number,
	params: PaginationParams = {},
) => {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ["forum-comments", postId, params],
		queryFn: async () => {
			const response = await commentApi.getAllComments(postId, params);
			if (response.data) dispatch(setCommentsAction(response.data));
			return response;
		},
		enabled: !!postId,
	});
};

export const useCreateForumComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCommentRequest) => commentApi.createComment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
			queryClient.invalidateQueries({ queryKey: ["forum-post"] });
			toast.success({ title: "Bình luận thành công!" });
		},
		onError: (error: any) => {
			toast.error({ title: error.message || "Có lỗi xảy ra khi bình luận" });
		},
	});
};

export const useUpdateForumComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateCommentRequest }) =>
			commentApi.updateComment(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
			toast.success({ title: "Cập nhật bình luận thành công!" });
		},
		onError: (error: any) => {
			toast.error({
				title: error.message || "Có lỗi xảy ra khi cập nhật bình luận",
			});
		},
	});
};

export const useDeleteForumComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => commentApi.deleteComment(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
			toast.success({ title: "Xóa bình luận thành công!" });
		},
		onError: (error: any) => {
			toast.error({
				title: error.message || "Có lỗi xảy ra khi xóa bình luận",
			});
		},
	});
};

export const useReplyForumComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, content }: { id: number; content: string }) =>
			commentApi.replyComment(id, content),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
			toast.success({ title: "Trả lời bình luận thành công!" });
		},
		onError: (error: any) => {
			toast.error({
				title: error.message || "Có lỗi xảy ra khi trả lời bình luận",
			});
		},
	});
};

export const useLikeForumComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => commentApi.likeComment(id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["forum-comments"] }),
	});
};

export const useForumHashtags = () => {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ["forum-hashtags"],
		queryFn: async () => {
			const response = await hashtagApi.getAllTags();
			if (response.data) dispatch(setHashtagsAction(response.data));
			return response;
		},
	});
};
