import { BookOpen, ChevronLeft, ChevronRight, LayoutGrid, Sparkles, Star, Tag } from "lucide-react";
import type React from "react";
import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import type { CourseLevel, CoursePreview } from "../types/course.type";
import { CourseCard } from "./CourseCard";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useRecommendedCourses } from "../queries/useCourse";

const CourseRow: React.FC<{
  title: React.ReactNode;
  count: number;
  courses: CoursePreview[];
  onCourseClick: (id: number) => void;
  onCourseHover: (id: number) => void;
}> = ({ title, count, courses, onCourseClick, onCourseHover }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: dir === "right" ? width : -width, behavior: "smooth" });
  };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">{title}</div>
        <span className="text-sm text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {count} khóa học
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
        className="grid grid-flow-col auto-cols-[48%] sm:auto-cols-[31%] xl:auto-cols-[23%] gap-4 overflow-x-auto pb-2 scrollbar-hide"
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

const RowSkeleton: React.FC<{ label: string }> = ({ label }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{label}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
    <div className="grid grid-flow-col auto-cols-[48%] sm:auto-cols-[31%] xl:auto-cols-[23%] gap-4 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse h-56" />
      ))}
    </div>
  </div>
);

export const PersonalisedView: React.FC<{
  grade: number;
  selectedLevel: CourseLevel | null;
  sortBy: string;
  onCourseClick: (id: number) => void;
  onCourseHover: (id: number) => void;
  onShowAll: () => void;
}> = ({ grade, selectedLevel, sortBy, onCourseClick, onCourseHover, onShowAll }) => {
  const currentUser = useSelector(selectAuthStateInfo);
  const userId = currentUser?.userInfo?.id;

  const { data, isLoading, error } = useRecommendedCourses(userId);

  const applyFilters = (list: CoursePreview[]): CoursePreview[] => {
    let result = [...list];
    if (selectedLevel) result = result.filter((c) => c.level === selectedLevel);
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    return result;
  };

  const byGrade = useMemo(
    () => applyFilters(data?.recommendedByGrade?.content ?? []),
    [data?.recommendedByGrade, selectedLevel, sortBy],
  );

  const byCategories = useMemo(
    () => applyFilters(data?.recommendedByFavoriteCategories?.content ?? []),
    [data?.recommendedByFavoriteCategories, selectedLevel, sortBy],
  );

  if (error) return <p className="text-red-500 text-sm">{(error as Error).message}</p>;

  const isEmpty = !isLoading && byGrade.length === 0 && byCategories.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="inline-flex items-center gap-1.5 text-md font-semibold text-blue-600"></div>
        <button
          onClick={onShowAll}
          className="ml-auto cursor-pointer inline-flex items-center gap-1.5 text-md font-medium px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          Xem tất cả khóa học
        </button>
      </div>

      {isEmpty ? (
        <div className="py-24 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Không có khóa học nào cho lớp {grade}
          </h3>
          <p className="text-sm text-slate-400 mb-4">Thử xem tất cả khóa học</p>
          <button
            onClick={onShowAll}
            className="cursor-pointer text-sm font-medium px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Xem tất cả
          </button>
        </div>
      ) : (
        <>
          {isLoading ? (
            <RowSkeleton label="Theo môn em thích" />
          ) : byCategories.length > 0 ? (
            <CourseRow
              title={
                <>
                  <Tag className="w-4 h-4 text-slate-500" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gợi ý theo sở thích</h2>
                </>
              }
              count={byCategories.length}
              courses={byCategories}
              onCourseClick={onCourseClick}
              onCourseHover={onCourseHover}
            />
          ) : null}

          {isLoading ? (
            <RowSkeleton label={`Lớp ${grade}`} />
          ) : byGrade.length > 0 ? (
            <CourseRow
              title={
                <>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Khóa học lớp {grade} - dành cho bạn
                  </h2>
                </>
              }
              count={byGrade.length}
              courses={byGrade}
              onCourseClick={onCourseClick}
              onCourseHover={onCourseHover}
            />
          ) : null}
        </>
      )}
    </div>
  );
};
