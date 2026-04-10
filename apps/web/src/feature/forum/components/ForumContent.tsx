import React, { useState, useMemo } from "react";
import {
	Flame,
	Sparkles,
	Clock,
	TrendingUp,
	Hash,
	PenSquare,
	MessageCircle,
	ShieldCheck,
	Lightbulb,
	PenLine,
	Search,
	Inbox,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
	useForumPosts,
	useLikeForumPost,
	useDislikeForumPost,
} from "../queries/useForum";
import { selectForumPosts } from "../stores/forum.store";
import { PostCard } from "./PostCard";
import { AuthorAvatar } from "./AuthorAvatar";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";
import type { Post } from "../types/forum.type";

type SortKey = "newest" | "popular";
type TimeKey = "all" | "today" | "week" | "month";

function filterByTime(posts: Post[], time: TimeKey): Post[] {
	if (time === "all") return posts;
	const now = Date.now();
	const MS = {
		today: 86_400_000,
		week: 7 * 86_400_000,
		month: 30 * 86_400_000,
	} as const;
	return posts.filter((p) => now - new Date(p.createdAt).getTime() < MS[time]);
}

function sortPosts(posts: Post[], sort: SortKey): Post[] {
	if (sort === "popular") return [...posts].sort((a, b) => b.likes - a.likes);
	return [...posts].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

const TIME_OPTIONS: { key: TimeKey; label: string }[] = [
	{ key: "all", label: "Tất cả" },
	{ key: "today", label: "Hôm nay" },
	{ key: "week", label: "Tuần này" },
	{ key: "month", label: "Tháng này" },
];

const ForumContent: React.FC = () => {
	const navigate = useNavigate();
	const [sort, setSort] = useState<SortKey>("newest");
	const [time, setTime] = useState<TimeKey>("all");
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");

	const allPosts = useSelector(selectForumPosts);
	const { userInfo } = useSelector(selectAuthStateInfo);
	const { data } = useForumPosts({ page, size: 10 });
	const likeMutation = useLikeForumPost();
	const dislikeMutation = useDislikeForumPost();

	const pagination = data?.page;

	const displayPosts = useMemo(() => {
		let result = sortPosts(filterByTime(allPosts, time), sort);
		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(p) =>
					p.title.toLowerCase().includes(q) ||
					p.content.toLowerCase().includes(q) ||
					p.hashtags.some((t) => t.name.toLowerCase().includes(q)),
			);
		}
		return result;
	}, [allPosts, sort, time, search]);

	const trendingTags = useMemo(() => {
		const freq: Record<string, number> = {};
		allPosts.forEach((p) =>
			p.hashtags.forEach((t) => {
				freq[t.name] = (freq[t.name] ?? 0) + 1;
			}),
		);
		return Object.entries(freq)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8)
			.map(([name, count]) => ({ name, count }));
	}, [allPosts]);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* <div className="relative overflow-hidden h-60 md:h-72 flex items-end">
        <img src="./forum.jpg" alt="hero" className="absolute inset-0 w-full h-full object-cover" />
      </div> */}
			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<nav className="text-md text-gray-500 flex items-center">
						<span
							onClick={() => navigate({ to: "/" })}
							className="hover:text-gray-700 cursor-pointer transition-colors"
						>
							Trang chủ
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span className="text-gray-400 font-medium">Diễn đàn</span>
					</nav>
				</div>
			</div>
			<div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-4 items-start">
				{/* <aside className="w-64 shrink-0 sticky top-8 self-start space-y-3">
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-2 py-2 space-y-0.5">
              <button className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-md font-semibold text-primary bg-blue-50 text-left">
                <Flame className="w-4 h-4" />
                Bảng tin
              </button>
              <button
                className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-md font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                onClick={() => navigate({ to: "/forum/my" })}
              >
                <PenSquare className="w-4 h-4" />
                Bài viết của tôi
              </button>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Thống kê</p>
              <div className="space-y-1.5">
                {[
                  { label: "Tổng bài viết", value: pagination?.totalElements ?? allPosts.length },
                  { label: "Tháng này", value: filterByTime(allPosts, "month").length },
                  { label: "Tuần này", value: filterByTime(allPosts, "week").length },
                  { label: "Hôm nay", value: filterByTime(allPosts, "today").length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {trendingTags.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Thẻ phổ biến</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trendingTags.map(({ name, count }) => (
                    <button
                      key={name}
                      onClick={() => setSearch(name)}
                      className="cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-primary transition-colors"
                    >
                      <Hash className="w-3 h-3" />
                      <span className="truncate max-w-30">{name}</span>

                      <span className="text-gray-400">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Nội quy</p>
              {[
                {
                  icon: <MessageCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />,
                  text: "Đặt câu hỏi rõ ràng, có ngữ cảnh",
                },
                {
                  icon: <ShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />,
                  text: "Tôn trọng & hỗ trợ lẫn nhau",
                },
                {
                  icon: <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />,
                  text: "Chia sẻ kinh nghiệm thực tế",
                },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2">
                  {icon}
                  <span className="text-sm text-gray-500 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate({ to: "/forum/create" })}
              className="cursor-pointer w-full flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              <PenLine className="w-3.5 h-3.5" />
              Đăng bài
            </button>
          </div>
        </aside> */}

				<div className="flex-1 min-w-0 space-y-3">
					<div className="bg-white rounded-md border border-gray-200 overflow-hidden">
						<div
							className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
							onClick={() => navigate({ to: "/forum/create" })}
						>
							{userInfo && <AuthorAvatar author={userInfo} size="sm" />}
							<div className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-400">
								Bạn muốn chia sẻ điều gì?
							</div>
						</div>

						<div className="px-4 py-2.5 flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-1.5 flex-1 min-w-0">
								<Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
								<input
									type="text"
									placeholder="Tìm kiếm..."
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										setPage(0);
									}}
									className="text-sm text-gray-600 bg-transparent outline-none w-full placeholder:text-gray-400"
								/>
							</div>

							<div className="h-4 w-px bg-gray-200" />

							<div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
								<button
									onClick={() => {
										setSort("newest");
										setPage(0);
									}}
									className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${sort === "newest" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
								>
									<Sparkles className="w-3 h-3" />
									Mới nhất
								</button>
								<button
									onClick={() => {
										setSort("popular");
										setPage(0);
									}}
									className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${sort === "popular" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
								>
									<Flame className="w-3 h-3" />
									Phổ biến
								</button>
							</div>

							<div className="flex items-center gap-1">
								<Clock className="w-3.5 h-3.5 text-gray-400" />
								{TIME_OPTIONS.map(({ key, label }) => (
									<button
										key={key}
										onClick={() => {
											setTime(key);
											setPage(0);
										}}
										className={`cursor-pointer px-2.5 py-1.5 rounded-md text-sm font-semibold transition-all ${time === key ? "bg-blue-50 text-primary border border-blue-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
									>
										{label}
									</button>
								))}
							</div>

							<span className="ml-auto text-sm text-gray-400">
								{displayPosts.length} bài viết
							</span>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-4">
						{displayPosts.length === 0 ? (
							<div className="text-center py-20 bg-white rounded-md border border-gray-200">
								<Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
								<p className="text-sm font-semibold text-gray-500">
									Không có bài viết nào
								</p>
								<p className="text-sm mt-1 text-gray-400">
									Thử đổi bộ lọc hoặc là người đầu tiên chia sẻ!
								</p>
							</div>
						) : (
							displayPosts.map((post) => (
								<PostCard
									key={post.id}
									post={post}
									onLike={(id) => likeMutation.mutate(id)}
									onDislike={(id) => dislikeMutation.mutate(id)}
									onViewDetails={(id) =>
										navigate({
											to: "/forum/post/$id",
											params: { id: String(id) },
										})
									}
								/>
							))
						)}
					</div>

					{pagination && pagination.totalPages > 1 && (
						<div className="mt-4 flex items-center justify-center">
							<Pagination
								currentPage={page}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ForumContent;
