import React, { useState } from "react";
import { ArrowLeft, Image as ImageIcon, Paperclip, AtSign, ZoomIn, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Textarea } from "@workspace/ui/components/Textarea";
import { useSelector } from "react-redux";
import {
  useForumPostById,
  useForumComments,
  useCreateForumComment,
  useUpdateForumComment,
  useDeleteForumComment,
  useReplyForumComment,
  useLikeForumPost,
  useDislikeForumPost,
  useLikeForumComment,
} from "../queries/useForum";
import { selectForumSelectedPost, selectForumComments } from "../stores/forum.store";
import { PostCard } from "./PostCard";
import { CommentItem } from "./CommentItem";
import { AuthorAvatar } from "./AuthorAvatar";
import { useNavigate, useParams } from "@tanstack/react-router";

const PostDetailContent: React.FC = () => {
  const { id } = useParams({ from: "/_layout/forum/post/$id" });
  const postId = Number(id);
  const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);

  const selectedPost = useSelector(selectForumSelectedPost);
  const comments = useSelector(selectForumComments);

  useForumPostById(postId);
  useForumComments(postId);

  const createCommentMutation = useCreateForumComment();
  const updateCommentMutation = useUpdateForumComment();
  const deleteCommentMutation = useDeleteForumComment();
  const replyCommentMutation = useReplyForumComment();
  const likePostMutation = useLikeForumPost();
  const dislikePostMutation = useDislikeForumPost();
  const likeCommentMutation = useLikeForumComment();

  const handleSubmitComment = () => {
    if (!comment.trim()) return;

    if (replyingTo) {
      replyCommentMutation.mutate({ id: replyingTo, content: comment });
      setReplyingTo(null);
    } else {
      createCommentMutation.mutate({ postId, content: comment });
    }
    setComment("");
  };

  const currentUser = {
    id: 1,
    firstName: "Bạn",
    lastName: "",
  };

  if (!selectedPost) return <div className="pt-28 text-center">Đang tải...</div>;

  return (
    <main className="pt-8 pb-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate({ to: "/forum" })}>
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-900 font-semibold">{selectedPost.hashtags[0]?.name || "Diễn đàn"}</span>
          </div>
        </div>

        <PostCard
          post={selectedPost}
          onLike={(id) => likePostMutation.mutate(id)}
          onDislike={(id) => dislikePostMutation.mutate(id)}
          showFullContent
          showActions
        />

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <h5 className="text-gray-900 font-bold mb-6 text-lg">Viết bình luận</h5>
            <div className="flex gap-4">
              <AuthorAvatar author={currentUser} size="md" />
              <div className="flex-1 flex flex-col gap-4">
                <Textarea
                  className="min-h-35 bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-600/20 focus:border-blue-600"
                  placeholder="Chia sẻ ý kiến hoặc đặt câu hỏi của bạn..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-500" aria-label="Thêm ảnh">
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500" aria-label="Đính kèm tệp">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500" aria-label="Nhắc tên">
                      <AtSign className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                    onClick={handleSubmitComment}
                    isDisabled={!comment.trim()}
                  >
                    Đăng bình luận
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center justify-between px-2">
            <h5 className="text-gray-900 font-bold text-xl">Tất cả bình luận ({comments.length})</h5>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Sắp xếp theo:</span>
              <Button variant="ghost" className="font-bold text-gray-900 hover:text-blue-600 gap-1">
                Mới nhất
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {comments.map((comment) => (
            <Card key={comment.id} className="border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <CommentItem
                  comment={comment}
                  onReply={(id) => setReplyingTo(id)}
                  onEdit={(comment) => setEditingComment(comment.id)}
                  onDelete={(id) => deleteCommentMutation.mutate(id)}
                  onLike={(id) => likeCommentMutation.mutate(id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PostDetailContent;
