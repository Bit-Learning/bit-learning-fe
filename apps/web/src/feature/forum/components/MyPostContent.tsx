import React, { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2, Eye, AlertCircle, FileText, CheckCircle, Lock } from "lucide-react";
import { useSelector } from "react-redux";
import { useForumPostsByAuthor, useDeleteForumPost } from "../queries/useForum";
import { selectForumMyPosts } from "../stores/forum.store";
import type { Post } from "../types/forum.type";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";
import { PostRow } from "./PostRow";
import { Button } from "@workspace/ui/components/Button";

type TabType = "all" | "published" | "locked";

const MyPostContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const { userInfo } = useSelector(selectAuthStateInfo);
  const authorId = userInfo?.id || 1;

  const posts = useSelector(selectForumMyPosts);
  const { data } = useForumPostsByAuthor({ authorId, page, size: 10 });
  const deletePostMutation = useDeleteForumPost();

  const pagination = data?.page;

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTab === "published") result = result.filter((p) => !p.isBanned);
    if (activeTab === "locked") result = result.filter((p) => p.isBanned);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return result;
  }, [posts, activeTab, searchQuery]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => !p.isBanned).length,
      locked: posts.filter((p) => p.isBanned).length,
    }),
    [posts],
  );

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const days = Math.floor(diffInHours / 24);
    if (days < 30) return `${days} ngày trước`;
    return postDate.toLocaleDateString("vi-VN");
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Tất cả", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "published", label: "Đã đăng", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { key: "locked", label: "Bị khóa", icon: <Lock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="fixed top-20 left-0 right-0 h-12 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 h-full">
            <button
              className="cursor-pointer h-full px-4 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
              onClick={() => navigate({ to: "/forum" })}
            >
              Tất cả bài viết
            </button>
            <button className="cursor-pointer relative h-full px-4 text-sm font-semibold text-blue-600">
              Bài viết của tôi
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            </button>
          </div>
          <button
            className="cursor-pointer flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => navigate({ to: "/forum/create" })}
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo bài viết
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-15 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✍️</span>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bài viết của tôi</h1>
            </div>
            <p className="text-gray-500 text-sm">Quản lý và theo dõi nội dung bạn đã chia sẻ</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(key)}
            >
              {icon}
              {label}
              <span
                className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
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
            filteredPosts.map((post) => (
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
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostContent;
