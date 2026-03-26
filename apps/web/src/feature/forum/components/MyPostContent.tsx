import React, { useState, useMemo } from "react";
import { Plus, Search, FileText, CheckCircle, Lock, PenSquare, Flame, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useForumPostsByAuthor, useDeleteForumPost } from "../queries/useForum";
import { selectForumMyPosts } from "../stores/forum.store";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";
import { PostRow } from "./PostRow";

type TabType = "all" | "published" | "locked";

function formatDate(date: string): string {
  const diffH = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (diffH < 1) return "Vừa xong";
  if (diffH < 24) return `${diffH} giờ trước`;
  const days = Math.floor(diffH / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString("vi-VN");
}

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "Tất cả", icon: <FileText className="w-3.5 h-3.5" /> },
  { key: "published", label: "Đã đăng", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { key: "locked", label: "Bị khóa", icon: <Lock className="w-3.5 h-3.5" /> },
];

const MyPostContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const { userInfo } = useSelector(selectAuthStateInfo);
  const authorId = userInfo?.id || 1;

  const allPosts = useSelector(selectForumMyPosts);
  const { data } = useForumPostsByAuthor({ authorId, page, size: 10 });
  const deletePostMutation = useDeleteForumPost();
  const pagination = data?.page;

  const counts = useMemo(
    () => ({
      all: allPosts.length,
      published: allPosts.filter((p) => !p.isBanned).length,
      locked: allPosts.filter((p) => p.isBanned).length,
    }),
    [allPosts],
  );

  const displayPosts = useMemo(() => {
    let result = allPosts;
    if (activeTab === "published") result = result.filter((p) => !p.isBanned);
    if (activeTab === "locked") result = result.filter((p) => p.isBanned);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return result;
  }, [allPosts, activeTab, searchQuery]);

  const topPost = useMemo(
    () => (allPosts.length > 0 ? [...allPosts].sort((a, b) => b.likes - a.likes)[0] : null),
    [allPosts],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-350 mx-auto px-4 py-8 flex gap-5 items-start">
        <aside className="w-64 shrink-0 sticky top-8 self-start space-y-3">
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-3 space-y-0.5">
              <button
                className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all text-left"
                onClick={() => navigate({ to: "/forum" })}
              >
                <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Flame className="w-3.5 h-3.5 text-gray-500" />
                </span>
                Bảng tin
              </button>
              <button className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 transition-all text-left">
                <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <PenSquare className="w-3.5 h-3.5 text-white" />
                </span>
                Bài viết của tôi
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="bg-white rounded-md border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-gray-900">Bài viết của tôi</h1>
              <p className="text-xs text-gray-400 mt-0.5">Quản lý nội dung bạn đã chia sẻ</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                className="pl-9 pr-4 py-2 bg-[#f0f2f5] rounded-xl text-sm w-48 outline-none focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-gray-400"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 shadow-sm px-4 py-2.5 flex items-center gap-1">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setPage(0);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {icon}
                {label}
                <span
                  className={`ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {displayPosts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-md border border-gray-400">
                <div className="text-4xl mb-3">{activeTab === "locked" ? "🔒" : searchQuery ? "🔍" : "📝"}</div>
                <p className="font-semibold text-gray-500">
                  {activeTab === "locked"
                    ? "Không có bài viết bị khóa"
                    : searchQuery
                      ? `Không tìm thấy "${searchQuery}"`
                      : "Bạn chưa có bài viết nào"}
                </p>
                {!searchQuery && activeTab === "all" && (
                  <button
                    className="mt-4 text-sm text-blue-600 font-semibold hover:underline"
                    onClick={() => navigate({ to: "/forum/create" })}
                  >
                    Tạo bài viết đầu tiên →
                  </button>
                )}
              </div>
            ) : (
              displayPosts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  formatDate={formatDate}
                  onEdit={() => navigate({ to: "/forum/$id/edit", params: { id: String(post.id) } })}
                  onDelete={() => deletePostMutation.mutate(post.id)}
                  onView={() => navigate({ to: "/forum/post/$id", params: { id: String(post.id) } })}
                />
              ))
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        <aside className="w-64 shrink-0 sticky top-8 self-start space-y-3">
          <button
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-md text-sm font-bold transition-colors shadow-sm shadow-blue-200"
            onClick={() => navigate({ to: "/forum/create" })}
          >
            <Plus className="w-4 h-4" />
            Tạo bài viết mới
          </button>

          <div className="bg-white rounded-md border border-slate-200 shadow-sm px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Của tôi</p>
            <div className="space-y-2">
              {[
                { label: "Tổng bài viết", value: counts.all, color: "text-gray-900" },
                { label: "Đã đăng", value: counts.published, color: "text-green-600" },
                { label: "Bị khóa", value: counts.locked, color: counts.locked > 0 ? "text-red-500" : "text-gray-400" },
                { label: "Lượt thích", value: allPosts.reduce((s, p) => s + p.likes, 0), color: "text-blue-600" },
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
          </div>

          {topPost && (
            <div className="bg-white rounded-md border border-slate-200 shadow-sm px-4 py-4">
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Bài viết nổi bật</p>
              </div>
              <button
                className="w-full text-left group"
                onClick={() => navigate({ to: "/forum/post/$id", params: { id: String(topPost.id) } })}
              >
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                  {topPost.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>👍 {topPost.likes}</span>
                  <span>{formatDate(topPost.createdAt)}</span>
                </div>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MyPostContent;
