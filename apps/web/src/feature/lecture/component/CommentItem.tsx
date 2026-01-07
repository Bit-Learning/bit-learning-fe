import { usePostComment, useReplies, useToggleVote } from "@/feature/course/queries/useInteraction";
import { CommentResponse } from "@/feature/course/types/interaction.type";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/Avatar";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronDown, ChevronUp, Clock, Heart, Loader2, MessageCircle, Pin, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface CommentItemProps {
  comment: CommentResponse;
  lectureId: number;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, lectureId, isReply = false }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { data: replies } = useReplies(comment.id, showReplies);
  const { mutate: postComment, isPending: isPosting } = usePostComment();
  const { mutate: toggleVote } = useToggleVote();

  const fullName = `${comment.user.firstName} ${comment.user.lastName}`.trim();

  const formatTimestamp = (seconds: number | null) => {
    if (seconds === null) return null;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;

    postComment(
      {
        content: replyContent,
        videoTimestampSecond: comment.videoTimestamp || 0,
        lectureId,
        parentId: comment.id,
      },
      {
        onSuccess: () => {
          setReplyContent("");
          setShowReplyForm(false);
          setShowReplies(true);
        },
      }
    );
  };

  const handleVote = () => {
    toggleVote(comment.id);
  };

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={comment.user.avatar} alt={fullName} />
          <AvatarFallback className="bg-blue-100 text-blue-700">
            {comment.user.firstName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{fullName}</span>
                  {comment.user.role && (
                    <Badge variant="outline" className="text-xs">
                      {comment.user.role}
                    </Badge>
                  )}
                  {comment.isPinned && (
                    <Badge variant="secondary" className="gap-1">
                      <Pin className="h-3 w-3" />
                      Ghim
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo}</span>
                  {comment.videoTimestamp !== null && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-blue-600">{formatTimestamp(comment.videoTimestamp)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-gray-700">{comment.content}</p>
          </div>

          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={handleVote}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                comment.isUpvotedByCurrentUser ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart className={`h-4 w-4 ${comment.isUpvotedByCurrentUser ? "fill-current" : ""}`} />
              <span className="font-medium">{comment.upVoteCount}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Trả lời</span>
              </button>
            )}

            {!isReply && comment.replyCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50"
              >
                {showReplies ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>
                  {showReplies ? "Ẩn" : "Xem"} {comment.replyCount} câu trả lời
                </span>
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-700">U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết câu trả lời..."
                  className="min-h-20 resize-none"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    isDisabled={!replyContent.trim() || isPosting}
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Đang gửi
                      </>
                    ) : (
                      <>
                        <Send className="mr-1 h-4 w-4" />
                        Gửi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showReplies && replies && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} lectureId={lectureId} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
