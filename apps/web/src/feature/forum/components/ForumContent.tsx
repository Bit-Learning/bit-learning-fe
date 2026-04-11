import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Badge } from "@workspace/ui/components/Badge";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	AlertTriangle,
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
	Compass,
} from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { toast } from "@/shared/components/Sonner";
import {
	useFeaturedForumPosts,
	useForumCategories,
	useInfiniteForumPosts,
	useLatestForumList,
	useMostViewedForumPosts,
	usePopularForumTags,
	useRecommendedForumPosts,
	useSubscribeToForumPosts,
	useTrendingForumPosts,
} from "../queries/useForum";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
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

function getErrorMessage(error: unknown) {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return "Unable to load posts right now.";
}

function getSkeletonKeys(prefix: string, count: number) {
	return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);
}

function SkeletonBlock({ className }: { className: string }) {
	return (
		<div className={`animate-pulse rounded-3xl bg-slate-200/80 ${className}`} />
	);
}

function FilterChipSkeleton() {
	return <SkeletonBlock className="h-10 w-28 rounded-full" />;
}

function PostCardSkeleton() {
	return (
		<article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
			<SkeletonBlock className="aspect-[16/9] w-full rounded-none" />
			<div className="space-y-4 p-5">
				<div className="space-y-3">
					<SkeletonBlock className="h-6 w-4/5" />
					<SkeletonBlock className="h-6 w-3/5" />
					<SkeletonBlock className="h-4 w-full" />
					<SkeletonBlock className="h-4 w-5/6" />
				</div>
				<div className="flex gap-2">
					{getSkeletonKeys("post-tag-skeleton", 3).map((key) => (
						<SkeletonBlock key={key} className="h-7 w-20 rounded-full" />
					))}
				</div>
				<div className="flex items-center gap-3 border-t border-slate-200 pt-4">
					<SkeletonBlock className="h-10 w-10 rounded-full" />
					<div className="flex-1 space-y-2">
						<SkeletonBlock className="h-4 w-32" />
						<SkeletonBlock className="h-3 w-40" />
					</div>
				</div>
			</div>
		</article>
	);
}

