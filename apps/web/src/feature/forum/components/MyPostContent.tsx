import React, { useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { useForumPostsByAuthor } from "../queries/useForum";
import { useSelector } from "react-redux";
import { selectForumPosts, selectForumLoading, selectForumPagination } from "../stores/forum.store";
import { PlusCircle, Loader2, FileText, Calendar, Eye, Heart, Filter } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import PostCard from "./PostCard";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";

const MyPostContent: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "banned">("all");

  const { userInfo } = useSelector(selectAuthStateInfo);
  const authorId = userInfo?.id || 1;

  const posts = useSelector(selectForumPosts);
  const isLoading = useSelector(selectForumLoading);
  const pagination = useSelector(selectForumPagination);

  useForumPostsByAuthor({
    authorId,
    page: currentPage,
    size: 10,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredPosts = posts.filter((post) => {
    if (filterStatus === "banned") return post.isBanned;
    if (filterStatus === "published") return !post.isBanned;
    return true;
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => !p.isBanned).length,
    banned: posts.filter((p) => p.isBanned).length,
    totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                📝 Bài đăng của tôi
              </h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý và theo dõi các bài viết của bạn</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <PlusCircle size={20} className="mr-2" />
              <span className="hidden sm:inline">Tạo bài viết</span>
              <span className="sm:hidden">Tạo</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Tổng bài viết</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <FileText size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Đã xuất bản</p>
                  <p className="text-3xl font-bold">{stats.published}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Calendar size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">Bị ẩn</p>
                  <p className="text-3xl font-bold">{stats.banned}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Eye size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium mb-1">Tổng lượt thích</p>
                  <p className="text-3xl font-bold">{stats.totalLikes}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Heart size={24} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-6 p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant={filterStatus === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="whitespace-nowrap"
            >
              <Filter size={16} className="mr-2" />
              Tất cả ({stats.total})
            </Button>
            <Button
              variant={filterStatus === "published" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("published")}
              className="whitespace-nowrap"
            >
              <Calendar size={16} className="mr-2" />
              Đã xuất bản ({stats.published})
            </Button>
            <Button
              variant={filterStatus === "banned" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("banned")}
              className="whitespace-nowrap"
            >
              <Eye size={16} className="mr-2" />
              Bị ẩn ({stats.banned})
            </Button>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-20">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-gray-500">Đang tải bài viết...</p>
            </div>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterStatus === "all"
                ? "Chưa có bài viết nào"
                : filterStatus === "published"
                  ? "Chưa có bài viết đã xuất bản"
                  : "Không có bài viết bị ẩn"}
            </h3>
            <p className="text-gray-600 mb-6">{filterStatus === "all" && "Hãy tạo bài viết đầu tiên của bạn!"}</p>
            {filterStatus === "all" && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle size={18} className="mr-2" />
                Tạo bài viết đầu tiên
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative">
                {post.isBanned && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Bị ẩn
                    </span>
                  </div>
                )}
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <Card className="mt-8 p-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                isDisabled={currentPage === 0}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum = i;
                  if (pagination.totalPages > 5) {
                    if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                isDisabled={currentPage === pagination.totalPages - 1}
              >
                Sau
              </Button>
            </div>
          </Card>
        )}
      </div>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default MyPostContent;
