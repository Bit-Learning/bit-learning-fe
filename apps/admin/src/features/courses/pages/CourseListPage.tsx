import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Edit, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteCourse, useGetCourses, useHideOrShowCourse } from "../queries/useCourse";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { CoursePreview } from "../types/course.type";
import { Pagination } from "@/components/Pagination";

export const CourseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number;
    name: string;
  }>({
    isOpen: false,
    id: 0,
    name: "",
  });

  const { data: coursesData, isLoading } = useGetCourses(page, size);
  const deleteMutation = useDeleteCourse();
  const hideMutation = useHideOrShowCourse();

  const courses = Array.isArray(coursesData?.data) ? coursesData.data : [];
  const totalPages = coursesData?.page?.totalPages || 0;

  const openDeleteModal = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: 0, name: "" });
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deleteModal.id, {
      onSuccess: () => closeDeleteModal(),
    });
  };

  const handleToggleHide = (id: number, isHidden: boolean) => {
    hideMutation.mutate({ id, isHidden: !isHidden });
  };

  const filteredCourses = courses.filter((course: { title: string }) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Khóa học của tôi</h1>
          <p className="mt-1 text-gray-600">Quản lý và chỉnh sửa các khóa học</p>
        </div>
        <Button size="lg" onClick={() => navigate({ to: "/courses/create" })}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo khóa học mới
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">Chưa có khóa học nào</h3>
          <p className="mb-6 text-gray-600">Hãy tạo khóa học đầu tiên của bạn</p>
          <Button size="lg" onClick={() => navigate({ to: "/courses/create" })}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo khóa học mới
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course: CoursePreview) => (
              <Card key={course.id} className="overflow-hidden p-0 transition-shadow hover:shadow-lg">
                <div className="relative flex aspect-video items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-16 w-16 text-white/50" />
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="line-clamp-2 h-14 text-lg font-semibold">{course.title}</h3>
                    </div>
                    {course.status && (
                      <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"} className="shrink-0">
                        {course.status === "PUBLISHED" ? "Đã xuất bản" : "Chưa xuất bản"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Lớp {course.grade}</span>
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-blue-600">
                    {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} ₫`}
                  </div>

                  <div className="flex items-center gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate({ to: "/courses/$id", params: { id: String(course.id) } })}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Chi tiết
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleToggleHide(course.id, course.isDeleted)}>
                      {course.isDeleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteModal(course.id, course.title)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      <DeleteConfirmModal
        open={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Xóa khóa học"
        description="Tất cả chương và bài học trong khóa học này cũng sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!"
        itemName={deleteModal.name}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};