function FeaturedHeroSkeleton() {
	return (
		<section className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
			<div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
				<SkeletonBlock className="h-72 w-full rounded-none sm:h-96" />
				<div className="space-y-5 p-6 sm:p-8">
					<div className="flex gap-3">
						<SkeletonBlock className="h-8 w-28 rounded-full" />
						<SkeletonBlock className="h-8 w-16 rounded-full" />
					</div>
					<div className="space-y-3">
						<SkeletonBlock className="h-8 w-5/6" />
						<SkeletonBlock className="h-8 w-3/5" />
						<SkeletonBlock className="h-4 w-full" />
						<SkeletonBlock className="h-4 w-11/12" />
					</div>
					<div className="flex items-center gap-3 border-t border-slate-200 pt-4">
						<SkeletonBlock className="h-12 w-12 rounded-full" />
						<div className="flex-1 space-y-2">
							<SkeletonBlock className="h-4 w-36" />
							<SkeletonBlock className="h-3 w-48" />
						</div>
					</div>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
				{getSkeletonKeys("featured-side-skeleton", 3).map((key) => (
					<div
						key={key}
						className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
					>
						<SkeletonBlock className="h-28 w-full rounded-2xl" />
						<div className="space-y-3">
							<SkeletonBlock className="h-4 w-20" />
							<SkeletonBlock className="h-5 w-full" />
							<SkeletonBlock className="h-5 w-4/5" />
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-2/3" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function SidebarListSkeleton() {
	return (
		<section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
			<div className="mb-4 flex items-center gap-2">
				<SkeletonBlock className="h-4 w-4 rounded-full" />
				<SkeletonBlock className="h-4 w-32" />
			</div>
			<div className="space-y-4">
				{getSkeletonKeys("sidebar-skeleton", 4).map((key) => (
					<div key={key} className="flex items-start gap-3">
						<SkeletonBlock className="h-16 w-16 rounded-2xl" />
						<div className="flex-1 space-y-2">
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-5/6" />
							<SkeletonBlock className="h-3 w-2/3" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function CategoryCardSkeleton() {
	return (
		<div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
			<SkeletonBlock className="mb-4 h-10 w-10 rounded-2xl" />
			<SkeletonBlock className="h-6 w-32" />
			<SkeletonBlock className="mt-2 h-4 w-28" />
		</div>
	);
}

function InlineStateCard({
	title,
	description,
	actionLabel,
	onAction,
}: {
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	return (
		<div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
				<AlertTriangle className="h-5 w-5" />
			</div>
			<h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
			<p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
				{description}
			</p>
			{actionLabel && onAction ? (
				<div className="mt-5">
					<Button type="button" onClick={onAction} className="rounded-full">
						{actionLabel}
					</Button>
				</div>
			) : null}
		</div>
	);
}

function ForumSubscribeCard({
	email,
	setEmail,
	onSubmit,
	isPending,
}: {
	email: string;
	setEmail: (value: string) => void;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<section className="overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#0f6ab8_0%,#1a6eaf_52%,#135e9f_100%)] p-6 text-white shadow-sm">
			<div className="space-y-5">
				<div className="space-y-2">
					<p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100/80">
						Forum updates
					</p>
					<p className="max-w-4xl text-base leading-8 text-blue-50">
						Nhận email khi cộng đồng Bit Learning có bài viết mới. Đăng ký để
						không bỏ lỡ các chủ đề Backend, Frontend, DevOps, AI và những chia
						sẻ hữu ích từ cộng đồng.
					</p>
				</div>

				<div className="flex flex-col gap-3 lg:flex-row">
					<Input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="Email"
						className="h-12 border-white/70 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-white focus-visible:ring-white/30"
					/>
					<Button
						type="button"
						onClick={onSubmit}
						isDisabled={isPending}
						className="h-12 min-w-44 rounded-xl border border-white/80 bg-transparent px-6 text-base font-semibold text-white hover:bg-white/10"
					>
						{isPending ? "Đang gửi..." : "Gửi yêu cầu"}
					</Button>
				</div>
			</div>
		</section>
	);
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
	const { userInfo } = useSelector(selectAuthStateInfo);
	const search = useSearch({ strict: false }) as {
		q?: string;
		category?: string;
		tag?: string;
		sort?: "latest" | "trending" | "most_viewed" | "most_reacted";
	};
	const [searchInput, setSearchInput] = useState(search.q ?? "");
	const [subscriptionEmail, setSubscriptionEmail] = useState(
		userInfo?.email ?? "",
	);
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
	const subscribeMutation = useSubscribeToForumPosts();

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
	const isFeedBootstrapping =
		latestFeedQuery.isLoading ||
		(latestFeedQuery.isFetching &&
			latestPosts.length === 0 &&
			!latestFeedQuery.isFetchingNextPage);
	const isRefreshingFeed =
		latestFeedQuery.isFetching &&
		latestPosts.length > 0 &&
		!latestFeedQuery.isFetchingNextPage;
	const activeFilterSummary = [
		search.q ? `Search: ${search.q}` : null,
		selectedCategory ? `Category: ${selectedCategory}` : null,
		selectedTag ? `Tag: ${selectedTag}` : null,
		selectedSort !== "latest" ? `Sort: ${selectedSort}` : null,
	].filter(Boolean);

	useEffect(() => {
		setSearchInput(search.q ?? "");
	}, [search.q]);

	useEffect(() => {
		if (userInfo?.email && !subscriptionEmail) {
			setSubscriptionEmail(userInfo.email);
		}
	}, [userInfo?.email, subscriptionEmail]);

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

	const handleSubscribe = () => {
		const email = subscriptionEmail.trim();
		if (!email) {
			toast.error({ title: "Please enter your email address" });
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error({ title: "Please enter a valid email address" });
			return;
		}

		const langKey =
			typeof window !== "undefined"
				? localStorage.getItem("i18nextLng") || "vi"
				: "vi";

		subscribeMutation.mutate({
			email,
			langKey,
		});
	};

	return (
		<div className="min-h-screen bg-[#f5f7fb]">
			<div className="border-b border-slate-200 bg-white/90 backdrop-blur">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
						<div className="space-y-5">
							<Badge className="rounded-full bg-slate-900 px-4 py-1 text-white">
								Cộng đồng chia sẻ công nghệ
							</Badge>
							<div className="space-y-3">
								<h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
									Nơi chia sẻ kiến thức, học hỏi và kết nối với cộng đồng Bit
									Learning
								</h1>
								<p className="max-w-3xl text-base leading-7 text-slate-600">
									Khám phá các bài đăng cộng đồng thông qua các bài viết nổi
									bật, thảo luận thịnh hành, bộ lọc nhanh và các thanh bên được
									thiết kế chuyên dụng để học hỏi và chia sẻ.
								</p>
							</div>

							<div className="relative max-w-2xl">
								<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<Input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									placeholder="Tìm kiếm bài viết, chủ đề..."
									className="h-14 rounded-full border-slate-200 bg-white pl-12 pr-12 text-base shadow-sm"
								/>
							</div>

							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
									<Compass className="h-4 w-4" />
									Chọn danh mục
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
									{categoriesQuery.isLoading
										? getSkeletonKeys("category-chip", 5).map((key) => (
												<FilterChipSkeleton key={key} />
											))
										: categories.map((category) => (
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
									Các thẻ thịnh hành
								</div>
								<div className="flex flex-wrap gap-2">
									{popularTagsQuery.isLoading
										? getSkeletonKeys("popular-tag-chip", 8).map((key) => (
												<FilterChipSkeleton key={key} />
											))
										: popularTags.slice(0, 10).map((tag) => (
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
				{featuredQuery.isLoading ? (
					<FeaturedHeroSkeleton />
				) : featuredQuery.isError ? (
					<InlineStateCard
						title="Featured posts are unavailable"
						description={getErrorMessage(featuredQuery.error)}
						actionLabel="Retry"
						onAction={() => featuredQuery.refetch()}
					/>
				) : (
					<FeaturedHero posts={featuredPosts} onOpenPost={openPost} />
				)}

				<div className="grid gap-8 xl:grid-cols-[minmax(0,1.75fr)_360px]">
					<div className="space-y-8">
						<ForumSubscribeCard
							email={subscriptionEmail}
							setEmail={setSubscriptionEmail}
							onSubmit={handleSubscribe}
							isPending={subscribeMutation.isPending}
						/>

						<section className="space-y-4">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
										Bài viết thịnh hành
									</p>
									<h2 className="text-2xl font-black text-slate-950">
										Cộng đồng đang quan tâm
									</h2>
								</div>
							</div>

							{trendingQuery.isLoading ? (
								<div className="grid gap-4 md:grid-cols-2">
									{getSkeletonKeys("trending-post", 4).map((key) => (
										<PostCardSkeleton key={key} />
									))}
								</div>
							) : trendingQuery.isError ? (
								<InlineStateCard
									title="Trending posts could not be loaded"
									description={getErrorMessage(trendingQuery.error)}
									actionLabel="Retry"
									onAction={() => trendingQuery.refetch()}
								/>
							) : (
								<div className="grid gap-4 md:grid-cols-2">
									{trendingPosts.map((post) => (
										<ContentPostCard
											key={post.id}
											post={post}
											onOpenPost={openPost}
										/>
									))}
								</div>
							)}
						</section>

						<section className="space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
										Bài viết mới nhất
									</p>
									<h2 className="text-2xl font-black text-slate-950">
										Luôn cập nhật những chia sẻ mới nhất từ cộng đồng
									</h2>
								</div>

								<div className="flex gap-2 overflow-x-auto">
									{[
										{ value: "latest", label: "Mới nhất" },
										{ value: "most_reacted", label: "Tương tác cao" },
										{ value: "most_viewed", label: "Lượt xem nhiều" },
										{ value: "trending", label: "Thịnh hành" },
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

							{activeFilterSummary.length > 0 ? (
								<div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
									<span className="font-semibold text-slate-700">Active:</span>
									{activeFilterSummary.map((item) => (
										<span
											key={item}
											className="rounded-full bg-slate-100 px-3 py-1"
										>
											{item}
										</span>
									))}
									{isRefreshingFeed ? (
										<span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
											Updating results...
										</span>
									) : null}
								</div>
							) : isRefreshingFeed ? (
								<div className="text-sm font-medium text-blue-700">
									Updating results...
								</div>
							) : null}

							{isFeedBootstrapping ? (
								<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
									{getSkeletonKeys("feed-post", 6).map((key) => (
										<PostCardSkeleton key={key} />
									))}
								</div>
							) : latestFeedQuery.isError ? (
								<InlineStateCard
									title="Filtered posts could not be loaded"
									description={getErrorMessage(latestFeedQuery.error)}
									actionLabel="Retry"
									onAction={() => latestFeedQuery.refetch()}
								/>
							) : latestPosts.length === 0 ? (
								<InlineStateCard
									title="No posts matched the current filters"
									description="Try another keyword, category, or sort option. The current filter set returned zero posts."
								/>
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
											<div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-2">
												{getSkeletonKeys("feed-next-page", 2).map((key) => (
													<PostCardSkeleton key={key} />
												))}
											</div>
										) : latestFeedQuery.hasNextPage ? (
											<div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
												Kéo xuống để xem thêm bài viết
											</div>
										) : (
											<div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
												Bạn đã xem hết bài viết rồi
											</div>
										)}
									</div>
								</>
							)}
						</section>

						<section className="space-y-4">
							<div>
								<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
									Các chủ đề phổ biến
								</p>
								<h2 className="text-2xl font-black text-slate-950">
									Đọc theo chủ đề bạn quan tâm
								</h2>
							</div>
							{categoriesQuery.isLoading ? (
								<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
									{getSkeletonKeys("category-card", 6).map((key) => (
										<CategoryCardSkeleton key={key} />
									))}
								</div>
							) : categoriesQuery.isError ? (
								<InlineStateCard
									title="Categories could not be loaded"
									description={getErrorMessage(categoriesQuery.error)}
									actionLabel="Retry"
									onAction={() => categoriesQuery.refetch()}
								/>
							) : (
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
												{formatCompactNumber(category.postsCount ?? 0)} bài viết
											</p>
										</button>
									))}
								</div>
							)}
						</section>

						<section className="space-y-4">
							<div>
								<p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
									Tâm điểm kiến thức
								</p>
								<h2 className="text-2xl font-black text-slate-950">
									Bài viết được đề xuất cho bạn
								</h2>
							</div>
							{recommendedQuery.isLoading ? (
								<div className="grid gap-4 md:grid-cols-2">
									{getSkeletonKeys("recommended-post", 4).map((key) => (
										<PostCardSkeleton key={key} />
									))}
								</div>
							) : recommendedQuery.isError ? (
								<InlineStateCard
									title="Recommended posts could not be loaded"
									description={getErrorMessage(recommendedQuery.error)}
									actionLabel="Retry"
									onAction={() => recommendedQuery.refetch()}
								/>
							) : (
								<div className="grid gap-4 md:grid-cols-2">
									{recommendedPosts.map((post) => (
										<ContentPostCard
											key={post.id}
											post={post}
											onOpenPost={openPost}
										/>
									))}
								</div>
							)}
						</section>
					</div>

					<aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
						{featuredQuery.isLoading ? (
							<SidebarListSkeleton />
						) : (
							<SidebarList
								title="Bài viết nổi bật"
								icon={<Sparkles className="h-4 w-4 text-amber-500" />}
								posts={featuredPosts}
								onOpenPost={openPost}
							/>
						)}
						{sidebarMostViewedQuery.isLoading ? (
							<SidebarListSkeleton />
						) : (
							<SidebarList
								title="Được xem nhiều"
								icon={<Eye className="h-4 w-4 text-blue-500" />}
								posts={mostViewedPosts}
								onOpenPost={openPost}
							/>
						)}
						{sidebarLatestQuery.isLoading ? (
							<SidebarListSkeleton />
						) : (
							<SidebarList
								title="Mới cập nhật"
								icon={<Clock3 className="h-4 w-4 text-emerald-500" />}
								posts={latestCompactPosts}
								onOpenPost={openPost}
							/>
						)}

						<section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
							<div className="mb-4 flex items-center gap-2 text-slate-900">
								<Tag className="h-4 w-4 text-rose-500" />
								<h3 className="text-sm font-black uppercase tracking-[0.2em]">
									Từ khóa phổ biến
								</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{popularTagsQuery.isLoading
									? getSkeletonKeys("sidebar-tag-chip", 10).map((key) => (
											<FilterChipSkeleton key={key} />
										))
									: popularTags.map((tag) => (
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
