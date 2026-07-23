import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";
import type { Post, Comment, Hashtag } from "../types/forum.type";

export type TForumState = {
	posts: Post[];
	myPosts: Post[];
	selectedPost: Post | null;
	comments: Comment[];
	hashtags: Hashtag[];
};

const forumInitialState: TForumState = {
	posts: [],
	myPosts: [],
	selectedPost: null,
	comments: [],
	hashtags: [],
};

// ─── Reducers ─────────────────────────────────────────────────────────────────

const setPosts = (state: TForumState, action: PayloadAction<Post[]>) => {
	state.posts = action.payload;
};

const setMyPosts = (state: TForumState, action: PayloadAction<Post[]>) => {
	state.myPosts = action.payload;
};

const setSelectedPost = (
	state: TForumState,
	action: PayloadAction<Post | null>,
) => {
	state.selectedPost = action.payload;
};

const updatePost = (state: TForumState, action: PayloadAction<Post>) => {
	const idx = state.posts.findIndex((p) => p.id === action.payload.id);
	if (idx !== -1) state.posts[idx] = action.payload;
	const myIdx = state.myPosts.findIndex((p) => p.id === action.payload.id);
	if (myIdx !== -1) state.myPosts[myIdx] = action.payload;
	if (state.selectedPost?.id === action.payload.id)
		state.selectedPost = action.payload;
};

const removePost = (state: TForumState, action: PayloadAction<number>) => {
	state.posts = state.posts.filter((p) => p.id !== action.payload);
	state.myPosts = state.myPosts.filter((p) => p.id !== action.payload);
	if (state.selectedPost?.id === action.payload) state.selectedPost = null;
};

const setComments = (state: TForumState, action: PayloadAction<Comment[]>) => {
	state.comments = action.payload;
};

const addComment = (state: TForumState, action: PayloadAction<Comment>) => {
	state.comments.unshift(action.payload);
};

const updateComment = (state: TForumState, action: PayloadAction<Comment>) => {
	const idx = state.comments.findIndex((c) => c.id === action.payload.id);
	if (idx !== -1) state.comments[idx] = action.payload;
};

const removeComment = (state: TForumState, action: PayloadAction<number>) => {
	state.comments = state.comments.filter((c) => c.id !== action.payload);
};

const setHashtags = (state: TForumState, action: PayloadAction<Hashtag[]>) => {
	state.hashtags = action.payload;
};

const resetForumState = () => forumInitialState;

// ─── Slice ────────────────────────────────────────────────────────────────────

export const forum = createSlice({
	name: "forum",
	initialState: forumInitialState,
	reducers: {
		setPostsAction: setPosts,
		setMyPostsAction: setMyPosts,
		setSelectedPostAction: setSelectedPost,
		updatePostAction: updatePost,
		removePostAction: removePost,
		setCommentsAction: setComments,
		addCommentAction: addComment,
		updateCommentAction: updateComment,
		removeCommentAction: removeComment,
		setHashtagsAction: setHashtags,
		resetForumStateAction: resetForumState,
	},
});

export const {
	setPostsAction,
	setMyPostsAction,
	setSelectedPostAction,
	updatePostAction,
	removePostAction,
	setCommentsAction,
	addCommentAction,
	updateCommentAction,
	removeCommentAction,
	setHashtagsAction,
	resetForumStateAction,
} = forum.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectForumPosts = (state: RootState) => state.forum.posts;
export const selectForumMyPosts = (state: RootState) => state.forum.myPosts;
export const selectForumSelectedPost = (state: RootState) =>
	state.forum.selectedPost;
export const selectForumComments = (state: RootState) => state.forum.comments;
export const selectForumHashtags = (state: RootState) => state.forum.hashtags;

export default forum.reducer;
