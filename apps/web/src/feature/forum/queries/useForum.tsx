import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { postApi } from "../apis/post.api";
import { commentApi } from "../apis/comment.api";
import { hashtagApi } from "../apis/hashtag.api";
import {
  setPostsAction,
  setCommentsAction,
  setHashtagsAction,
  setPaginationAction,
  setLoadingAction,
  setErrorAction,
} from "../stores/forum.store";
import type {
  PaginationParams,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  FilterByAuthorParams,
} from "../types/forum.type";
import { toast } from "@workspace/ui/components/Sonner";

export const useForumPosts = (params: PaginationParams = {}) => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["forum-posts", params],
    queryFn: async () => {
      dispatch(setLoadingAction(true));
      try {
        const response = await postApi.getAllPosts(params);
        if (response.data) {
          dispatch(setPostsAction(response.data));
        }
        if (response.page) {
          dispatch(
            setPaginationAction({
              totalPages: response.page.totalPages,
              page: response.page.page,
              totalElements: response.page.totalElements,
            }),
          );
        }
        return response;
      } catch (error: any) {
        dispatch(setErrorAction(error.message));
        throw error;
      } finally {
        dispatch(setLoadingAction(false));
      }
    },
  });
};

export const useForumPostsByAuthor = (params: FilterByAuthorParams) => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["forum-posts-by-author", params],
    queryFn: async () => {
      dispatch(setLoadingAction(true));
      try {
        const response = await postApi.getPostsByAuthor(params);
        if (response.data) {
          dispatch(setPostsAction(response.data));
        }
        if (response.page) {
          dispatch(
            setPaginationAction({
              totalPages: response.page.totalPages,
              page: response.page.page,
              totalElements: response.page.totalElements,
            }),
          );
        }
        return response;
      } catch (error: any) {
        dispatch(setErrorAction(error.message));
        throw error;
      } finally {
        dispatch(setLoadingAction(false));
      }
    },
    enabled: !!params.authorId,
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, attachments }: { data: CreatePostRequest; attachments?: File[] }) =>
      postApi.createPost(data, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
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
    mutationFn: ({ id, data, attachments }: { id: number; data: UpdatePostRequest; attachments?: File[] }) =>
      postApi.updatePost(id, data, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      toast.success({ title: "Cập nhật bài viết thành công!" });
    },
    onError: (error: any) => {
      toast.error({ title: error.message || "Có lỗi xảy ra khi cập nhật bài viết" });
    },
  });
};

export const useDeleteForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      toast.success({ title: "Xóa bài viết thành công!" });
    },
    onError: (error: any) => {
      toast.error({ title: error.message || "Có lỗi xảy ra khi xóa bài viết" });
    },
  });
};

export const useLikeForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });
};

export const useDislikeForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.dislikePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });
};

export const useUnlikeOrUndislikeForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.unlikeOrUndislikePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });
};

export const useForumComments = (postId: number, params: PaginationParams = {}) => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["forum-comments", postId, params],
    queryFn: async () => {
      const response = await commentApi.getAllComments(postId, params);
      if (response.data) {
        dispatch(setCommentsAction(response.data));
      }
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
      toast.success({ title: "Bình luận thành công!" });
    },
    onError: (error: any) => {
      toast.error({ title: error.message || "Có lỗi xảy ra khi bình luận" });
    },
  });
};

export const useReplyForumComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => commentApi.replyComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
      toast.success({ title: "Trả lời bình luận thành công!" });
    },
  });
};

export const useLikeForumComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => commentApi.likeComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
    },
  });
};

export const useForumHashtags = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["forum-hashtags"],
    queryFn: async () => {
      const response = await hashtagApi.getAllTags();
      if (response.data) {
        dispatch(setHashtagsAction(response.data));
      }
      return response;
    },
  });
};
