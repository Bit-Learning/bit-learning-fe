import React, { useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { useForumPosts } from "../queries/useForum";
import { useSelector } from "react-redux";
import { selectForumPosts, selectForumLoading, selectForumPagination } from "../stores/forum.store";
import { PlusCircle, Search, Loader2, TrendingUp, Clock, MessageSquare, Eye } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import ForumSidebar from "./ForumSidebar";
import PostCard from "./PostCard";

const ForumContent: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState<"newest" | "popular" | "unanswered" | "following">("newest");

  const posts = useSelector(selectForumPosts);
  const isLoading = useSelector(selectForumLoading);
  const pagination = useSelector(selectForumPagination);

  useForumPosts({ page: currentPage, size: 10 });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filterButtons = [
    { id: "newest" as const, label: "Mới nhất", icon: Clock },
    { id: "popular" as const, label: "Phổ biến", icon: TrendingUp },
    { id: "unanswered" as const, label: "Chưa trả lời", icon: MessageSquare },
    { id: "following" as const, label: "Đang theo dõi", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                💬 Diễn đàn
              </h1>
              <div className="hidden md:flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>
              </div>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg hover:shadow-xl transition-shadow">
              <PlusCircle size={20} className="mr-2" />
              <span className="hidden sm:inline">Tạo bài viết</span>
              <span className="sm:hidden">Tạo</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <ForumSidebar />
            </div>
          </aside>

          <main className="lg:col-span-6">
            <Card className="mb-6 p-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {filterButtons.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.id}
                      variant={activeFilter === filter.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveFilter(filter.id)}
                      className="whitespace-nowrap"
                    >
                      <Icon size={16} className="mr-2" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </Card>

            {isLoading ? (
              <Card className="p-20">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                  <p className="text-gray-500">Đang tải bài viết...</p>
                </div>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-600 mb-6">Hãy là người đầu tiên chia sẻ kiến thức của bạn!</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <PlusCircle size={18} className="mr-2" />
                  Tạo bài viết đầu tiên
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
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
          </main>

          <aside className="hidden xl:block xl:col-span-3">
            <div className="sticky top-24 space-y-6">
              <Card className="bg-linear-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
                <div className="p-6">
                  <h3 className="font-bold mb-4 flex items-center">
                    <TrendingUp size={20} className="mr-2" />
                    Thống kê
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="opacity-90">Tổng bài viết</span>
                      <span className="font-bold text-lg">1,234</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="opacity-90">Thành viên</span>
                      <span className="font-bold text-lg">567</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <span className="opacity-90">Bình luận</span>
                      <span className="font-bold text-lg">8,901</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">💡 Mẹo hữu ích</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-blue-500 mr-2 shrink-0">✓</span>
                      <span>Sử dụng hashtag để bài viết dễ tìm kiếm hơn</span>
                    </li>
                    <li className="flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-blue-500 mr-2 shrink-0">✓</span>
                      <span>Đính kèm code/ảnh minh họa khi cần</span>
                    </li>
                    <li className="flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-blue-500 mr-2 shrink-0">✓</span>
                      <span>Tương tác tích cực với cộng đồng</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default ForumContent;
