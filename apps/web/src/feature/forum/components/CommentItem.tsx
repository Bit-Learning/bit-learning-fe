import React, { useState } from "react";
import { Heart, MessageCircle, MoreVertical, Edit, Trash2, Ban, AlertTriangle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import type { Comment } from "../types/forum.type";
import {
  useLikeForumComment,
  useReplyForumComment,
  useUpdateForumComment,
  useDeleteForumComment,
} from "../queries/useForum";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showEditBox, setShowEditBox] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);

  const { userInfo } = useSelector(selectAuthStateInfo);
  const isAuthor = userInfo?.id === comment.author.id;
  const canEdit = isAuthor && comment.isEditAllowed;
  const canDelete = isAuthor;

  const likeComment = useLikeForumComment();
  const replyMutation = useReplyForumComment();
  const updateComment = useUpdateForumComment();
  const deleteComment = useDeleteForumComment();

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

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setShowEditBox(false);
      return;
    }

    await updateComment.mutateAsync({
      id: comment.id,
      data: { content: editContent },
    });
    setShowEditBox(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      await deleteComment.mutateAsync(comment.id);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setShowEditBox(false);
  };

  const visibleReplies = comment.replies?.filter((reply) => !reply.isBanned || userInfo?.id === reply.author.id) || [];

  if (comment.isBanned) {
    return (
      <div className="py-2">
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <Ban size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-red-600" />
                  <h5 className="text-sm font-bold text-red-900">Bình luận đã bị ẩn</h5>
                </div>
                {isAuthor ? (
                  <div className="text-xs text-red-600 bg-red-100 border border-red-300 rounded p-2 mt-2">
                    <p>Bình luận của bạn đã bị ẩn. Liên hệ quản trị viên nếu cần hỗ trợ.</p>
                  </div>
                ) : (
                  <div className="text-xs text-red-600 bg-red-100 border border-red-300 rounded p-2 mt-2">
                    <p>Bình luận này đã bị ẩn do vi phạm quy tắc cộng đồng.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {visibleReplies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
            {visibleReplies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-start space-x-2">
        <div className="flex-1 min-w-0">
          <Card className="bg-gray-50 border-0 p-0">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <img
                    src={comment.author.avatar || "/default-avatar.png"}
                    alt={comment.author.firstName + " " + comment.author.lastName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
                  />
                  <div>
                    <h5 className="font-semibold text-sm text-gray-900">
                      {comment.author.firstName + " " + comment.author.lastName}
                    </h5>
                  </div>
                </div>

                {isAuthor && (
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowMenu(!showMenu)}>
                      <MoreVertical size={14} />
                    </Button>

                    {showMenu && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowEditBox(true);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Edit size={14} className="mr-2" />
                            Chỉnh sửa
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              handleDelete();
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Xóa
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {showEditBox ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleEdit} isDisabled={!editContent.trim()}>
                      Lưu
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  <p className="text-sm text-gray-700 wrap-break-word">{comment.content}</p>
                </div>
              )}
            </CardContent>
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
                src={userInfo?.avatar || "/default-avatar.png"}
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

          {visibleReplies.length > 0 && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
              {visibleReplies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
