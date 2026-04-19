import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { toast } from "@/shared/components/Sonner";
import { getAccessToken } from "@/shared/lib/cookies";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Input } from "@workspace/ui/components/Input";
import {
	BookOpen,
	Clock3,
	Compass,
	Eye,
	Flame,
	PenSquare,
	Search,
	ShieldQuestion,
	Sparkles,
	Tag,
	TrendingUp,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
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
import type { ForumCategory, Tag as ForumTag, Post } from "../types/forum.type";
import {
	formatCompactNumber,
	getErrorMessage,
	getSkeletonKeys,
	updateSearchState,
} from "../utils/forum.utils";
import { ForumSubscribeCard } from "./card/ForumSubscribeCard";
import { InlineStateCard } from "./card/InlineStateCard";
import { ContentPostCard } from "./ContentPostCard";
import { FeaturedHero } from "./FeaturedHero";
import { SidebarList } from "./SidebarList";
import { CategoryCardSkeleton } from "./skeleton/CategoryCardSkeleton";
import { FeaturedHeroSkeleton } from "./skeleton/FeaturedHeroSkeleton";
import { FilterChipSkeleton } from "./skeleton/FilterChipSkeleton";
import { PostCardSkeleton } from "./skeleton/PostCardSkeleton";
import { SidebarListSkeleton } from "./skeleton/SidebarListSkeleton";

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	"layout-grid": <Compass className="h-4 w-4" />,
	server: <ShieldQuestion className="h-4 w-4" />,
	monitor: <Sparkles className="h-4 w-4" />,
	rocket: <TrendingUp className="h-4 w-4" />,
	sparkles: <Flame className="h-4 w-4" />,
	briefcase: <BookOpen className="h-4 w-4" />,
};

const ForumContent: React.FC = () => {
	const navigate = useNavigate();
	const { userInfo } = useSelector(selectAuthStateInfo);
	const isAuthenticated = Boolean(getAccessToken());
	const canLoadRecommended = isAuthenticated;
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
	const recommendedQuery = useRecommendedForumPosts(6, canLoadRecommended);
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

							<div className="flex flex-wrap items-center gap-3">
								{isAuthenticated ? (
									<button
										type="button"
										onClick={() => navigate({ to: "/forum/create" })}
										className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
									>
										<PenSquare className="h-4 w-4" />
										Tạo bài viết
									</button>
								) : null}
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
										Tất cả danh mục
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
							{!canLoadRecommended ? (
								<InlineStateCard
									title="Đăng nhập để xem bài viết được đề xuất"
									description="Danh sách này được cá nhân hóa theo hoạt động học tập của bạn. Bạn vẫn có thể đọc toàn bộ bài viết công khai ở các mục bên trên."
									actionLabel="Đăng nhập"
									onAction={() => navigate({ to: "/signin-role" })}
								/>
							) : recommendedQuery.isLoading ? (
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
