import React, { useState } from "react";
import { useGetPosts } from "../queries/usePost";
import { PostCard } from "../components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const PostListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, isError } = useGetPosts(page, size);

  const filteredPosts = data?.content.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && post.isBanned) ||
      (statusFilter === "active" && !post.isBanned);
    return matchesSearch && matchesStatus;
  });

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Đã xảy ra lỗi khi tải danh sách bài viết</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý bài viết</h1>
          <p className="text-muted-foreground">Xem xét và kiểm duyệt các bài viết trong hệ thống</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="banned">Bị khóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPosts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {filteredPosts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy bài viết nào</p>
            </div>
          )}

          {data && data.page && data.page.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={data.page.first} onClick={() => setPage(page - 1)}>
                Trang trước
              </Button>
              <span className="flex items-center px-4">
                Trang {data.page.page + 1} / {data.page.totalPages}
              </span>
              <Button variant="outline" disabled={data.page.last} onClick={() => setPage(page + 1)}>
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
