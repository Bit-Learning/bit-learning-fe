import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { BookOpen, Play, Star, Sparkles, CheckCircle, Clock, Filter } from "lucide-react";
import type React from "react";
import { useEffect, useMemo } from "react";
import { useAllCourses, useCourseActions, useCourseState, usePrefetchCourse } from "../queries/useCourse";
import type { CoursePreview } from "../types/course.type";
import { useAppDispatch } from "@/shared/redux/store";
import { setPageSizeAction } from "../store/course.store";

const AllCoursesContent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { prefetchCourseDetail } = usePrefetchCourse();
  const { pagination, selectedGrade, selectedLevel, sortBy } = useCourseState();
  const { changePage, selectGrade, selectLevel, setSortBy, resetFilters } = useCourseActions();

  useEffect(() => {
    dispatch(setPageSizeAction(12));
  }, [dispatch]);

  const { data, isLoading, error, isFetching } = useAllCourses();

  const getCourseLevelLabel = (level: string): string => {
    const levelMap: Record<string, string> = {
      BEGINNING: "Cơ bản",
      INTERMEDIATE: "Trung bình",
      ADVANCED: "Nâng cao",
    };
    return levelMap[level] || level;
  };

  const filteredCourses = useMemo(() => {
    const allCourses: CoursePreview[] = Array.isArray(data?.data) ? data.data : [];

    let filtered = allCourses.filter((course) => {
      if (selectedGrade !== null && course.grade !== selectedGrade) {
        return false;
      }

      if (selectedLevel !== null && course.level !== selectedLevel) {
        return false;
      }

      return true;
    });

    if (sortBy === "price_asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [data?.data, selectedGrade, selectedLevel, sortBy]);

  const handleMouseEnter = (courseId: number) => {
    prefetchCourseDetail(courseId);
  };

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(rgb(226 232 240) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="fixed inset-0 -z-10 dark:block hidden"
          style={{
            backgroundImage: "radial-gradient(rgb(30 41 59) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
              <p className="text-gray-600 dark:text-gray-400">Đang tải khóa học...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600">Lỗi: {(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalElements = data?.page?.totalElements || 0;
  const totalPages = data?.page?.totalPages || 0;
  const courses = filteredCourses;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(rgb(226 232 240) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="fixed inset-0 -z-10 dark:block hidden"
        style={{
          backgroundImage: "radial-gradient(rgb(30 41 59) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center pt-4 pb-12 bg-white dark:bg-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 rounded-2xl shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Học tập không giới hạn</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            Khóa học Tin học <br className="hidden md:block" /> từ <span className="text-blue-600">Lớp 1</span> đến{" "}
            <span className="text-blue-600">Lớp 12</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Chương trình học tin học toàn diện, cập nhật theo xu hướng công nghệ mới nhất dành cho học sinh từ Tiểu học
            đến THPT.
          </p>
        </section>

        <section className="mb-8 bg-white dark:bg-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Filter className="w-5 h-5" />
                <span className="text-slate-800 dark:text-slate-400 text-md font-bold">Lọc:</span>
              </div>

              <select
                value={selectedGrade ?? "all"}
                onChange={(e) => selectGrade(e.target.value === "all" ? null : Number(e.target.value))}
                className="pr-10 pl-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">Tất cả lớp</option>
                <option value="3">Lớp 3</option>
                <option value="4">Lớp 4</option>
                <option value="5">Lớp 5</option>
                <option value="6">Lớp 6</option>
                <option value="7">Lớp 7</option>
                <option value="8">Lớp 8</option>
                <option value="9">Lớp 9</option>
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>

              <select
                value={selectedLevel ?? "all"}
                onChange={(e) => selectLevel(e.target.value === "all" ? null : (e.target.value as any))}
                className="pr-10 pl-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="BEGINNING">Cơ bản</option>
                <option value="INTERMEDIATE">Trung bình</option>
                <option value="ADVANCED">Nâng cao</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-slate-800 dark:text-slate-400 text-md font-bold">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pr-10 pl-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="default">Mặc định</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>

              {(selectedGrade !== null || selectedLevel !== null || sortBy !== "default") && (
                <button
                  onClick={resetFilters}
                  className="cursor-pointer px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {courses.length > 0 && (
              <div>
                <p className="text-slate-700 dark:text-slate-300 text-md font-medium">
                  Hiển thị <span className="font-bold text-blue-600">{courses.length}</span> khóa học (Tổng:{" "}
                  <span className="font-bold text-blue-600">{totalElements}</span>)
                </p>
              </div>
            )}
          </div>
        </section>

        {isFetching && (
          <div className="mb-4 text-center">
            <span className="text-blue-700 dark:text-blue-400">Đang cập nhật...</span>
          </div>
        )}

        {courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {courses.map((course: CoursePreview) => (
                <Card
                  key={course.id}
                  className="group cursor-pointer overflow-hidden gap-2 p-0 transition-all duration-300 hover:shadow-xl border border-slate-200 dark:border-slate-700"
                  onMouseEnter={() => handleMouseEnter(course.id)}
                  onClick={() =>
                    navigate({
                      to: "/courses/$id",
                      params: { id: String(course.id) },
                    })
                  }
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
                      <h3 className="text-md line-clamp-2 h-12 font-bold text-slate-900 dark:text-white transition-colors group-hover:text-blue-700">
                        {course.title}
                      </h3>

                      <p className="text-sm text-slate-600 dark:text-slate-400">Giảng viên: {course.instructorName}</p>

                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="font-semibold">{course.ratingStar ?? 5}</span>
                          <span className="text-slate-500 dark:text-slate-400">({course.ratingCount ?? 1000})</span>
                        </div>

                        <div className="flex items-center">
                          <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
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
                  onPress={() => handlePageChange(pagination.page - 1)}
                  className="rounded-lg px-4 py-2"
                >
                  Trang trước
                </Button>

                <span className="px-4 text-sm text-slate-600 dark:text-slate-400">
                  Trang {pagination.page + 1} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  isDisabled={pagination.page >= totalPages - 1}
                  onPress={() => handlePageChange(pagination.page + 1)}
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
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Chưa có khóa học nào</h3>
            <p className="text-slate-600 dark:text-slate-400">Hiện tại chưa có khóa học nào trong hệ thống</p>
          </div>
        )}

        <section className="mt-16">
          <div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white p-8 lg:p-10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />

            <div className="relative text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Tại sao chọn Bit Learning?</h2>
              <p className="text-slate-400 text-base">Cam kết mang lại giá trị học thuật cao nhất cho học viên</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center relative">
              <div className="space-y-4 group">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-8 h-8 text-blue-400 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold">Chương trình chuẩn</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Nội dung theo chương trình BGD&ĐT, phù hợp từng cấp học và luôn cập nhật xu hướng công nghệ.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                  <Star className="w-8 h-8 text-blue-400 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold">Giảng viên chất lượng</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Đội ngũ giáo viên giàu kinh nghiệm, tận tâm với học sinh và có phương pháp dạy hiện đại.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/30 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                  <Clock className="w-8 h-8 text-orange-400 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold">Học mọi lúc mọi nơi</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Video bài giảng chất lượng cao, hệ thống bài tập thực hành phong phú, học tập linh hoạt.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AllCoursesContent;
