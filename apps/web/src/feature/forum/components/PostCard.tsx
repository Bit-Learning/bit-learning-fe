import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, MoreHorizontal, Download, X, ZoomIn, FileText, File } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { type Post, AttachmentType } from "../types/forum.type";
import { AuthorAvatar } from "./AuthorAvatar";

interface PostCardProps {
  post: Post;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onViewDetails?: (id: number) => void;
  showFullContent?: boolean;
  showActions?: boolean;
}

function formatDate(date: string): string {
  const diffH = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (diffH < 1) return "Vừa xong";
  if (diffH < 24) return `${diffH} giờ trước`;
  const days = Math.floor(diffH / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString("vi-VN");
}

function getFileIcon(url: string) {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

function getFileIconStyle(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "bg-red-50 text-red-500";
  if (["xls", "xlsx", "csv"].includes(ext)) return "bg-green-50 text-green-600";
  if (["ppt", "pptx"].includes(ext)) return "bg-orange-50 text-orange-500";
  return "bg-gray-100 text-gray-500";
}

function getFileName(url: string): string {
  return url.split("/").pop() ?? "Tài liệu đính kèm";
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDislike, showFullContent = false }) => {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes);

  const goDetail = () => navigate({ to: "/forum/post/$id", params: { id: String(post.id) } });

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      if (disliked) {
        setDisliked(false);
        setDislikeCount((c) => c - 1);
      }
    }
    onLike(post.id);
  };

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
      setDislikeCount((c) => c - 1);
    } else {
      setDisliked(true);
      setDislikeCount((c) => c + 1);
      if (liked) {
        setLiked(false);
        setLikeCount((c) => c - 1);
      }
    }
    onDislike(post.id);
  };

  const imageAttachments = post.attachments.filter((a) => a.type === AttachmentType.IMAGE);
  const fileAttachments = post.attachments.filter((a) => a.type === AttachmentType.FILE);

  const firstImage = imageAttachments[0];
  const secondImage = imageAttachments[1];
  const thirdImage = imageAttachments[2];

  return (
    <>
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="bg-white rounded-md border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <AuthorAvatar author={post.author} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">
                {post.author.firstName} {post.author.lastName}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                {post.isEdited && <span className="text-xs text-gray-400">· đã chỉnh sửa</span>}
              </div>
            </div>
          </div>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {post.hashtags.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {post.hashtags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="text-xs text-primary bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="px-4 pb-3">
          <h2
            className="text-[15px] font-semibold text-gray-900 mb-1.5 hover:text-primary cursor-pointer transition-colors leading-snug"
            onClick={goDetail}
          >
            {post.title}
          </h2>
          <p className={`text-sm text-gray-600 leading-relaxed ${!showFullContent ? "line-clamp-3" : ""}`}>
            {post.content}
          </p>
          {!showFullContent && post.content.length > 200 && (
            <button
              className="cursor-pointer text-xs text-primary font-semibold mt-1 hover:underline"
              onClick={goDetail}
            >
              Xem thêm
            </button>
          )}
        </div>

        {imageAttachments.length === 1 && firstImage !== undefined && (
          <div className="relative cursor-zoom-in group" onClick={() => setLightbox(firstImage.url)}>
            <img src={firstImage.url} alt="" className="w-full max-h-120 object-cover block" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
            </div>
          </div>
        )}

        {imageAttachments.length === 2 && (
          <div className="grid grid-cols-2 gap-px">
            {imageAttachments.map((img) => (
              <div key={img.id} className="relative cursor-zoom-in group" onClick={() => setLightbox(img.url)}>
                <img src={img.url} alt="" className="w-full h-72 object-cover block" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {imageAttachments.length === 3 &&
          firstImage !== undefined &&
          secondImage !== undefined &&
          thirdImage !== undefined && (
            <div className="grid grid-cols-[2fr_1fr] gap-px">
              <div className="relative cursor-zoom-in group" onClick={() => setLightbox(firstImage.url)}>
                <img src={firstImage.url} alt="" className="w-full h-80 object-cover block" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </div>
              <div className="flex flex-col gap-px">
                {[secondImage, thirdImage].map((img) => (
                  <div
                    key={img.id}
                    className="relative cursor-zoom-in group flex-1"
                    onClick={() => setLightbox(img.url)}
                  >
                    <img src={img.url} alt="" className="w-full h-full min-h-32 object-cover block" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

        {imageAttachments.length >= 4 && (
          <div className="grid grid-cols-2 gap-px">
            {imageAttachments.slice(0, 4).map((img, i) => (
              <div key={img.id} className="relative cursor-zoom-in group" onClick={() => setLightbox(img.url)}>
                <img src={img.url} alt="" className="w-full h-56 object-cover block" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                {i === 3 && imageAttachments.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">+{imageAttachments.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {fileAttachments.length > 0 && (
          <div className="px-4 py-3 flex flex-col gap-2 border-t border-gray-100">
            {fileAttachments.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all group"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${getFileIconStyle(file.url)}`}
                >
                  {getFileIcon(file.url)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{getFileName(file.url)}</p>
                </div>
                <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        )}

        {(likeCount > 0 || dislikeCount > 0) && (
          <div className="px-4 py-2 flex items-center gap-4 text-sm border-t border-gray-100 mt-2">
            {likeCount > 0 && (
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                <span className="font-medium text-gray-600">{likeCount}</span>
              </span>
            )}

            {dislikeCount > 0 && (
              <span className="flex items-center gap-1.5">
                <ThumbsDown className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span className="font-medium text-gray-600">{dislikeCount}</span>
              </span>
            )}
          </div>
        )}

        <div
          className={`flex items-center border-t border-gray-200 ${likeCount > 0 || dislikeCount > 0 ? "" : "mt-2"}`}
        >
          <button
            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${liked ? "text-primary hover:bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
            onClick={handleLike}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? "fill-blue-600 text-primary" : ""}`} />
            Thích
          </button>
          <button
            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${disliked ? "text-red-500 hover:bg-red-50" : "text-gray-500 hover:bg-gray-50"}`}
            onClick={handleDislike}
          >
            <ThumbsDown className={`w-4 h-4 ${disliked ? "fill-red-500 text-red-500" : ""}`} />
            Không thích
          </button>
          <button
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={goDetail}
          >
            <MessageCircle className="w-4 h-4" />
            Bình luận
          </button>
        </div>
      </div>
    </>
  );
};
