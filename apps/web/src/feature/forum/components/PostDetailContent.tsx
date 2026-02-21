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
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import {
  useForumPostById,
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

  const { data: postData, isLoading: postLoading } = useForumPostById(Number(id));
  const post = postData?.data;

  const isAuthor = userInfo?.id === post?.author.id;
  const canEdit = isAuthor && post?.isEditAllowed;
  const canDelete = isAuthor;

  const { data: commentsData } = useForumComments(Number(id));
  const comments = commentsData?.data || [];

  // Filter out banned comments for non-authors
  const visibleComments = comments.filter((comment) => !comment.isBanned || userInfo?.id === comment.author.id);

  const likePost = useLikeForumPost();
  const dislikePost = useDislikeForumPost();
  const unlikePost = useUnlikeOrUndislikeForumPost();
  const createComment = useCreateForumComment();
  const deletePost = useDeleteForumPost();

  const handleLike = async () => {
    if (!post) return;
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
    if (!post) return;
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
    if (!commentContent.trim() || !post) return;

    await createComment.mutateAsync({
      postId: post.id,
      content: commentContent,
    });
    setCommentContent("");
  };

  const handleDelete = async () => {
    if (!post) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
      await deletePost.mutateAsync(post.id);
      navigate({ to: "/forum" });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.content.substring(0, 100),
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Đã sao chép link vào clipboard!");
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex items-center justify-center">
        <Card className="p-12 text-center">
          <CardContent>
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-600 mb-6">Bài viết này có thể đã bị xóa hoặc không tồn tại</p>
            <Button onClick={() => navigate({ to: "/forum" })}>
              <ArrowLeft size={18} className="mr-2" />
              Quay lại diễn đàn
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (post.isBanned && !isAuthor) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        <div className="bg-white border-b sticky top-0 z-40 shadow-sm backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/forum" })}>
              <ArrowLeft size={20} className="mr-2" />
              Quay lại
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <Ban size={64} className="text-red-600 mb-4" />
                <h2 className="text-2xl font-bold text-red-900 mb-3">Bài viết đã bị ẩn</h2>
                <p className="text-red-700 mb-6 max-w-md">
                  Bài viết này đã bị ẩn do vi phạm quy tắc cộng đồng và không còn khả dụng.
                </p>
                <Button onClick={() => navigate({ to: "/forum" })}>
                  <ArrowLeft size={18} className="mr-2" />
                  Quay lại diễn đàn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {post.isBanned && isAuthor && (
          <Card className="mb-6 border-2 border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <Ban size={32} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center">
                    <AlertTriangle size={20} className="mr-2" />
                    Bài viết của bạn đã bị ẩn
                  </h3>
                  <p className="text-sm text-red-800 mb-3">
                    Bài viết này đã bị ẩn do vi phạm quy tắc cộng đồng. Chỉ bạn mới có thể xem nội dung này.
                  </p>
                  <p className="text-xs text-red-700 bg-red-100 border border-red-300 rounded p-3">
                    Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn hoặc cần thêm thông tin.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar || "/default-avatar.png"}
                  alt={post.author.firstName + " " + post.author.lastName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{post.author.firstName + " " + post.author.lastName}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <Link key={tag.id} to="/forum" search={{ tag: tag.name }}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 transition-colors">
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="border-b">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {post.attachments.map((attachment) => (
                  <div key={attachment.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {attachment.type === "IMAGE" ? (
                      <img src={attachment.url} alt="attachment" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">📄 File đính kèm</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <div className="w-full flex items-center justify-between pb-4 border-b">
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
                  {visibleComments.length} bình luận
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <Bookmark size={18} />
              </Button>
            </div>

            <div className="w-full grid grid-cols-4 gap-2">
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
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle size={22} className="mr-2 text-blue-600" />
              Bình luận ({visibleComments.length})
            </h3>
          </CardHeader>

          <CardContent className="border-b bg-gray-50">
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
          </CardContent>

          <CardContent>
            {visibleComments.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Chưa có bình luận nào</p>
                <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {post && <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={post} />}
    </div>
  );
};

export default PostDetailContent;
