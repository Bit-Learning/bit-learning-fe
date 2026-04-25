import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { BookOpen, ChevronLeft, ChevronRight, LayoutGrid, Sparkles } from "lucide-react";
import type React from "react";
import { useMemo, useRef } from "react";
import { useCoursesByGrade } from "../queries/useCourse";
import type { CourseLevel, CoursePreview } from "../types/course.type";
import { CourseCard } from "./CourseCard";

export const PersonalisedView: React.FC<{
  grade: number;
  selectedLevel: CourseLevel | null;
  sortBy: string;
  onCourseClick: (id: number) => void;
  onCourseHover: (id: number) => void;
  onShowAll: () => void;
}> = ({ grade, selectedLevel, sortBy, onCourseClick, onCourseHover, onShowAll }) => {
  const { data, isLoading, error } = useCoursesByGrade(grade);
  const scrollRef = useRef<HTMLDivElement>(null);

  const courses = useMemo(() => {
    let list: CoursePreview[] = data?.data ?? [];
    if (selectedLevel) list = list.filter((c) => c.level === selectedLevel);
    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [data?.data, selectedLevel, sortBy]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: dir === "right" ? width : -width, behavior: "smooth" });
  };

  if (isLoading) return <Loader />;
  if (error) return <p className="text-red-500 text-sm">{(error as Error).message}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="inline-flex items-center gap-1.5 text-md font-semibold text-blue-600">
          <Sparkles className="w-4 h-4" />
          Khóa học lớp {grade} — dành cho bạn
        </div>
        <button
          onClick={onShowAll}
          className="ml-auto cursor-pointer inline-flex items-center gap-1.5 text-md font-medium px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          Xem tất cả khóa học
        </button>
      </div>

      {courses.length === 0 ? (
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
      )}
    </div>
  );
};
