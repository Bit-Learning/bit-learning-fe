import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { Comment, CreateCommentRequest, UpdateCommentRequest, PaginationParams } from "../types/forum.type";

export const commentApi = {
  getAllComments: async (postId: number, params: PaginationParams = {}) => {
    const { page = 0, size = 10 } = params;
    const response = await api.get<ApiResponse<Comment[]>>("/comments", {
      params: { postId, page, size },
    });
    return response.data;
  },

  createComment: async (data: CreateCommentRequest) => {
    const response = await api.post<ApiResponse<void>>("/comments", data);
    return response.data;
  },

  updateComment: async (id: number, data: UpdateCommentRequest) => {
    const response = await api.patch<ApiResponse<void>>(`/comments/${id}`, data);
    return response.data;
  },

  deleteComment: async (id: number) => {
    const response = await api.delete<ApiResponse<void>>(`/comments/${id}`);
    return response.data;
  },

  replyComment: async (id: number, content: string) => {
    const response = await api.post<ApiResponse<void>>(`/comments/${id}/reply`, {
      content,
    });
    return response.data;
  },

  likeComment: async (id: number) => {
    const response = await api.post<ApiResponse<void>>(`/comments/${id}/like`);
    return response.data;
  },

  dislikeComment: async (id: number) => {
    const response = await api.post<ApiResponse<void>>(`/comments/${id}/dislike`);
    return response.data;
  },

  unlikeOrUndislikeComment: async (id: number) => {
    const response = await api.post<ApiResponse<void>>(`/comments/${id}/unlike_or_undislike`);
    return response.data;
  },
};
