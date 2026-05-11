import { Post } from "../types/forum.type";
import { getAuthorName } from "../utils/forum.utils";
import { AuthorAvatar } from "./AuthorAvatar";
import { PostMeta } from "./PostMeta";
import { PostBadge } from "./PostBadge";

export function ContentPostCard({
	post,
	onOpenPost,
}: {
	post: Post;
	onOpenPost: (post: Post) => void;
}) {
	return (
		<article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
			<div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
				<img
					src={post.thumbnailUrl}
					alt={post.title}
					className="h-full w-full cursor-pointer object-cover"
					onClick={() => onOpenPost(post)}
				/>
				{/* <div className="absolute left-4 top-4 flex gap-2">
          <PostBadge post={post} />
        </div> */}
			</div>

			<div className="space-y-4 p-5">
				<div className="space-y-3">
					<h3
						className="line-clamp-2 min-h-[3em] cursor-pointer text-xl font-bold leading-snug text-slate-950 transition hover:text-blue-700"
						onClick={() => onOpenPost(post)}
					>
						{post.title}
					</h3>
					<p className="line-clamp-2 min-h-[3em] text-sm leading-6 text-slate-600">
						{post.excerpt}
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{post.tags.slice(0, 3).map((tag) => (
						<span
							key={tag.id}
							className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
						>
							#{tag.name}
						</span>
					))}
				</div>

				<div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
					<div className="flex items-center gap-3">
						<AuthorAvatar author={post.author} size="sm" />
						<div>
							<p className="text-sm font-semibold text-slate-900">
								{getAuthorName(post)}
							</p>
							<PostMeta post={post} />
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}
