import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, ThumbsDown } from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import type { Post } from "../types/forum.type";
import { useLikeForumPost, useDislikeForumPost, useUnlikeOrUndislikeForumPost } from "../queries/useForum";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface PostCardProps {
  post: Post;
  onCommentClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onCommentClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const likePost = useLikeForumPost();
  const dislikePost = useDislikeForumPost();
  const unlikePost = useUnlikeOrUndislikeForumPost();

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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 flex items-start justify-between border-b">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.avatar || "/default-avatar.png"}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div>
            <h4 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{post.author.name}</h4>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
              {post.isEdited && " • Đã chỉnh sửa"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical size={18} />
        </Button>
      </div>

      <Link to="/forum/post/$id" params={{ id: post.id.toString() }} className="block p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{post.title}</h3>
        <p className="text-gray-700 line-clamp-3 mb-3">{post.content}</p>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.hashtags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="cursor-pointer hover:bg-blue-100 transition-colors">
                #{tag.name}
              </Badge>
            ))}
          </div>
        )}

        {post.attachments && post.attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {post.attachments.slice(0, 4).map((attachment) => (
              <div key={attachment.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                {attachment.type === "IMAGE" ? (
                  <img
                    src={attachment.url}
                    alt="attachment"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">📄 File đính kèm</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Link>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3 py-2 border-t">
          <span className="flex items-center gap-1">
            <Heart size={16} className="text-red-500" />
            {post.likes} lượt thích
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown size={16} className="text-gray-400" />
            {post.dislikes}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button variant={isLiked ? "default" : "ghost"} size="sm" onClick={handleLike} className="w-full">
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="ml-1 hidden sm:inline">Thích</span>
          </Button>

          <Button variant={isDisliked ? "secondary" : "ghost"} size="sm" onClick={handleDislike} className="w-full">
            <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
            <span className="ml-1 hidden sm:inline">Không thích</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onCommentClick} className="w-full">
            <MessageCircle size={18} />
            <span className="ml-1 hidden sm:inline">Bình luận</span>
          </Button>

          <Button variant="ghost" size="sm" className="w-full">
            <Share2 size={18} />
            <span className="ml-1 hidden sm:inline">Chia sẻ</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
