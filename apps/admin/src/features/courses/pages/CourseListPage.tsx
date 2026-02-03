import React, { useState } from "react";
import { useGetCourses } from "../queries/useCourse";
import { CourseCard } from "../components/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const CourseListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const { data, isLoading, isError } = useGetCourses(page, size);

  const filteredCourses = data?.content.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Đã xảy ra lỗi khi tải danh sách khóa học</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý khóa học</h1>
        <p className="text-muted-foreground">Xem xét và quản lý tất cả các khóa học trong hệ thống</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Lọc theo cấp độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp độ</SelectItem>
            <SelectItem value="BEGINNER">Cơ bản</SelectItem>
            <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
            <SelectItem value="ADVANCED">Nâng cao</SelectItem>
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
            {filteredCourses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filteredCourses?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy khóa học nào</p>
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
