import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { postApi } from "../apis/post.api";
import { commentApi } from "../apis/comment.api";
import { hashtagApi } from "../apis/hashtag.api";
import {
  setPostsAction,
  setMyPostsAction,
  setSelectedPostAction,
  setCommentsAction,
  setHashtagsAction,
} from "../stores/forum.store";
import type {
  PaginationParams,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  FilterByAuthorParams,
} from "../types/forum.type";
import { toast } from "@/shared/components/Sonner";

export const useForumPosts = (params: PaginationParams = {}) => {
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

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, attachments }: { data: CreatePostRequest; attachments?: File[] }) =>
      postApi.createPost(data, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts-by-author"] });
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
      queryClient.invalidateQueries({ queryKey: ["forum-posts-by-author"] });
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
      queryClient.invalidateQueries({ queryKey: ["forum-posts-by-author"] });
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-posts"] }),
  });
};

export const useDislikeForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.dislikePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-posts"] }),
  });
};

export const useUnlikeOrUndislikeForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.unlikeOrUndislikePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-posts"] }),
  });
};

export const useForumComments = (postId: number, params: PaginationParams = {}) => {
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
    mutationFn: ({ id, data }: { id: number; data: UpdateCommentRequest }) => commentApi.updateComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
      toast.success({ title: "Cập nhật bình luận thành công!" });
    },
    onError: (error: any) => {
      toast.error({ title: error.message || "Có lỗi xảy ra khi cập nhật bình luận" });
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
      toast.error({ title: error.message || "Có lỗi xảy ra khi xóa bình luận" });
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
    onError: (error: any) => {
      toast.error({ title: error.message || "Có lỗi xảy ra khi trả lời bình luận" });
    },
  });
};

export const useLikeForumComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => commentApi.likeComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-comments"] }),
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
