import React from "react";
import { AlertCircle, CheckCircle, Edit, Eye, Lock, Trash2, ThumbsUp, FileIcon } from "lucide-react";
import { type Post, AttachmentType } from "../types/forum.type";

interface PostRowProps {
  post: Post;
  formatDate: (d: string) => string;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const PostRow: React.FC<PostRowProps> = ({ post, formatDate, canEdit, onEdit, onDelete, onView }) => {
  const imageAttachment = post.attachments.find((a) => a.type === AttachmentType.IMAGE);

  return (
    <div
      className={`bg-white rounded-md border transition-all group overflow-hidden ${
        post.isBanned ? "border-red-100 bg-red-50/20" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex">
        <div className="w-64 shrink-0 hidden sm:block">
          {imageAttachment ? (
            <img src={imageAttachment.url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full min-h-24 bg-gray-50 flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {post.isBanned ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" /> Bị khóa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5" /> Đã đăng
                  </span>
                )}
                {post.hashtags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[10px] text-primary bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              {!post.isBanned && (
                <div className="flex items-center gap-2 shrink-0 transition-opacity">
                  <button
                    className="cursor-pointer p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                    onClick={onView}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {canEdit && (
                    <button
                      className="cursor-pointer p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                      onClick={onEdit}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <h3
              className={`font-semibold text-sm leading-snug mb-1 line-clamp-1 transition-colors ${
                post.isBanned ? "text-gray-400 line-through" : "text-gray-800 group-hover:text-primary cursor-pointer"
              }`}
              onClick={!post.isBanned ? onView : undefined}
            >
              {post.title}
            </h3>
            <p className={`text-xs line-clamp-1 ${post.isBanned ? "text-gray-400" : "text-gray-500"}`}>
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {!post.isBanned && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {post.likes}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.likes + post.dislikes}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {post.isBanned ? `Khóa ${formatDate(post.updatedAt)}` : formatDate(post.createdAt)}
            </span>
          </div>

          {post.isBanned && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Vi phạm tiêu chuẩn cộng đồng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
