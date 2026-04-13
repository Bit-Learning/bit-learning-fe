import { Clock3, Eye, MessageCircle } from "lucide-react";
import { Post } from "../types/forum.type";
import { formatCompactNumber, formatRelative } from "../utils/forum.utils";

export function PostMeta({ post }: { post: Post }) {
	return (
		<div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
			<span className="inline-flex items-center gap-1.5">
				<MessageCircle className="h-3.5 w-3.5" />
				{formatCompactNumber(post.commentsCount)}
			</span>
			<span className="inline-flex items-center gap-1.5">
				<Eye className="h-3.5 w-3.5" />
				{formatCompactNumber(post.viewsCount)}
			</span>
			<span className="inline-flex items-center gap-1.5">
				<Clock3 className="h-3.5 w-3.5" />
				{formatRelative(post.createdAt)}
			</span>
		</div>
	);
}
