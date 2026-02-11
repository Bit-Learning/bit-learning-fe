export enum AttachmentType {
  IMAGE = "IMAGE",
  FILE = "FILE",
}

export interface Author {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Hashtag {
  id: number;
  name: string;
}

export interface Attachment {
  id: number;
  url: string;
  type: AttachmentType;
}

export interface Post {
  id: number;
  code: string;
  title: string;
  content: string;
  isBanned: boolean;
  isEdited: boolean;
  isEditAllowed: boolean;
  likes: number;
  dislikes: number;
  author: Author;
  attachments: Attachment[];
  hashtags: Hashtag[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  isBanned: boolean;
  isEdited: boolean;
  isEditAllowed: boolean;
  likes: number;
  dislikes: number;
  author: Author;
  postId: number;
  parentId?: number;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  tags?: string[];
  deletedAttachmentIds?: number[];
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface FilterByTagsParams extends PaginationParams {
  tagNames: string[];
  mode: "min" | "max";
}

export interface FilterByAuthorParams extends PaginationParams {
  authorId: number;
}
