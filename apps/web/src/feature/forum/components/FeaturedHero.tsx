import { Compass } from "lucide-react";
import { Post } from "../types/forum.type";
import { CATEGORY_ICONS } from "./ForumContent";
import { PostBadge } from "./PostBadge";
import { AuthorAvatar } from "./AuthorAvatar";
import { getAuthorName } from "../utils/forum.utils";
import { PostMeta } from "./PostMeta";

export function FeaturedHero({
	posts,
	onOpenPost,
}: {
	posts: Post[];
	onOpenPost: (post: Post) => void;
}) {
	const hero = posts[0];
	if (!hero) return null;
	const sidePosts = posts.slice(1);

	return (
		<section className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
			<article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
				<div className="cursor-pointer" onClick={() => onOpenPost(hero)}>
					<img
						src={hero.thumbnailUrl}
						alt={hero.title}
						className="h-72 w-full object-cover sm:h-96"
					/>
				</div>

				<div className="space-y-5 p-6 sm:p-8">
					<div className="flex flex-wrap items-center gap-3">
						{hero.category && (
							<span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
								{CATEGORY_ICONS[hero.category.iconKey] ?? (
									<Compass className="h-3.5 w-3.5" />
								)}
								{hero.category.name}
							</span>
						)}
						{/* <PostBadge post={hero} /> */}
					</div>

					<div className="space-y-3">
						<h2
							className="cursor-pointer text-3xl font-black tracking-tight text-slate-950 transition hover:text-blue-700"
							onClick={() => onOpenPost(hero)}
						>
							{hero.title}
						</h2>
						<p className="max-w-3xl text-base leading-7 text-slate-600">
							{hero.excerpt}
						</p>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
						<div className="flex items-center gap-3">
							<AuthorAvatar author={hero.author} size="md" />
							<div>
								<p className="text-sm font-semibold text-slate-900">
									{getAuthorName(hero)}
								</p>
								<PostMeta post={hero} />
							</div>
						</div>
					</div>
				</div>
			</article>

			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
				{sidePosts.map((post) => (
					<article
						key={post.id}
						className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
					>
						<div className="h-24 w-[120px] overflow-hidden rounded-2xl">
							<img
								src={post.thumbnailUrl}
								alt={post.title}
								className="h-full w-full cursor-pointer object-cover"
								onClick={() => onOpenPost(post)}
							/>
						</div>

						<div className="flex min-w-0 flex-col justify-between gap-3">
							<div className="space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									{post.category && (
										<span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
											{post.category.name}
										</span>
									)}
									{/* <PostBadge post={post} /> */}
								</div>

								<h3
									className="line-clamp-2 cursor-pointer text-lg font-bold leading-snug text-slate-900 transition hover:text-blue-700"
									onClick={() => onOpenPost(post)}
								>
									{post.title}
								</h3>

								<p className="line-clamp-2 text-sm leading-6 text-slate-600">
									{post.excerpt}
								</p>
							</div>

							<div className="flex items-center justify-between gap-3">
								<PostMeta post={post} />
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
