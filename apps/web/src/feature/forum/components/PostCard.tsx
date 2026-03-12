import React from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreHorizontal, ChevronDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import type { Post, AttachmentType } from "../types/forum.type";
import { AuthorAvatar } from "./AuthorAvatar";

interface PostCardProps {
  post: Post;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onViewDetails?: (id: number) => void;
  showFullContent?: boolean;
  showActions?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onDislike,
  onViewDetails,
  showFullContent = false,
}) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  const imageAttachment = post.attachments.find((a) => a.type === ("IMAGE" as AttachmentType));

  return (
    <Card className="border-gray-200 hover:border-blue-600/40 transition-all group">
      <CardContent className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <AuthorAvatar author={post.author} size="md" />
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">
                {post.author.firstName} {post.author.lastName}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                {post.hashtags.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    {post.hashtags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        className="bg-blue-50 text-blue-600 border-blue-100 text-xs hover:bg-blue-100"
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <h2
          className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight"
          onClick={() => navigate({ to: "/forum/post/$id", params: { id: String(post.id) } })}
        >
          {post.title}
        </h2>

        <p
          className={`text-gray-600 text-[15px] leading-relaxed ${!showFullContent && "line-clamp-3"} ${imageAttachment ? "mb-6" : "mb-8"}`}
        >
          {post.content}
        </p>

        {imageAttachment && (
          <div className="rounded-2xl overflow-hidden mb-6 border border-gray-100">
            <img
              alt={post.title}
              className="w-full h-80 object-cover hover:scale-[1.02] transition-transform duration-500"
              src={imageAttachment.url}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              className="gap-2.5 text-gray-500 hover:text-blue-600"
              onClick={() => onLike(post.id)}
            >
              <ThumbsUp className={`w-5 h-5 ${post.likes > 0 ? "fill-blue-600 text-blue-600" : ""}`} />
              <span className={`text-sm font-bold ${post.likes > 0 ? "text-blue-600" : ""}`}>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              className="gap-2.5 text-gray-500 hover:text-blue-600"
              onClick={() => onDislike(post.id)}
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="text-sm font-bold">{post.dislikes}</span>
            </Button>
            <Button
              variant="ghost"
              className="gap-2.5 text-gray-500 hover:text-blue-600"
              onClick={() => navigate({ to: "/forum/post/$id", params: { id: String(post.id) } })}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-bold">Bình luận</span>
            </Button>
            <Button variant="ghost" className="gap-2.5 text-gray-500 hover:text-blue-600">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
          {!showFullContent && onViewDetails && (
            <Button
              variant="ghost"
              className="text-blue-600 text-sm font-bold gap-1 hover:underline"
              onClick={() => onViewDetails(post.id)}
            >
              Xem chi tiết
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
