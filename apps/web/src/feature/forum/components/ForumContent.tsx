import React, { useState, useRef } from "react";
import { Plus, Send, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useForumPosts, useLikeForumPost, useDislikeForumPost } from "../queries/useForum";
import { selectForumPosts } from "../stores/forum.store";
import { PostCard } from "./PostCard";
import { AuthorAvatar } from "./AuthorAvatar";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";

const ForumContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<"newest" | "popular">("newest");
  const [newPost, setNewPost] = useState("");
  const [page, setPage] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const posts = useSelector(selectForumPosts);
  const { userInfo } = useSelector(selectAuthStateInfo);
  const { data } = useForumPosts({ page, size: 10 });
  const likeMutation = useLikeForumPost();
  const dislikeMutation = useDislikeForumPost();

  const pagination = data?.page;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="fixed top-20 left-0 right-0 h-12 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 h-full">
            <button className="cursor-pointer relative h-full px-4 text-sm font-semibold text-blue-600">
              Tất cả bài viết
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            </button>
            <button
              className=" cursor-pointer h-full px-4 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
              onClick={() => navigate({ to: "/forum/my" })}
            >
              Bài viết của tôi
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🌐</span>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bảng tin cộng đồng</h1>
            </div>
            <p className="text-gray-500 text-sm">Khám phá các thảo luận mới nhất từ các học viên</p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === "newest" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => {
                setActiveFilter("newest");
                setPage(0);
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mới nhất
            </button>
            <button
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === "popular" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => {
                setActiveFilter("popular");
                setPage(0);
              }}
            >
              <Flame className="w-3.5 h-3.5" />
              Phổ biến
            </button>
          </div>
        </div>

        <div
          className={`bg-white rounded-2xl border transition-all mb-8 shadow-sm overflow-hidden ${
            isFocused ? "border-blue-400 shadow-blue-100 shadow-md" : "border-gray-200"
          }`}
        >
          <div className="p-4 flex gap-3">
            {userInfo && <AuthorAvatar author={userInfo} size="sm" />}
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent border-none outline-none resize-none placeholder:text-gray-400 text-sm leading-relaxed"
              placeholder="Bạn muốn chia sẻ điều gì với cộng đồng bit learning?"
              rows={isFocused ? 3 : 1}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => !newPost && setIsFocused(false)}
            />
          </div>
          {isFocused && (
            <div className="px-4 pb-3 pt-3 flex items-center justify-between border-t border-gray-100">
              <p className="text-xs text-gray-400">Markdown được hỗ trợ</p>
              <div className="flex gap-2">
                <button
                  className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium transition-colors"
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
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
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

        {pagination && (
          <div className="flex items-center gap-2 mb-5 text-xs text-gray-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {pagination.totalElements ?? posts.length} bài viết · Trang {page + 1}/{pagination.totalPages}
            </span>
          </div>
        )}

        <div className="space-y-5">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium">Chưa có bài viết nào</p>
              <p className="text-sm mt-1">Hãy là người đầu tiên chia sẻ!</p>
            </div>
          ) : (
            posts.map((post) => (
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
          <div className="mt-10">
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumContent;
