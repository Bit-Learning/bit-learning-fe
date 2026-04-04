import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PostPreview } from "../types/post.type";
import { useNavigate } from "@tanstack/react-router";

interface PostRowProps {
  post: PostPreview;
}

export const PostRow: React.FC<PostRowProps> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-xs text-muted-foreground font-mono">{post.code}</p>
        <p className="font-medium line-clamp-1">{post.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.content}</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm">
        {post.author.firstName} {post.author.lastName}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 flex-wrap">
          {post.isBanned && <Badge variant="destructive">Bị khóa</Badge>}
          {post.isEdited && <Badge variant="secondary">Đã sửa</Badge>}
          {!post.isBanned && !post.isEdited && (
            <Badge variant="default" className="bg-green-500">
              Hoạt động
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Button
          size="sm"
          variant="outline"
          className="hover:text-white hover:bg-blue-700"
          onClick={() => navigate({ to: "/posts/$id", params: { id: post.id.toString() } })}
        >
          <Eye className="w-4 h-4 mr-1" />
          Chi tiết
        </Button>
      </td>
    </tr>
  );
};
