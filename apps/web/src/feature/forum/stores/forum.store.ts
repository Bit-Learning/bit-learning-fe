import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";
import type { Post, Comment, Hashtag } from "../types/forum.type";

export type TForumState = {
  posts: Post[];
  selectedPost: Post | null;
  comments: Comment[];
  hashtags: Hashtag[];
  selectedTags: string[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
};

const forumInitialState: TForumState = {
  posts: [],
  selectedPost: null,
  comments: [],
  hashtags: [],
  selectedTags: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  },
};

const setLoading = (state: TForumState, action: PayloadAction<boolean>) => {
  state.isLoading = action.payload;
};

const setError = (state: TForumState, action: PayloadAction<string | null>) => {
  state.error = action.payload;
};

const setPosts = (state: TForumState, action: PayloadAction<Post[]>) => {
  state.posts = action.payload;
};

const setSelectedPost = (state: TForumState, action: PayloadAction<Post | null>) => {
  state.selectedPost = action.payload;
};

const updatePost = (state: TForumState, action: PayloadAction<Post>) => {
  const index = state.posts.findIndex((p) => p.id === action.payload.id);
  if (index !== -1) {
    state.posts[index] = action.payload;
  }
  if (state.selectedPost?.id === action.payload.id) {
    state.selectedPost = action.payload;
  }
};

const removePost = (state: TForumState, action: PayloadAction<number>) => {
  state.posts = state.posts.filter((p) => p.id !== action.payload);
  if (state.selectedPost?.id === action.payload) {
    state.selectedPost = null;
  }
};

const setComments = (state: TForumState, action: PayloadAction<Comment[]>) => {
  state.comments = action.payload;
};

const addComment = (state: TForumState, action: PayloadAction<Comment>) => {
  state.comments.unshift(action.payload);
};

const updateComment = (state: TForumState, action: PayloadAction<Comment>) => {
  const index = state.comments.findIndex((c) => c.id === action.payload.id);
  if (index !== -1) {
    state.comments[index] = action.payload;
  }
};

const removeComment = (state: TForumState, action: PayloadAction<number>) => {
  state.comments = state.comments.filter((c) => c.id !== action.payload);
};

const setHashtags = (state: TForumState, action: PayloadAction<Hashtag[]>) => {
  state.hashtags = action.payload;
};

const toggleTag = (state: TForumState, action: PayloadAction<string>) => {
  const index = state.selectedTags.indexOf(action.payload);
  if (index > -1) {
    state.selectedTags.splice(index, 1);
  } else {
    state.selectedTags.push(action.payload);
  }
};

const clearSelectedTags = (state: TForumState) => {
  state.selectedTags = [];
};

const setPage = (state: TForumState, action: PayloadAction<number>) => {
  state.pagination.page = action.payload;
};

const setPageSize = (state: TForumState, action: PayloadAction<number>) => {
  state.pagination.size = action.payload;
  state.pagination.page = 0;
};

const setPagination = (
  state: TForumState,
  action: PayloadAction<{
    totalPages: number;
    page: number;
    totalElements: number;
  }>,
) => {
  state.pagination.totalPages = action.payload.totalPages;
  state.pagination.page = action.payload.page;
  state.pagination.totalElements = action.payload.totalElements;
};

const resetForumState = () => {
  return forumInitialState;
};

export const forum = createSlice({
  name: "forum",
  initialState: forumInitialState,
  reducers: {
    setLoadingAction: setLoading,
    setErrorAction: setError,
    setPostsAction: setPosts,
    setSelectedPostAction: setSelectedPost,
    updatePostAction: updatePost,
    removePostAction: removePost,
    setCommentsAction: setComments,
    addCommentAction: addComment,
    updateCommentAction: updateComment,
    removeCommentAction: removeComment,
    setHashtagsAction: setHashtags,
    toggleTagAction: toggleTag,
    clearSelectedTagsAction: clearSelectedTags,
    setPageAction: setPage,
    setPageSizeAction: setPageSize,
    setPaginationAction: setPagination,
    resetForumStateAction: resetForumState,
  },
});

export const {
  setLoadingAction,
  setErrorAction,
  setPostsAction,
  setSelectedPostAction,
  updatePostAction,
  removePostAction,
  setCommentsAction,
  addCommentAction,
  updateCommentAction,
  removeCommentAction,
  setHashtagsAction,
  toggleTagAction,
  clearSelectedTagsAction,
  setPageAction,
  setPageSizeAction,
  setPaginationAction,
  resetForumStateAction,
} = forum.actions;

export const selectForumState = (state: RootState) => state.forum;
export const selectForumPosts = (state: RootState) => state.forum.posts;
export const selectForumSelectedPost = (state: RootState) => state.forum.selectedPost;
export const selectForumComments = (state: RootState) => state.forum.comments;
export const selectForumHashtags = (state: RootState) => state.forum.hashtags;
export const selectForumSelectedTags = (state: RootState) => state.forum.selectedTags;
export const selectForumLoading = (state: RootState) => state.forum.isLoading;
export const selectForumError = (state: RootState) => state.forum.error;
export const selectForumPagination = (state: RootState) => state.forum.pagination;

export default forum.reducer;
