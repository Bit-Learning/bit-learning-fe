import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { BookOpen, LayoutGrid, Sparkles } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useCourseActions, useCourseState, usePrefetchCourse } from "../queries/useCourse";
import type { CourseLevel, SearchCourseRequest } from "../types/course.type";
import { AllCoursesView, SCHOOL_LEVELS, type SchoolLevelKey } from "./AllCoursesView";
import { PersonalisedView } from "./PersonalisedView";

const AllCoursesContent: React.FC = () => {
  const navigate = useNavigate();
  const { prefetchCourseDetail } = usePrefetchCourse();
  const { selectedLevel, sortBy } = useCourseState();
  const { selectLevel, setSortBy, resetFilters } = useCourseActions();

  const currentUser = useSelector(selectAuthStateInfo);
  const studentGrade: number | null = currentUser?.userInfo?.grade ?? null;
  const isLoggedIn = !!currentUser;

  const { minGrade, maxGrade } = useSearch({ from: "/_layout/courses/" });

  const [showAll, setShowAll] = useState(() => minGrade !== undefined || maxGrade !== undefined);

  const [selectedSchoolLevel, setSelectedSchoolLevel] = useState<SchoolLevelKey>(() => {
    if (minGrade !== undefined && maxGrade !== undefined) {
      return SCHOOL_LEVELS.find((s) => s.minGrade === minGrade && s.maxGrade === maxGrade)?.label ?? null;
    }
    return null;
  });

  const isPersonalised = isLoggedIn && !!studentGrade && !showAll;

  const searchRequest = useMemo<SearchCourseRequest>(() => {
    const req: SearchCourseRequest = {};
    if (selectedLevel) req.level = selectedLevel;
    if (selectedSchoolLevel) {
      const found = SCHOOL_LEVELS.find((s) => s.label === selectedSchoolLevel);
      if (found) {
        req.minGrade = found.minGrade;
        req.maxGrade = found.maxGrade;
      }
    }
    return req;
  }, [selectedLevel, selectedSchoolLevel]);

  const hasActiveFilter = selectedLevel !== null || sortBy !== "default" || selectedSchoolLevel !== null;

  const handleCourseClick = (id: number) => {
    navigate({ to: "/courses/$id", params: { id: String(id) } });
  };

  const handleResetFilters = () => {
    resetFilters();
    setSelectedSchoolLevel(null);
  };

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
        style={{ backgroundImage: "radial-gradient(rgb(30 41 59) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
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
          {isLoggedIn && !!studentGrade && (
            <>
              <button
                onClick={() => setShowAll(false)}
                className={`cursor-pointer text-md px-3.5 py-1.5 rounded-full border font-medium transition-all ${
                  !showAll
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-slate-400"
                }`}
              >
                <Sparkles className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                Dành cho tôi
              </button>
              <button
                onClick={() => setShowAll(true)}
                className={`cursor-pointer text-md px-3.5 py-1.5 rounded-full border font-medium transition-all ${
                  showAll
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-slate-400"
                }`}
              >
                <LayoutGrid className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                Tất cả
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            </>
          )}

          {!isPersonalised && (
            <select
              value={selectedSchoolLevel ?? ""}
              onChange={(e) => setSelectedSchoolLevel((e.target.value as SchoolLevelKey) || null)}
              className="text-md px-3.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Tất cả cấp học</option>
              {SCHOOL_LEVELS.map((sl) => (
                <option key={sl.label} value={sl.label}>
                  {sl.label}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedLevel ?? ""}
            onChange={(e) => selectLevel((e.target.value as CourseLevel) || null)}
            className="text-md px-3.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Tất cả trình độ</option>
            <option value="BEGINNING">Cơ bản</option>
            <option value="INTERMEDIATE">Trung bình</option>
            <option value="ADVANCED">Nâng cao</option>
          </select>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          <span className="text-md font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Sắp xếp
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-md px-3.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="default">Mặc định</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>

          {hasActiveFilter && (
            <>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
              <button
                onClick={handleResetFilters}
                className="cursor-pointer text-sm px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-400 transition-all bg-white dark:bg-slate-900"
              >
                ✕ Xóa bộ lọc
              </button>
            </>
          )}
        </div>

        {isPersonalised ? (
          <PersonalisedView
            grade={studentGrade!}
            selectedLevel={selectedLevel}
            sortBy={sortBy}
            onCourseClick={handleCourseClick}
            onCourseHover={prefetchCourseDetail}
            onShowAll={() => setShowAll(true)}
          />
        ) : (
          <AllCoursesView
            searchRequest={searchRequest}
            sortBy={sortBy}
            onCourseClick={handleCourseClick}
            onCourseHover={prefetchCourseDetail}
          />
        )}
      </div>
    </div>
  );
};

export default AllCoursesContent;
