export interface AttachmentDetail {
  id: number;
  url: string;
  type: AttachmentType;
}

export interface HashtagDetail {
  id: number;
  name: string;
}

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  email?: string;
}

export interface PostPreview {
  id: number;
  code: string;
  title: string;
  content: string;
  isBanned: boolean;
  isEdited: boolean;
  likes: number;
  dislikes: number;
  author: Author;
  hashtags: HashtagDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail {
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
  attachments: AttachmentDetail[];
  hashtags: HashtagDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentDetail {
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
  replies: CommentDetail[];
  createdAt: string;
  updatedAt: string;
}

export enum AttachmentType {
  IMAGE = "IMAGE",
  FILE = "FILE",
}
