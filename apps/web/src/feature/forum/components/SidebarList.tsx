import { Post } from "../types/forum.type";
import { formatCompactNumber, formatRelative } from "../utils/forum.utils";

export function SidebarList({
	title,
	icon,
	posts,
	onOpenPost,
}: {
	title: string;
	icon: React.ReactNode;
	posts: Post[];
	onOpenPost: (post: Post) => void;
}) {
	return (
		<section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
			<div className="mb-4 flex items-center gap-2 text-slate-900">
				{icon}
				<h3 className="text-sm font-black uppercase tracking-[0.2em]">
					{title}
				</h3>
			</div>
			<div className="space-y-4">
				{posts.map((post) => (
					<button
						key={post.id}
						type="button"
						onClick={() => onOpenPost(post)}
						className="flex w-full items-start gap-3 text-left"
					>
						<img
							src={post.thumbnailUrl}
							alt={post.title}
							className="h-16 w-16 rounded-2xl object-cover"
						/>
						<div className="min-w-0 flex-1">
							<p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-900">
								{post.title}
							</p>
							<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
								<span>{formatRelative(post.createdAt)}</span>
								<span>•</span>
								<span>{formatCompactNumber(post.viewsCount)} lượt xem</span>
							</div>
						</div>
					</button>
				))}
				{posts.length === 0 && (
					<p className="text-sm text-slate-500">Hiện không có bài đăng nào..</p>
				)}
			</div>
		</section>
	);
}
