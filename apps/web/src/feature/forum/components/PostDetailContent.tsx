import React, { useState } from "react";
import {
  ArrowLeft,
  ImageIcon,
  Paperclip,
  AtSign,
  ChevronDown,
  Download,
  X,
  ZoomIn,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { Textarea } from "@workspace/ui/components/Textarea";
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
import { CommentItem } from "./CommentItem";
import { AuthorAvatar } from "./AuthorAvatar";
import { useNavigate, useParams } from "@tanstack/react-router";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatRelative(date: string): string {
  const diffH = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (diffH < 1) return "Vừa xong";
  if (diffH < 24) return `${diffH} giờ trước`;
  const days = Math.floor(diffH / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(date);
}

const PostDetailContent: React.FC = () => {
  const { id } = useParams({ from: "/_layout/forum/post/$id" });
  const postId = Number(id);
  const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { data: postResponse, isLoading: isPostLoading } = useForumPostById(postId);
  const { data: commentsResponse, isLoading: isCommentsLoading } = useForumComments(postId);

  const selectedPost = postResponse?.data ?? null;
  const comments = commentsResponse?.data ?? [];

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

  const currentUser = { id: 1, firstName: "Bạn", lastName: "" };

  const BackBar = (
    <div className="border-b border-gray-400 sticky top-0 z-30 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center">
        <button
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          onClick={() => navigate({ to: "/forum" })}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại diễn đàn
        </button>
      </div>
    </div>
  );

  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-white">
        {BackBar}
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-gray-100 rounded-full" />
              <div className="h-3 w-44 bg-gray-100 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-7 w-3/4 bg-gray-100 rounded-lg" />
            <div className="h-7 w-1/2 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-72 w-full bg-gray-100 rounded-md" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPost) return null;

  const imageAttachments = selectedPost.attachments.filter((a) => a.type === "IMAGE");
  const fileAttachments = selectedPost.attachments.filter((a) => a.type !== "IMAGE");

  return (
    <div className="min-h-screen bg-white">
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setLightboxImg(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImg}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {BackBar}

      <div className="max-w-7xl mx-auto px-6">
        <div className="pt-8 pb-5 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <AuthorAvatar author={selectedPost.author} size="lg" />
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">
                {selectedPost.author.firstName} {selectedPost.author.lastName}
              </p>
              {selectedPost.author.email && <p className="text-xs text-gray-500 mt-0.5">{selectedPost.author.email}</p>}
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{formatDate(selectedPost.createdAt)}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{formatRelative(selectedPost.createdAt)}</span>
                {selectedPost.isEdited && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400 italic">đã chỉnh sửa</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
          {selectedPost.title}
        </h1>

        {imageAttachments.length > 0 && (
          <div className="mb-6 rounded-md overflow-hidden">
            {imageAttachments.length === 1 ? (
              <div className="cursor-zoom-in relative group" onClick={() => setLightboxImg(imageAttachments[0]?.url!)}>
                <img src={imageAttachments[0]?.url} alt="" className="w-full max-h-140 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-9 h-9 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            ) : imageAttachments.length === 2 ? (
              <div className="grid grid-cols-2 gap-0.5">
                {imageAttachments.map((img) => (
                  <div key={img.id} className="relative cursor-zoom-in group" onClick={() => setLightboxImg(img.url)}>
                    <img src={img.url} alt="" className="w-full h-72 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {imageAttachments.slice(0, 6).map((img, i) => (
                  <div key={img.id} className="relative cursor-zoom-in group" onClick={() => setLightboxImg(img.url)}>
                    <img src={img.url} alt="" className="w-full h-52 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                    {i === 5 && imageAttachments.length > 6 && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">+{imageAttachments.length - 6}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <p className="text-[15px] text-gray-800 leading-[1.8] whitespace-pre-wrap">{selectedPost.content}</p>
        </div>
        {selectedPost.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedPost.hashtags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {fileAttachments.length > 0 && (
          <div className="mb-8 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Tài liệu đính kèm</p>
            {fileAttachments.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-400 rounded-md hover:border-blue-300 hover:bg-blue-50/50 transition-all group shadow-sm"
              >
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate transition-colors">
                    Tài liệu
                  </p>
                  <p className="text-xs text-gray-400">{file.type}</p>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        )}

        {(selectedPost.likes > 0 || selectedPost.dislikes > 0) && (
          <div className="flex items-center justify-between text-md text-gray-600 pb-2 mb-1">
            <span>{selectedPost.likes > 0 ? `👍 ${selectedPost.likes} lượt thích` : ""}</span>
            <span>{selectedPost.dislikes > 0 ? `${selectedPost.dislikes} không thích` : ""}</span>
          </div>
        )}

        <div className="flex items-center border-t border-b border-gray-100 mb-10">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              selectedPost.likes > 0 ? "text-blue-600 hover:bg-blue-50" : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => likePostMutation.mutate(selectedPost.id)}
          >
            <ThumbsUp className={`w-4 h-4 ${selectedPost.likes > 0 ? "fill-blue-600" : ""}`} />
            Thích
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => dislikePostMutation.mutate(selectedPost.id)}
          >
            <ThumbsDown className="w-4 h-4" />
            Không thích
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => document.getElementById("comment-box")?.scrollIntoView({ behavior: "smooth" })}
          >
            <MessageCircle className="w-4 h-4" />
            Bình luận
            {comments.length > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">
                {comments.length}
              </span>
            )}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </button>
        </div>

        <div id="comment-box" className="mb-8">
          <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            {replyingTo ? (
              <>
                Đang trả lời bình luận
                <button
                  className="text-xs text-gray-400 hover:text-red-500 font-normal flex items-center gap-1 transition-colors"
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="w-3 h-3" /> Hủy
                </button>
              </>
            ) : (
              "Viết bình luận"
            )}
          </h5>
          <div className="flex gap-3">
            <AuthorAvatar author={currentUser} size="md" />
            <div className="flex-1 space-y-3">
              <Textarea
                className="min-h-24 bg-white border border-gray-400 rounded-md focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none text-sm transition-all shadow-sm"
                placeholder="Chia sẻ ý kiến hoặc đặt câu hỏi..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[
                    { icon: <ImageIcon className="w-4 h-4" />, label: "Thêm ảnh" },
                    { icon: <Paperclip className="w-4 h-4" />, label: "Đính kèm" },
                    { icon: <AtSign className="w-4 h-4" />, label: "Nhắc tên" },
                  ].map(({ icon, label }) => (
                    <button
                      key={label}
                      aria-label={label}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <button
                  className={`px-5 py-3 rounded-md text-sm font-bold transition-all ${
                    comment.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleSubmitComment}
                  disabled={!comment.trim()}
                >
                  Đăng bình luận
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h5 className="text-sm font-bold text-gray-900">
            Tất cả bình luận
            <span className="ml-1.5 text-gray-400 font-normal">({comments.length})</span>
          </h5>
          <button className="text-sm font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
            Mới nhất <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {isCommentsLoading ? (
          <div className="animate-pulse space-y-6 border-t border-gray-100 pt-5 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-24 bg-gray-100 rounded-full" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-14 text-gray-400 border-t border-gray-100 mb-10">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">Chưa có bình luận. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border-t border-gray-100 mb-10">
            {comments.map((c) => (
              <div key={c.id} className="py-5">
                <CommentItem
                  comment={c}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  onReply={(id) => setReplyingTo(id)}
                  onEdit={(comment) => setEditingComment(comment.id)}
                  onDelete={(id) => deleteCommentMutation.mutate(id)}
                  onLike={(id) => likeCommentMutation.mutate(id)}
                  onSubmitReply={(content, id) => replyCommentMutation.mutate({ id, content })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailContent;
