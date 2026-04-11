import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Badge } from "@workspace/ui/components/Badge";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	BookOpen,
	Clock3,
	Eye,
	Flame,
	MessageCircle,
	Search,
	ShieldQuestion,
	Sparkles,
	Tag,
	TrendingUp,
	Users,
	Compass,
} from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	useFeaturedForumPosts,
	useForumCategories,
	useInfiniteForumPosts,
	useLatestForumList,
	useMostViewedForumPosts,
	usePopularForumTags,
	useRecommendedForumPosts,
	useTrendingForumPosts,
} from "../queries/useForum";
import { formatRelative } from "../utils/forum.utils";
import { AuthorAvatar } from "./AuthorAvatar";
import type { ForumCategory, Post, Tag as ForumTag } from "../types/forum.type";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	"layout-grid": <Compass className="h-4 w-4" />,
	server: <ShieldQuestion className="h-4 w-4" />,
	monitor: <Sparkles className="h-4 w-4" />,
	rocket: <TrendingUp className="h-4 w-4" />,
	sparkles: <Flame className="h-4 w-4" />,
	briefcase: <BookOpen className="h-4 w-4" />,
};

function formatCompactNumber(value: number) {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
	}
	return String(value);
}

function getAuthorName(post: Post) {
	if (post.author.name) return post.author.name;
	return `${post.author.firstName} ${post.author.lastName}`.trim();
}

function updateSearchState(
	navigate: ReturnType<typeof useNavigate>,
	nextSearch: {
		q?: string;
		category?: string;
		tag?: string;
		sort?: string;
	},
) {
	navigate({
		to: "/forum",
		search: {
			q: nextSearch.q || undefined,
			category: nextSearch.category || undefined,
			tag: nextSearch.tag || undefined,
			sort: nextSearch.sort || undefined,
		},
	});
}

