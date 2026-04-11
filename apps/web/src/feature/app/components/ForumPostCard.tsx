import React from "react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Eye, MessageCircle } from "lucide-react";
import type { Post } from "@/feature/forum/types/forum.type";
import { formatRelative } from "@/feature/forum/utils/forum.utils";
import { AuthorAvatar } from "@/feature/forum/components/AuthorAvatar";

interface ForumPostCardProps {
	post: Post;
	onClick: (post: Post) => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, onClick }) => {
	return (
		<Card className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
			<CardContent className="flex h-full flex-col p-0">
				<img
					src={post.thumbnailUrl}
					alt={post.title}
					className="mb-5 h-48 w-full cursor-pointer rounded-[1.25rem] object-cover"
					onClick={() => onClick(post)}
				/>

				<div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
					<span>{post.category?.name ?? "Community"}</span>
					<span>•</span>
					<span>{formatRelative(post.createdAt)}</span>
				</div>

				<h4
					className="line-clamp-2 cursor-pointer text-xl font-black leading-snug text-slate-900 transition hover:text-blue-700"
					onClick={() => onClick(post)}
				>
					{post.title}
				</h4>

				<p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
					{post.excerpt}
				</p>

				<div className="mt-auto pt-5">
					<div className="mb-4 flex items-center gap-3">
						<AuthorAvatar author={post.author} size="sm" />
						<div>
							<p className="text-sm font-semibold text-slate-900">
								{post.author.name ??
									`${post.author.firstName} ${post.author.lastName}`.trim()}
							</p>
							<p className="text-xs text-slate-500">User-generated post</p>
						</div>
					</div>

					<div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
						<div className="flex gap-4">
							<span className="flex items-center gap-1">
								<MessageCircle className="h-4 w-4" /> {post.commentsCount}
							</span>
							<span className="flex items-center gap-1">
								<Eye className="h-4 w-4" /> {post.viewsCount}
							</span>
						</div>
						<span className="font-bold text-blue-700">View post</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ForumPostCard;
