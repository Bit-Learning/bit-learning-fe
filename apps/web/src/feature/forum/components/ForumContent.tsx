import React, { useState, useRef, useMemo } from "react";
import {
  Plus,
  Send,
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
} from "lucide-react";
import { useSelector } from "react-redux";
import { useForumPosts, useLikeForumPost, useDislikeForumPost } from "../queries/useForum";
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
  const MS = { today: 86_400_000, week: 7 * 86_400_000, month: 30 * 86_400_000 } as const;
  return posts.filter((p) => now - new Date(p.createdAt).getTime() < MS[time]);
}

function sortPosts(posts: Post[], sort: SortKey): Post[] {
  if (sort === "popular") return [...posts].sort((a, b) => b.likes - a.likes);
  return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  const [newPost, setNewPost] = useState("");
  const [page, setPage] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allPosts = useSelector(selectForumPosts);
  const { userInfo } = useSelector(selectAuthStateInfo);
  const { data } = useForumPosts({ page, size: 10 });
  const likeMutation = useLikeForumPost();
  const dislikeMutation = useDislikeForumPost();

  const pagination = data?.page;

  const displayPosts = useMemo(() => sortPosts(filterByTime(allPosts, time), sort), [allPosts, sort, time]);

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-350 mx-auto px-4 py-8 flex gap-5 items-start">
        <aside className="w-64 shrink-0 sticky top-8 self-start space-y-3">
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
            <div className="px-3 py-3 space-y-0.5">
              <button className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 transition-all text-left">
                <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Flame className="w-3.5 h-3.5 text-white" />
                </span>
                Bảng tin
              </button>

              <button
                className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all text-left"
                onClick={() => navigate({ to: "/forum/my" })}
              >
                <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <PenSquare className="w-3.5 h-3.5 text-gray-500" />
                </span>
                Bài viết của tôi
              </button>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest  text-gray-900">DIỄN ĐÀN</h3>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed mb-4">
              Không gian để trao đổi kiến thức, đặt câu hỏi và chia sẻ kinh nghiệm lập trình một cách chuyên nghiệp.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                <span className="text-xs text-gray-700">Đặt câu hỏi rõ ràng, có ngữ cảnh</span>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-xs text-gray-700">Tôn trọng & hỗ trợ lẫn nhau</span>
              </div>

              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                <span className="text-xs text-gray-700">Chia sẻ kinh nghiệm thực tế</span>
              </div>
            </div>

            <button
              onClick={() => navigate({ to: "/forum/create" })}
              className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-semibold bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PenLine className="w-3.5 h-3.5" />
              Đăng bài ngay
            </button>

            <p className="text-sm font-bold uppercase tracking-widest text-gray-800 mt-4 mb-3 border-t pt-2">
              Thống kê
            </p>
            <div className="space-y-2">
              {[
                { label: "Tổng bài viết", value: pagination?.totalElements ?? allPosts.length, color: "text-gray-900" },
                { label: "Tháng này", value: filterByTime(allPosts, "month").length, color: "text-blue-600" },
                { label: "Tuần này", value: filterByTime(allPosts, "week").length, color: "text-blue-600" },
                { label: "Hôm nay", value: filterByTime(allPosts, "today").length, color: "text-green-600" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            {trendingTags.length > 0 && (
              <div className="mt-4 border-t pt-2 ">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-800">Thẻ phổ biến</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trendingTags.map(({ name, count }) => (
                    <button
                      key={name}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f5] text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Hash className="w-3 h-3" />
                      {name}
                      <span className="text-[10px] text-gray-400 ml-0.5">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <div
            className={`bg-white rounded-md border transition-all shadow-sm overflow-hidden ${
              isFocused ? "border-blue-400 shadow-md" : "border-gray-400"
            }`}
          >
            <div className="p-4 flex gap-3 items-start">
              {userInfo && <AuthorAvatar author={userInfo} size="sm" />}
              <textarea
                ref={textareaRef}
                className="flex-1 bg-[#f0f2f5] rounded-xl px-4 py-2.5 outline-none resize-none placeholder:text-gray-400 text-sm leading-relaxed"
                placeholder="Bạn muốn chia sẻ điều gì với cộng đồng?"
                rows={isFocused ? 4 : 1}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => !newPost && setIsFocused(false)}
              />
            </div>
            {isFocused && (
              <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-gray-100">
                <p className="text-xs text-gray-400">Markdown được hỗ trợ</p>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium"
                    onClick={() => {
                      setNewPost("");
                      setIsFocused(false);
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className={`flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg font-semibold transition-all ${
                      newPost.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!newPost.trim()}
                    onClick={() => navigate({ to: "/forum/create" })}
                  >
                    <Send className="w-3 h-3" />
                    Đăng bài
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-md border border-slate-200 shadow-sm px-4 py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => {
                  setSort("newest");
                  setPage(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === "newest" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mới nhất
              </button>
              <button
                onClick={() => {
                  setSort("popular");
                  setPage(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === "popular" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Phổ biến
              </button>
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400 mr-0.5" />
              {TIME_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setTime(key);
                    setPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    time === key
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="ml-auto text-xs text-gray-400">{displayPosts.length} bài viết</span>
          </div>

          <div className="space-y-3">
            {displayPosts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-md border border-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold text-gray-500">Không có bài viết nào</p>
                <p className="text-sm mt-1 text-gray-400">Thử đổi bộ lọc hoặc là người đầu tiên chia sẻ!</p>
              </div>
            ) : (
              displayPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(id) => likeMutation.mutate(id)}
                  onDislike={(id) => dislikeMutation.mutate(id)}
                  onViewDetails={(id) => navigate({ to: "/forum/post/$id", params: { id: String(id) } })}
                />
              ))
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumContent;