function PostMeta({ post }: { post: Post }) {
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

function PostBadge({ post }: { post: Post }) {
	if (post.isFeatured)
		return <Badge className="bg-amber-500 text-white">Nổi bật</Badge>;
	if (post.isTrending)
		return <Badge className="bg-orange-500 text-white">Thịnh hành</Badge>;

	const ageInHours =
		(Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
	if (ageInHours <= 24)
		return <Badge className="bg-emerald-500 text-white">Mới</Badge>;
	return null;
}

function FeaturedHero({
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
						<PostBadge post={hero} />
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
						className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
					>
						<img
							src={post.thumbnailUrl}
							alt={post.title}
							className="h-full w-full cursor-pointer rounded-2xl object-cover"
							onClick={() => onOpenPost(post)}
						/>
						<div className="flex min-w-0 flex-col justify-between gap-3">
							<div className="space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									{post.category && (
										<span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
											{post.category.name}
										</span>
									)}
									<PostBadge post={post} />
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

function ContentPostCard({
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
				<div className="absolute left-4 top-4 flex gap-2">
					<PostBadge post={post} />
				</div>
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

function SidebarList({
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
								<span>{formatCompactNumber(post.viewsCount)} views</span>
							</div>
						</div>
					</button>
				))}
				{posts.length === 0 && (
					<p className="text-sm text-slate-500">No posts available.</p>
				)}
			</div>
		</section>
	);
}

const ForumContent: React.FC = () => {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as {
		q?: string;
		category?: string;
		tag?: string;
		sort?: "latest" | "trending" | "most_viewed" | "most_reacted";
	};
	const [searchInput, setSearchInput] = useState(search.q ?? "");
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	const selectedSort = search.sort ?? "latest";
	const selectedCategory = search.category ?? "";
	const selectedTag = search.tag ?? "";

	const featuredQuery = useFeaturedForumPosts(4);
	const trendingQuery = useTrendingForumPosts(8);
	const recommendedQuery = useRecommendedForumPosts(6);
	const categoriesQuery = useForumCategories();
	const popularTagsQuery = usePopularForumTags(16);
	const sidebarMostViewedQuery = useMostViewedForumPosts(5);
	const sidebarLatestQuery = useLatestForumList(5);

	const latestFeedQuery = useInfiniteForumPosts({
		q: search.q,
		category: search.category,
		tag: search.tag,
		sort: selectedSort,
		size: 9,
	});

	const featuredPosts = featuredQuery.data?.data ?? [];
	const trendingPosts = trendingQuery.data?.data ?? [];
	const recommendedPosts = recommendedQuery.data?.data ?? [];
	const categories = categoriesQuery.data?.data ?? [];
	const popularTags = popularTagsQuery.data?.data ?? [];
	const latestPosts = useMemo(
		() => latestFeedQuery.data?.pages.flatMap((page) => page.data ?? []) ?? [],
		[latestFeedQuery.data],
	);
	const mostViewedPosts = sidebarMostViewedQuery.data ?? [];
	const latestCompactPosts = sidebarLatestQuery.data ?? [];

	useEffect(() => {
		setSearchInput(search.q ?? "");
	}, [search.q]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			const nextValue = searchInput.trim();
			if ((search.q ?? "") === nextValue) return;
			updateSearchState(navigate, {
				q: nextValue,
				category: selectedCategory,
				tag: selectedTag,
				sort: selectedSort,
			});
		}, 250);

		return () => window.clearTimeout(timer);
	}, [
		searchInput,
		search.q,
		navigate,
		selectedCategory,
		selectedTag,
		selectedSort,
	]);

	useEffect(() => {
		const node = loadMoreRef.current;
		if (
			!node ||
			!latestFeedQuery.hasNextPage ||
			latestFeedQuery.isFetchingNextPage
		) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const firstEntry = entries[0];
				if (firstEntry?.isIntersecting) {
					latestFeedQuery.fetchNextPage();
				}
			},
			{ rootMargin: "200px 0px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [
		latestFeedQuery.fetchNextPage,
		latestFeedQuery.hasNextPage,
		latestFeedQuery.isFetchingNextPage,
		latestPosts.length,
	]);

	const openPost = (post: Post) =>
		navigate({ to: "/forum/post/$id", params: { id: String(post.id) } });

	const setCategory = (category?: ForumCategory | string) => {
		const categorySlug =
			typeof category === "string" ? category : category?.slug;
		updateSearchState(navigate, {
			q: search.q,
			category: categorySlug === selectedCategory ? undefined : categorySlug,
			tag: selectedTag,
			sort: selectedSort,
		});
	};

	const setTag = (tag?: ForumTag | string) => {
		const tagSlug = typeof tag === "string" ? tag : tag?.slug;
		if (!tagSlug) return;
		updateSearchState(navigate, {
			q: search.q,
			category: selectedCategory,
			tag: tagSlug === selectedTag ? undefined : tagSlug,
			sort: selectedSort,
		});
	};

	const setSort = (
		sort: "latest" | "trending" | "most_viewed" | "most_reacted",
	) =>
		updateSearchState(navigate, {
			q: search.q,
			category: selectedCategory,
			tag: selectedTag,
			sort,
		});

	return (
		<div className="min-h-screen bg-[#f5f7fb]">
			<div className="border-b border-slate-200 bg-white/90 backdrop-blur">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
						<div className="space-y-5">
							<Badge className="rounded-full bg-slate-900 px-4 py-1 text-white">
								Bit Learning Community Hub
							</Badge>
							<div className="space-y-3">
								<h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
									Posts first, discovery rich.
								</h1>
								<p className="max-w-3xl text-base leading-7 text-slate-600">
									Explore community posts through featured stories, trending
									discussions, fast filters, and high-density side rails built
									for learning and sharing.
								</p>
							</div>

							<div className="relative max-w-2xl">
								<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<Input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									placeholder="Search posts, topics, or tags..."
									className="h-14 rounded-full border-slate-200 bg-white pl-12 pr-12 text-base shadow-sm"
								/>
							</div>

							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
									<Compass className="h-4 w-4" />
									Categories
								</div>
								<div className="flex gap-2 overflow-x-auto pb-1">
									<button
										type="button"
										onClick={() => setCategory("")}
										className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
											!selectedCategory
												? "bg-slate-900 text-white"
												: "bg-white text-slate-600 hover:bg-slate-100"
										}`}
									>
										All categories
									</button>
									{categories.map((category) => (
										<button
											key={category.id}
											type="button"
											onClick={() => setCategory(category)}
											className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
												selectedCategory === category.slug
													? "bg-slate-900 text-white"
													: "bg-white text-slate-600 hover:bg-slate-100"
											}`}
										>
											{category.name}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
									<Tag className="h-4 w-4" />
									Trending tags
								</div>
								<div className="flex flex-wrap gap-2">
									{popularTags.slice(0, 10).map((tag) => (
										<button
											key={tag.id}
											type="button"
											onClick={() => setTag(tag)}
											className={`rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
												selectedTag === tag.slug
													? "border-blue-200 bg-blue-50 text-blue-700"
													: "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
											}`}
										>
											#{tag.name}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
				<FeaturedHero posts={featuredPosts} onOpenPost={openPost} />

				<div className="grid gap-8 xl:grid-cols-[minmax(0,1.75fr)_360px]">
					<div className="space-y-8">
						<section className="space-y-4">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
										Trending posts
									</p>
									<h2 className="text-2xl font-black text-slate-950">
										What the community is reading now
									</h2>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								{trendingPosts.map((post) => (
									<ContentPostCard
										key={post.id}
										post={post}
										onOpenPost={openPost}
									/>
								))}
							</div>
						</section>

						<section className="space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
										Latest posts
									</p>
									<h2 className="text-2xl font-black text-slate-950">
										Fresh community discussions
									</h2>
								</div>

								<div className="flex gap-2 overflow-x-auto">
									{[
										{ value: "latest", label: "Latest" },
										{ value: "most_reacted", label: "Most reacted" },
										{ value: "most_viewed", label: "Most viewed" },
										{ value: "trending", label: "Trending" },
									].map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() =>
												setSort(
													option.value as
														| "latest"
														| "trending"
														| "most_viewed"
														| "most_reacted",
												)
											}
											className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
												selectedSort === option.value
													? "bg-slate-900 text-white"
													: "bg-white text-slate-600 hover:bg-slate-100"
											}`}
										>
											{option.label}
										</button>
									))}
								</div>
							</div>

							{latestFeedQuery.isLoading ? (
								<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
									{Array.from({ length: 6 }).map((_, index) => (
										<div
											key={index}
											className="h-[420px] animate-pulse rounded-[1.75rem] border border-slate-200 bg-white"
										/>
									))}
								</div>
							) : latestPosts.length === 0 ? (
								<div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
									No posts matched the current filters.
								</div>
							) : (
								<>
									<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 items-stretch">
										{latestPosts.map((post) => (
											<ContentPostCard
												key={post.id}
												post={post}
												onOpenPost={openPost}
											/>
										))}
									</div>
									<div ref={loadMoreRef} className="flex justify-center py-2">
										{latestFeedQuery.isFetchingNextPage ? (
											<div className="rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
												Loading more posts...
											</div>
										) : latestFeedQuery.hasNextPage ? (
											<div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
												Scroll for more
											</div>
										) : (
											<div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
												You reached the end
											</div>
										)}
									</div>
								</>
							)}
						</section>

						<section className="space-y-4">
							<div>
								<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
									Categories
								</p>
								<h2 className="text-2xl font-black text-slate-950">
									Browse by topic lane
								</h2>
							</div>
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
								{categories.map((category) => (
									<button
										key={category.id}
										type="button"
										onClick={() => setCategory(category)}
										className={`rounded-[1.5rem] border p-5 text-left shadow-sm transition ${
											selectedCategory === category.slug
												? "border-blue-200 bg-blue-50"
												: "border-slate-200 bg-white hover:-translate-y-1 hover:shadow-lg"
										}`}
									>
										<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
											{CATEGORY_ICONS[category.iconKey] ?? (
												<Compass className="h-4 w-4" />
											)}
										</div>
										<h3 className="text-lg font-bold text-slate-950">
											{category.name}
										</h3>
										<p className="mt-2 text-sm text-slate-500">
											{formatCompactNumber(category.postsCount ?? 0)} posts in
											this topic
										</p>
									</button>
								))}
							</div>
						</section>

						<section className="space-y-4">
							<div>
								<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
									Knowledge picks
								</p>
								<h2 className="text-2xl font-black text-slate-950">
									Recommended posts to keep learning
								</h2>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								{recommendedPosts.map((post) => (
									<ContentPostCard
										key={post.id}
										post={post}
										onOpenPost={openPost}
									/>
								))}
							</div>
						</section>
					</div>

					<aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
						<SidebarList
							title="Bài viết nổi bật"
							icon={<Sparkles className="h-4 w-4 text-amber-500" />}
							posts={featuredPosts}
							onOpenPost={openPost}
						/>
						<SidebarList
							title="Được xem nhiều"
							icon={<Eye className="h-4 w-4 text-blue-500" />}
							posts={mostViewedPosts}
							onOpenPost={openPost}
						/>
						<SidebarList
							title="Mới cập nhật"
							icon={<Clock3 className="h-4 w-4 text-emerald-500" />}
							posts={latestCompactPosts}
							onOpenPost={openPost}
						/>

						<section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
							<div className="mb-4 flex items-center gap-2 text-slate-900">
								<Tag className="h-4 w-4 text-rose-500" />
								<h3 className="text-sm font-black uppercase tracking-[0.2em]">
									Từ khóa phổ biến
								</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{popularTags.map((tag) => (
									<button
										key={tag.id}
										type="button"
										onClick={() => setTag(tag)}
										className={`rounded-full border px-3 py-1.5 text-sm transition ${
											selectedTag === tag.slug
												? "border-blue-200 bg-blue-50 text-blue-700"
												: "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
										}`}
									>
										#{tag.name}
									</button>
								))}
							</div>
						</section>
					</aside>
				</div>
			</div>
		</div>
	);
};

export default ForumContent;
