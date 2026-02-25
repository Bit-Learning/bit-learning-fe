import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { Input } from "@workspace/ui/components/Input";
import { useSelector } from "react-redux";
import { useForumPostsByAuthor, useDeleteForumPost } from "../queries/useForum";
import { selectForumPosts, selectForumPagination } from "../stores/forum.store";
import type { Post } from "../types/forum.type";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";

const MyPostContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "locked">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const { userInfo } = useSelector(selectAuthStateInfo);
  const authorId = userInfo?.id || 1;
  const posts = useSelector(selectForumPosts);
  const pagination = useSelector(selectForumPagination);

  useForumPostsByAuthor({ authorId: authorId, page, size: 10 });

  const deletePostMutation = useDeleteForumPost();

  const getStatusBadge = (post: Post) => {
    if (post.isBanned) {
      return <Badge className="bg-red-50 text-red-600 uppercase tracking-wide text-[11px] font-bold">Bị khóa</Badge>;
    }
    return <Badge className="bg-green-50 text-green-600 uppercase tracking-wide text-[11px] font-bold">Đã đăng</Badge>;
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  return (
    <main className="pt-12 pb-20">
      <div className="fixed top-20 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40">
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-8 h-full">
            <Button
              variant="ghost"
              className="text-gray-500 font-medium hover:text-blue-600 h-full px-1 rounded-none hover:bg-transparent"
              onClick={() => navigate({ to: "/forum" })}
            >
              Tất cả bài viết
            </Button>
            <Button
              variant="ghost"
              className="text-blue-600 font-bold border-b-2 border-blue-600 h-full px-1 rounded-none hover:bg-transparent"
            >
              Bài viết của tôi
            </Button>
          </div>
          <Button
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-sm"
            onClick={() => navigate({ to: "/forum/create" })}
          >
            <Plus className="w-4 h-4" />
            Tạo bài viết
          </Button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bài viết của tôi</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các nội dung bạn đã chia sẻ trên diễn đàn</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg text-sm w-64"
                placeholder="Tìm trong bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8 border-b border-gray-100">
          {(["all", "published", "draft", "locked"] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              className={`pb-4 text-sm font-bold border-b-2 px-2 rounded-none ${
                activeTab === tab
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" && "Tất cả"}
              {tab === "published" && "Đã đăng"}
              {tab === "draft" && "Bản nháp"}
              {tab === "locked" && "Bị khóa"}
            </Button>
          ))}
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`border-gray-200 transition-all ${post.isBanned ? "opacity-80 bg-gray-50/50" : "hover:border-blue-200"} group`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-6">
                  {post.attachments.length > 0 && post.attachments[0] && post.attachments[0].type === "IMAGE" ? (
                    <div
                      className="w-full md:w-56 h-36 shrink-0 rounded-lg bg-cover bg-center overflow-hidden"
                      style={{ backgroundImage: `url(${post.attachments[0].url})` }}
                    />
                  ) : (
                    <div className="w-full md:w-56 h-36 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                      <span className="text-gray-300 text-4xl">📄</span>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(post)}
                        {!post.isBanned && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:bg-gray-50 hover:text-blue-600"
                              aria-label="Chỉnh sửa"
                              onClick={() => navigate({ to: "/forum/$id/edit", params: { id: String(post.id) } })}
                            >
                              <Edit className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:bg-red-50 hover:text-red-500"
                              aria-label="Xóa"
                              onClick={() => deletePostMutation.mutate(post.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <h3
                        className={`text-xl font-bold mb-2 transition-colors cursor-pointer leading-tight ${
                          post.isBanned ? "text-gray-400 line-through" : "text-gray-800 group-hover:text-blue-700"
                        }`}
                        onClick={() =>
                          !post.isBanned && navigate({ to: "/forum/post/$id", params: { id: String(post.id) } })
                        }
                      >
                        {post.title}
                      </h3>
                      <p className={`text-sm line-clamp-2 ${post.isBanned ? "text-gray-400" : "text-gray-500"}`}>
                        {post.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-2">
                      <div className="flex items-center gap-6 text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">{post.likes + post.dislikes}</span>
                        </div>
                        {!post.isBanned && (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium">👍 {post.likes}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {post.isBanned
                          ? `Bị khóa ${formatDate(post.updatedAt)}`
                          : `Đã đăng ${formatDate(post.createdAt)}`}
                      </span>
                    </div>
                    {post.isBanned && (
                      <div className="flex items-center gap-2 text-red-500 pt-4 border-t border-gray-100 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Vi phạm tiêu chuẩn cộng đồng</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>
    </main>
  );
};

export default MyPostContent;
