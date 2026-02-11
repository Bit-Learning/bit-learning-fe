import React, { useState } from "react";
import { Heart, MessageCircle, MoreVertical } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import type { Comment } from "../types/forum.type";
import { useLikeForumComment, useReplyForumComment } from "../queries/useForum";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: number) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const likeComment = useLikeForumComment();
  const replyMutation = useReplyForumComment();

  const handleLike = async () => {
    await likeComment.mutateAsync(comment.id);
    setIsLiked(!isLiked);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    await replyMutation.mutateAsync({ id: comment.id, content: replyContent });
    setReplyContent("");
    setShowReplyBox(false);
  };

  return (
    <div className="py-3">
      <div className="flex items-start space-x-3">
        <img
          src={comment.author.avatar || "/default-avatar.png"}
          alt={comment.author.name}
          className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
        />

        <div className="flex-1 min-w-0">
          <Card className="bg-gray-50 border-0">
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-semibold text-sm text-gray-900">{comment.author.name}</h5>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical size={14} />
                </Button>
              </div>
              <p className="text-sm text-gray-700 wrap-break-word">{comment.content}</p>
            </div>
          </Card>

          <div className="flex items-center space-x-4 mt-2 px-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-7 text-xs ${isLiked ? "text-red-600" : "text-gray-500"}`}
            >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} className="mr-1" />
              Thích {comment.likes > 0 && `(${comment.likes})`}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="h-7 text-xs text-gray-500"
            >
              <MessageCircle size={14} className="mr-1" />
              Trả lời
            </Button>

            <span className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
            </span>

            {comment.isEdited && <span className="text-gray-400 text-xs">• Đã chỉnh sửa</span>}
          </div>

          {showReplyBox && (
            <div className="mt-3 flex items-start space-x-2">
              <img
                src="/default-avatar.png"
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div className="flex-1 space-y-2">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết câu trả lời..."
                  className="rounded-full"
                  onKeyPress={(e) => e.key === "Enter" && handleReply()}
                />
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={handleReply} isDisabled={!replyContent.trim()}>
                    Gửi
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowReplyBox(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
