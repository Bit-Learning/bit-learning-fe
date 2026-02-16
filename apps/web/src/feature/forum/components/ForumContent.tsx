import React, { useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { useForumPosts } from "../queries/useForum";
import { useSelector } from "react-redux";
import { selectForumPosts, selectForumLoading, selectForumPagination } from "../stores/forum.store";
import { PlusCircle, Loader2 } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import ForumSidebar from "./ForumSidebar";
import PostCard from "./PostCard";

const ForumContent: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const posts = useSelector(selectForumPosts);
  const isLoading = useSelector(selectForumLoading);
  const pagination = useSelector(selectForumPagination);

  useForumPosts({ page: currentPage, size: 10 });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                💬 Diễn đàn
              </h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <ForumSidebar />
            </div>
          </aside>

          <main className="lg:col-span-9">
            {isLoading ? (
              <Card className="p-20">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                  <p className="text-gray-500">Đang tải bài viết...</p>
                </div>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <CardContent>
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài viết nào</h3>
                  <p className="text-gray-600 mb-6">Hãy là người đầu tiên chia sẻ kiến thức của bạn!</p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <PlusCircle size={18} className="mr-2" />
                    Tạo bài viết đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <Card className="mt-8">
                    <CardContent className="py-4">
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
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default ForumContent;
