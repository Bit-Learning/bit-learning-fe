import type React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, MessageSquare, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostPreview } from "../types/post.type";
import {
	getAuthorInitials,
	getAuthorName,
	getPostExcerpt,
} from "../post.utils";

interface PostRowProps {
	post: PostPreview;
}

export const PostRow: React.FC<PostRowProps> = ({ post }) => {
	const navigate = useNavigate();

	return (
		<tr className="border-b transition-colors hover:bg-muted/50">
			<td className="px-4 py-3 align-top">
				<div className="flex items-start gap-3">
					<img
						src={post.thumbnailUrl}
						alt={post.title}
						className="h-14 w-20 rounded-md border object-cover"
					/>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<p className="line-clamp-1 font-medium">{post.title}</p>
							{post.isFeatured && <Badge variant="secondary">Nổi bật</Badge>}
							{post.isTrending && <Badge variant="outline">Trending</Badge>}
						</div>
						<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
							{getPostExcerpt(post)}
						</p>
						<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span className="font-mono">#{post.id}</span>
							<span className="font-mono">{post.slug}</span>
							{post.category && (
								<Badge variant="outline">{post.category.name}</Badge>
							)}
						</div>
					</div>
				</div>
			</td>
			<td className="px-4 py-3 align-top">
				<div className="flex items-center gap-2 whitespace-nowrap text-sm">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={post.author.avatar}
							alt={getAuthorName(post.author)}
						/>
						<AvatarFallback>{getAuthorInitials(post.author)}</AvatarFallback>
					</Avatar>
					<span>{getAuthorName(post.author)}</span>
				</div>
			</td>
			<td className="px-4 py-3 align-top whitespace-nowrap text-sm text-muted-foreground">
				<div>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</div>
				<div className="mt-2 flex items-center gap-3 text-xs">
					<span>{post.viewsCount.toLocaleString("vi-VN")} lượt xem</span>
					<span className="inline-flex items-center gap-1">
						<MessageSquare className="h-3.5 w-3.5" />
						{post.commentsCount}
					</span>
					<span className="inline-flex items-center gap-1">
						<TrendingUp className="h-3.5 w-3.5" />
						{post.totalReactions}
					</span>
				</div>
			</td>
			<td className="px-4 py-3 align-top">
				<div className="flex flex-wrap gap-1.5">
					{post.isBanned && <Badge variant="destructive">Bị khóa</Badge>}
					{post.isEdited && <Badge variant="secondary">Đã sửa</Badge>}
					{!post.isBanned && !post.isEdited && (
						<Badge variant="default" className="bg-green-500">
							Hoạt động
						</Badge>
					)}
				</div>
			</td>
			<td className="px-4 py-3 align-top">
				<Button
					size="sm"
					variant="outline"
					className="hover:bg-blue-700 hover:text-white"
					onClick={() =>
						navigate({ to: "/posts/$id", params: { id: post.id.toString() } })
					}
				>
					<Eye className="mr-1 h-4 w-4" />
					Chi tiết
				</Button>
			</td>
		</tr>
	);
};
