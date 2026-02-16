import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ThumbsUp, ThumbsDown, MessageSquare, Tag, User } from "lucide-react";
import { PostPreview } from "../types/post.type";
import { useNavigate } from "@tanstack/react-router";

interface PostCardProps {
  post: PostPreview;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-mono mb-1">{post.code}</p>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </div>
          {post.isBanned && (
            <Badge variant="destructive" className="ml-2">
              Bị khóa
            </Badge>
          )}
          {post.isEdited && (
            <Badge variant="secondary" className="ml-2">
              Đã chỉnh sửa
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <User className="w-4 h-4" />
          <span>
            {post.author.firstName} {post.author.lastName}
          </span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
        </div>

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.hashtags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
            {post.hashtags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.hashtags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="w-4 h-4" />
            <span>{post.dislikes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>Bình luận</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => navigate({ to: "/posts/$id", params: { id: post.id.toString() } })}
        >
          <Eye className="w-4 h-4 mr-2" />
          Xem chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
};
