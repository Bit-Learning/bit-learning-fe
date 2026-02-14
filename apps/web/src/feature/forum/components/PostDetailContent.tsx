import React, { useState } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import {
  useLikeForumPost,
  useDislikeForumPost,
  useUnlikeOrUndislikeForumPost,
  useForumComments,
  useCreateForumComment,
  useDeleteForumPost,
} from "../queries/useForum";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { CommentItem } from "./CommentItem";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import EditPostModal from "./EditPostModal";

const PostDetailContent: React.FC = () => {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { userInfo } = useSelector(selectAuthStateInfo);

  const post = {
    id: Number(id),
    code: "POST001",
    title: "Làm thế nào để tối ưu performance React App?",
    content: `Mình đang làm một dự án React khá lớn và gặp vấn đề về performance.

Cụ thể là khi scroll list có nhiều item thì bị lag. Mình đã thử dùng React.memo nhưng không thấy cải thiện nhiều.

Các bạn có kinh nghiệm gì về việc tối ưu performance cho React không? Chia sẻ với mình nhé!

Một số thông tin về dự án:
- Sử dụng React 18
- State management: Redux Toolkit
- UI Library: Material-UI
- List có khoảng 1000+ items

Cảm ơn các bạn!`,
    author: {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "/avatar1.jpg",
      email: "nguyenvana@example.com",
    },
    hashtags: [
      { id: 1, name: "ReactJS" },
      { id: 2, name: "Performance" },
      { id: 3, name: "Optimization" },
    ],
    attachments: [],
    likes: 45,
    dislikes: 3,
    views: 234,
    isBanned: false,
    isEdited: false,
    isEditAllowed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const isAuthor = userInfo?.id === post.author.id;
  const canEdit = isAuthor && post.isEditAllowed;
  const canDelete = isAuthor;

  const { data: commentsData } = useForumComments(Number(id));
  const comments = commentsData?.data || [];

  const likePost = useLikeForumPost();
  const dislikePost = useDislikeForumPost();
  const unlikePost = useUnlikeOrUndislikeForumPost();
  const createComment = useCreateForumComment();
  const deletePost = useDeleteForumPost();

  const handleLike = async () => {
    if (isLiked) {
      await unlikePost.mutateAsync(post.id);
      setIsLiked(false);
    } else {
      await likePost.mutateAsync(post.id);
      setIsLiked(true);
      setIsDisliked(false);
    }
  };

  const handleDislike = async () => {
    if (isDisliked) {
      await unlikePost.mutateAsync(post.id);
      setIsDisliked(false);
    } else {
      await dislikePost.mutateAsync(post.id);
      setIsDisliked(true);
      setIsLiked(false);
    }
  };

  const handleComment = async () => {
    if (!commentContent.trim()) return;

    await createComment.mutateAsync({
      postId: post.id,
      content: commentContent,
    });
    setCommentContent("");
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
      await deletePost.mutateAsync(post.id);
      navigate({ to: "/forum" });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100),
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Đã sao chép link vào clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/forum" })}>
              <ArrowLeft size={20} className="mr-2" />
              Quay lại
            </Button>

            <div className="flex-1" />

            {isAuthor && (
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)}>
                  <MoreVertical size={20} />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setIsEditModalOpen(true);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Edit size={16} className="mr-2" />
                        Chỉnh sửa bài viết
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDelete();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Xóa bài viết
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {post.views} lượt xem
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.hashtags.map((tag) => (
                <Link key={tag.id} to="/forum" search={{ tag: tag.name }}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 transition-colors">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-6 border-b">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {post.attachments.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {post.attachments.map((attachment: any) => (
                  <div key={attachment.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img src={attachment.url} alt="attachment" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Heart size={16} className="text-red-500" />
                  {post.likes} lượt thích
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown size={16} className="text-gray-400" />
                  {post.dislikes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} className="text-blue-500" />
                  {comments.length} bình luận
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <Bookmark size={18} />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button variant={isLiked ? "default" : "outline"} onClick={handleLike}>
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                <span className="ml-2 hidden sm:inline">Thích</span>
              </Button>

              <Button variant={isDisliked ? "secondary" : "outline"} onClick={handleDislike}>
                <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
                <span className="ml-2 hidden sm:inline">Không thích</span>
              </Button>

              <Button variant="outline" onClick={() => document.getElementById("comment-input")?.focus()}>
                <MessageCircle size={18} />
                <span className="ml-2 hidden sm:inline">Bình luận</span>
              </Button>

              <Button variant="outline" onClick={handleShare}>
                <Share2 size={18} />
                <span className="ml-2 hidden sm:inline">Chia sẻ</span>
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle size={22} className="mr-2 text-blue-600" />
              Bình luận ({comments.length})
            </h3>
          </div>

          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-start gap-3">
              <img
                src={userInfo?.avatar || "/default-avatar.png"}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div className="flex-1 space-y-3">
                <textarea
                  id="comment-input"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <Button onClick={handleComment} isDisabled={!commentContent.trim() || createComment.isPending}>
                    {createComment.isPending ? "Đang gửi..." : "Gửi bình luận"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {comments.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Chưa có bình luận nào</p>
                <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={post} />
    </div>
  );
};

export default PostDetailContent;
