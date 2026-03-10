import { useNavigate, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { BookOpen, ChevronLeft, Play, Star } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useCourseActions, useCourseState, useCoursesByGrade, usePrefetchCourse } from "../queries/useCourse";
import type { CoursePreview } from "../types/course.type";

const CoursesByGradeComponent: React.FC = () => {
  const { grade } = useParams({ strict: false }) as { grade: string };
  const { selectGrade, changePage } = useCourseActions();
  const { prefetchCourseDetail } = usePrefetchCourse();
  const { pagination } = useCourseState();
  const navigate = useNavigate();

  useEffect(() => {
    selectGrade(Number(grade));
  }, [grade, selectGrade]);

  const { data, isLoading, error, isFetching } = useCoursesByGrade(Number(grade));

  const getGradeLevel = (grade: number) => {
    if (grade <= 5) return "Tiểu học";
    if (grade <= 9) return "THCS";
    return "THPT";
  };

  const getCourseLevelLabel = (level: string): string => {
    const levelMap: Record<string, string> = {
      BEGINNING: "Cơ bản",
      INTERMEDIATE: "Trung bình",
      ADVANCED: "Nâng cao",
    };
    return levelMap[level] || level;
  };

  const handleMouseEnter = (courseId: number) => {
    prefetchCourseDetail(courseId);
  };

  if (isLoading) {
    return (
      <div className="bg-linear-to-br min-h-screen from-gray-50 to-blue-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
              <p className="text-gray-600">Đang tải khóa học...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-linear-to-br min-h-screen from-gray-50 to-blue-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600">Lỗi: {(error as Error).message}</p>
            <button
              type="button"
              className="text-blue-700 hover:underline"
              onClick={() => navigate({ to: "/courses" })}
            >
              Quay lại trang khóa học
            </button>
          </div>
        </div>
      </div>
    );
  }

  const courses: CoursePreview[] = Array.isArray(data?.data) ? data.data : [];
  const totalElements = data?.page?.totalElements || 0;
  const totalPages = data?.page?.totalPages || 0;

  return (
    <div className="bg-linear-to-br min-h-screen from-gray-50 to-blue-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <button
            type="button"
            className="text-md mb-4 inline-flex items-center text-gray-600 transition-colors hover:text-blue-700"
            onClick={() => navigate({ to: "/courses" })}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Tất cả khóa học
          </button>

          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Khóa học Tin học Lớp {grade}</h1>
            <p className="text-lg text-gray-600">
              {getGradeLevel(Number(grade))} - {totalElements} khóa học
            </p>
          </div>
        </div>

        {isFetching && (
          <div className="mb-4 text-center">
            <span className="text-blue-700">Đang cập nhật...</span>
          </div>
        )}

        {courses ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Hiển thị <span className="font-semibold">{totalElements}</span> khóa học (Tổng: {totalElements})
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course: CoursePreview) => (
                <Card
                  key={course.id}
                  className="group cursor-pointer overflow-hidden gap-2 p-0 transition-all duration-300 hover:shadow-xl"
                  onMouseEnter={() => handleMouseEnter(course.id)}
                  onClick={() => navigate({ to: "/courses/$id", params: { id: String(course.id) } })}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="bg-linear-to-t absolute inset-0 from-black/60 to-transparent" />

                    <div className="absolute left-3 top-3">
                      <Badge className="bg-blue-700 text-xs text-white">Lớp {course.grade}</Badge>
                    </div>

                    <div className="absolute right-3 top-3">
                      <Badge className="bg-orange-600 text-xs text-white">{getCourseLevelLabel(course.level)}</Badge>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                        <Play className="ml-1 h-5 w-5 text-gray-800" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h3 className="text-md line-clamp-2 h-8 font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600">Giảng viên: {course.instructorName}</p>

                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="font-semibold">{course.ratingStar ?? 5}</span>
                          <span className="text-gray-500">({course.ratingCount ?? 1000})</span>
                        </div>

                        <div className="flex items-center">
                          <span className="text-lg font-bold text-blue-700">
                            {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  isDisabled={pagination.page === 0}
                  onPress={() => changePage(pagination.page - 1)}
                  className="rounded-lg px-4 py-2"
                >
                  Trang trước
                </Button>

                <span className="px-4 text-sm text-gray-600">
                  Trang {pagination.page + 1} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  isDisabled={pagination.page >= totalPages - 1}
                  onPress={() => changePage(pagination.page + 1)}
                  className="rounded-lg px-4 py-2"
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Chưa có khóa học nào</h3>
            <p className="text-gray-600">Hiện tại chưa có khóa học nào cho lớp {grade}</p>
            <Button className="bithub-button-primary mt-4" onClick={() => navigate({ to: "/courses" })}>
              Xem tất cả khóa học
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesByGradeComponent;
