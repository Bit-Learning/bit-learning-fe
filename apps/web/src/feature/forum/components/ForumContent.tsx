import React, { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Textarea } from "@workspace/ui/components/Textarea";
import { useSelector } from "react-redux";
import { useForumPosts, useLikeForumPost, useDislikeForumPost } from "../queries/useForum";
import { selectForumPosts, selectForumPagination } from "../stores/forum.store";
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

  const posts = useSelector(selectForumPosts);
  const pagination = useSelector(selectForumPagination);

  useForumPosts({ page, size: 10 });
  const likeMutation = useLikeForumPost();
  const dislikeMutation = useDislikeForumPost();

  const { userInfo } = useSelector(selectAuthStateInfo);

  return (
    <div className="pt-20 flex justify-center min-h-screen">
      <div className="fixed top-20 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40">
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-8 h-full">
            <Button
              variant="ghost"
              className="text-blue-600 font-bold border-b-2 border-blue-600 h-full px-1 rounded-none hover:bg-transparent"
            >
              Tất cả bài viết
            </Button>
            <Button
              variant="ghost"
              className="text-gray-500 font-medium hover:text-blue-600 h-full px-1 rounded-none hover:bg-transparent"
              onClick={() => navigate({ to: "/forum/my" })}
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
      <div className="max-w-5xl w-full px-6 py-8">
        <main className="w-full flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bảng tin cộng đồng</h1>
              <p className="text-gray-500 text-sm mt-1">Khám phá các thảo luận mới nhất từ các học viên</p>
            </div>
            <div className="flex gap-2">
              <Button
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all border ${
                  activeFilter === "newest"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveFilter("newest")}
              >
                Mới nhất
              </Button>
              <Button
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all border ${
                  activeFilter === "popular"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveFilter("popular")}
              >
                Phổ biến
              </Button>
            </div>
          </div>

          <Card className="border-gray-200 hover:border-blue-600/30">
            <CardContent className="p-5">
              <div className="flex gap-4">
                {userInfo && <AuthorAvatar author={userInfo} size="md" />}
                <Textarea
                  className="flex-1 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600/30 resize-none placeholder:text-gray-400 rounded-xl p-3.5"
                  placeholder="Bạn muốn chia sẻ điều gì với cộng đồng bit learning?"
                  rows={1}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <Button className="bg-gray-100 text-gray-400 p-2.5 rounded-xl self-center hover:bg-blue-600 hover:text-white">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8 pb-20">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={(id) => likeMutation.mutate(id)}
                onDislike={(id) => dislikeMutation.mutate(id)}
                onViewDetails={(id) => navigate({ to: "/forum/post/$id", params: { id: String(id) } })}
              />
            ))}

            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ForumContent;
