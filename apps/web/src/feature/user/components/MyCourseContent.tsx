import { useCourseActions, useCourseState, useMyCourses } from "@/feature/course/queries/useCourse";
import { MyCourse } from "@/feature/course/types/course.type";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { BookOpen, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/shared/redux/store";
import { setPageSizeAction } from "@/feature/course/store/course.store";
import { Pagination } from "@/shared/components/Pagination";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

type FilterTab = "all" | "inProgress" | "completed";

const MyCoursesContent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pagination } = useCourseState();
  const { changePage } = useCourseActions();
  const { data, isLoading, error } = useMyCourses();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    dispatch(setPageSizeAction(10));
  }, [dispatch]);

  const getCourseLevelLabel = (level: string): string => {
    const levelMap: Record<string, string> = {
      BEGINNING: "Cơ bản",
      INTERMEDIATE: "Trung bình",
      ADVANCED: "Nâng cao",
    };
    return levelMap[level] || level;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-orange-500";
    if (progress < 70) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleContinueLearning = (courseId: number) => {
    navigate({
      to: "/courses/$id",
      params: { id: String(courseId) },
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600">Lỗi: {(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  const courses: MyCourse[] = Array.isArray(data?.data) ? data.data : [];
  const totalPages = data?.page?.totalPages || 0;

  const filteredCourses = courses.filter((course) => {
    if (course.isDeleted) return false;

    if (activeTab === "inProgress") {
      return course.progressPercentage > 0 && course.progressPercentage < 100;
    }

    if (activeTab === "completed") {
      return course.progressPercentage === 100;
    }

    return true;
  });

  const inProgressCount = courses.filter(
    (c) => !c.isDeleted && c.progressPercentage > 0 && c.progressPercentage < 100,
  ).length;

  const completedCount = courses.filter((c) => !c.isDeleted && c.progressPercentage === 100).length;

  if (courses.length === 0) {
    return (
      <div className="mx-auto grow space-y-8 border-gray-200">
        <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-800 p-12 shadow-sm">
          <img src="/sad-face-2691.svg" alt="Không có khóa học nào" className="mb-6 h-24 w-24 text-gray-300" />
          <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Chưa có khóa học nào</h3>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
            Bạn chưa đăng ký khóa học nào. Hãy khám phá và bắt đầu học tập ngay!
          </p>
          <Button
            size="xl"
            onClick={() => navigate({ to: "/courses" })}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Khám phá khóa học
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-full mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Khóa học của tôi</h1>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`cursor-pointer px-4 py-2 rounded-lg text-md font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-white text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Tất cả ({courses.filter((c) => !c.isDeleted).length}){" "}
            </button>
            <button
              onClick={() => setActiveTab("inProgress")}
              className={`cursor-pointer px-4 py-2 rounded-lg text-md font-medium transition-colors ${
                activeTab === "inProgress"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-white text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Đang học ({inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`cursor-pointer px-4 py-2 rounded-lg text-md font-medium transition-colors ${
                activeTab === "completed"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-white text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Hoàn thành ({completedCount})
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 *:w-full"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          {filteredCourses.map((course: MyCourse) => (
            <Card
              key={course.id}
              className={`group cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-800 border py-4`}
              onClick={() => handleContinueLearning(course.id)}
            >
              <CardContent className="px-4 ">
                <div className="flex w-full gap-4">
                  <div className="shrink-0">
                    <div className="relative w-40 h-28 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between w-50">
                    <div>
                      <h3 className="text-base h-11 font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 w-full">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Lớp {course.grade} • {getCourseLevelLabel(course.level)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getProgressColor(course.progressPercentage)}`}
                          style={{ width: `${course.progressPercentage}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          course.progressPercentage < 30
                            ? "text-orange-600"
                            : course.progressPercentage < 70
                              ? "text-blue-600"
                              : "text-green-600"
                        }`}
                      >
                        {course.progressPercentage === 0 ? "0%" : `${Math.round(course.progressPercentage)}%`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={pagination.page} totalPages={totalPages} onPageChange={changePage} />
        )}
      </div>
    </div>
  );
};

export default MyCoursesContent;
