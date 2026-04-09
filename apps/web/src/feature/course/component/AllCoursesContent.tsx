import { useAppDispatch } from "@/shared/redux/store";
import { useNavigate } from "@tanstack/react-router";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useAllCourses, useCourseActions, useCourseState, usePrefetchCourse } from "../queries/useCourse";
import { setPageSizeAction } from "../store/course.store";
import type { CoursePreview } from "../types/course.type";
import { CourseCard } from "./CourseCard";

const GRADES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const GradeSection: React.FC<{
  grade: number;
  courses: CoursePreview[];
  onCourseClick: (id: number) => void;
  onCourseHover: (id: number) => void;
}> = ({ grade, courses, onCourseClick, onCourseHover }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (courses.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;

    scrollRef.current.scrollBy({
      left: dir === "right" ? width : -width,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lớp {grade}</h2>

        <span className="text-sm text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {courses.length} khóa học
        </span>

        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />

        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="
          grid
          grid-flow-col
          auto-cols-[48%]
          sm:auto-cols-[31%]
          xl:auto-cols-[23%]
          gap-4
          overflow-x-auto
          pb-2
          scrollbar-hide
        "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => onCourseClick(course.id)}
            onMouseEnter={() => onCourseHover(course.id)}
          />
        ))}
      </div>
    </div>
  );
};
const AllCoursesContent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { prefetchCourseDetail } = usePrefetchCourse();
  const { selectedLevel, sortBy } = useCourseState();
  const { selectLevel, setSortBy, resetFilters } = useCourseActions();

  useEffect(() => {
    dispatch(setPageSizeAction(100));
  }, [dispatch]);

  const { data, isLoading, error } = useAllCourses();

  const coursesByGrade = useMemo(() => {
    const allCourses: CoursePreview[] = Array.isArray(data?.data) ? data.data : [];

    let filtered = allCourses.filter((course) => {
      if (selectedLevel !== null && course.level !== selectedLevel) return false;
      return true;
    });

    if (sortBy === "price_asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

    const map: Record<number, CoursePreview[]> = {};
    for (const grade of GRADES) map[grade] = [];
    for (const course of filtered) (map[course.grade] ??= []).push(course);
    return map;
  }, [data?.data, selectedLevel, sortBy]);

  const totalVisible = useMemo(
    () => Object.values(coursesByGrade).reduce((s, arr) => s + arr.length, 0),
    [coursesByGrade],
  );

  const handleCourseClick = (id: number) => {
    navigate({ to: "/courses/$id", params: { id: String(id) } });
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{(error as Error).message}</p>
      </div>
    );
  }

  const totalElements = data?.page?.totalElements || 0;
  const hasActiveFilter = selectedLevel !== null || sortBy !== "default";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div
        className="fixed inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage: "radial-gradient(rgb(203 213 225) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(rgb(30 41 59) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <section className="relative overflow-hidden h-60 md:h-72 flex items-end">
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1920&q=80"
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
        <div className="relative z-10 px-8 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1.5">Thúc đẩy sự nghiệp của bạn</h1>
          <p className="text-sm text-slate-300 max-w-lg">
            Chương trình chuẩn BGD&ĐT, cập nhật xu hướng công nghệ mới nhất.
          </p>
        </div>
      </section>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-md text-gray-500 flex items-center">
            <span onClick={() => navigate({ to: "/" })} className="hover:text-blue-600 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-blue-600 font-medium">Danh sách khóa học</span>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center gap-2.5 mb-8 py-3 border-y border-slate-200 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Lọc
          </span>

          {(
            [
              { value: null, label: "Tất cả" },
              { value: "BEGINNING", label: "Cơ bản" },
              { value: "INTERMEDIATE", label: "Trung bình" },
              { value: "ADVANCED", label: "Nâng cao" },
            ] as { value: string | null; label: string }[]
          ).map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => selectLevel(opt.value as any)}
              className={`cursor-pointer text-sm px-3.5 py-1.5 rounded-full border font-medium transition-all ${
                selectedLevel === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 bg-white dark:bg-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Sắp xếp
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm px-3.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="default">Mặc định</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="cursor-pointer text-sm px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-400 transition-all bg-white dark:bg-slate-900"
            >
              ✕ Xóa bộ lọc
            </button>
          )}

          <span className="ml-auto text-md text-slate-400 dark:text-slate-500">
            {totalVisible} / {totalElements} khóa học
          </span>
        </div>

        {totalVisible > 0 ? (
          <div>
            {GRADES.map((grade) => (
              <GradeSection
                key={grade}
                grade={grade}
                courses={coursesByGrade[grade] || []}
                onCourseClick={handleCourseClick}
                onCourseHover={prefetchCourseDetail}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">Không có khóa học nào</h3>
            <p className="text-sm text-slate-400">Thử thay đổi bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCoursesContent;
