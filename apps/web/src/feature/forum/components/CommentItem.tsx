import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Reply, Edit, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import type { Comment } from "../types/forum.type";
import { AuthorAvatar } from "./AuthorAvatar";

interface CommentItemProps {
  comment: Comment;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  onReply: (commentId: number) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
  onLike: (commentId: number) => void;
  onSubmitReply: (content: string, commentId: number) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  replyingTo,
  setReplyingTo,
  onSubmitReply,
}) => {
  const [replyContent, setReplyContent] = useState("");

  const isReplying = replyingTo === comment.id;
  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  return (
    <div className="flex items-start gap-4">
      <AuthorAvatar author={comment.author} size="md" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && <span className="text-xs text-gray-400 italic">(đã chỉnh sửa)</span>}
          </div>
          {comment.isEditAllowed && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-600 h-8 w-8"
                onClick={() => onEdit(comment)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500 h-8 w-8"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-gray-700 text-base leading-relaxed mb-6">{comment.content}</p>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-blue-600 h-auto p-0"
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp className="w-5 h-5" />
            </Button>
            <span className="text-sm font-bold text-gray-900">{comment.likes}</span>
            <Button variant="ghost" size="icon" className="text-gray-500 h-auto p-0">
              <ThumbsDown className="w-5 h-5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            className="text-blue-600 gap-1.5 h-auto p-0 hover:underline font-semibold"
            onClick={() => setReplyingTo(isReplying ? null : comment.id)}
          >
            <Reply className="w-4 h-4" />
            Trả lời
          </Button>
        </div>

        {isReplying && (
          <div className="mt-4 ml-1">
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Nhập phản hồi..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                Huỷ
              </Button>

              <Button
                isDisabled={!replyContent.trim()}
                onClick={() => {
                  onSubmitReply(replyContent, comment.id);
                  setReplyContent("");
                  setReplyingTo(null);
                }}
              >
                Gửi
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-8 pl-8 border-l-2 border-gray-100 space-y-6">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                onSubmitReply={onSubmitReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
