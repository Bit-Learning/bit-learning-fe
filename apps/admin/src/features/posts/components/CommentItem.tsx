import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Ban, Shield, User } from "lucide-react";
import { CommentDetail } from "../types/post.type";
import { useBanComment } from "../queries/usePost";

interface CommentItemProps {
  comment: CommentDetail;
  postId: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, postId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const { mutate: banComment, isPending } = useBanComment();

  const handleBanComment = () => {
    banComment({ id: comment.id, isBanned: comment.isBanned, postId });
  };

  return (
    <Card className={`${comment.isBanned ? "opacity-60 border-red-200" : ""}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                </span>
                {comment.isEdited && (
                  <Badge variant="secondary" className="text-xs">
                    Đã chỉnh sửa
                  </Badge>
                )}
                {comment.isBanned && (
                  <Badge variant="destructive" className="text-xs">
                    <Ban className="w-3 h-3 mr-1" />
                    Bị khóa
                  </Badge>
                )}
              </div>

              <Button
                variant={comment.isBanned ? "outline" : "ghost"}
                size="sm"
                onClick={handleBanComment}
                disabled={isPending}
              >
                {comment.isBanned ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Mở khóa
                  </>
                ) : (
                  <>
                    <Ban className="w-3 h-3 mr-1" />
                    Khóa
                  </>
                )}
              </Button>
            </div>

            <p className="text-sm text-foreground mb-3">{comment.content}</p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsUp className="w-3 h-3" />
                <span>{comment.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsDown className="w-3 h-3" />
                <span>{comment.dislikes}</span>
              </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? "Ẩn" : "Xem"} {comment.replies.length} phản hồi
                </Button>

                {showReplies && (
                  <div className="mt-3 space-y-3 ml-4 border-l-2 border-slate-200 pl-4">
                    {comment.replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} postId={postId} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
