import { CheckCircle, Star, Users, Clock, BookOpen, Award } from "lucide-react";
import type React from "react";
import type { CourseDetail } from "../types/course.type";

interface CourseHeroProps {
  course: CourseDetail;
  hasAccess?: boolean;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNING: "Cơ bản",
  INTERMEDIATE: "Trung bình",
  ADVANCED: "Nâng cao",
};

export const CourseHero: React.FC<CourseHeroProps> = ({ course, hasAccess }) => {
  return (
    <div className="overflow-hidden rounded-md bg-linear-to-l from-[#11498d] to-[#0E2643] text-white">
      <div className="block lg:hidden ">
        <div className="shrink-0 xs:w-80 md:w-120 p-4">
          <div className="relative overflow-hidden rounded-xl aspect-video shadow-2xl">
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
            {hasAccess && (
              <div className="absolute bottom-2 right-2">
                <span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                  <CheckCircle className="h-3 w-3" />
                  Đã đăng ký
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 space-y-4 py-3">
          <h1 className="text-xl font-bold leading-tight">{course.title}</h1>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">Lớp {course.grade}</span>
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>
            {course.language && (
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">
                {course.language === "VIETNAMESE" ? "Tiếng Việt" : "English"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white">
            {course.totalLectures != null && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-blue-400" />
                {course.totalLectures} bài học
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-400" />
              {(course.ratingCount ?? 0).toLocaleString("vi-VN")} học viên
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-blue-400" />
              Chứng chỉ
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(course.ratingStar ?? 5)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-600 text-gray-600"
                }`}
              />
            ))}
            <span className="ml-1 font-semibold text-white">{(course.ratingStar ?? 5).toFixed(1)}</span>
            <span className="text-sm text-gray-400">({course.ratingCount ?? 0} đánh giá)</span>
          </div>

          {hasAccess && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>Tiến độ học tập</span>
                <span className="text-blue-400 font-semibold">{Math.round(course.progressPercentage ?? 0)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${course.progressPercentage ?? 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-8 px-8 py-8">
        <div className="flex-1 min-w-0 space-y-4">
          <h1 className="text-3xl font-bold leading-tight">{course.title}</h1>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">Lớp {course.grade}</span>
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>
            {course.language && (
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">
                {course.language === "VIETNAMESE" ? "Tiếng Việt" : "English"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white">
            {course.totalLectures != null && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-blue-400" />
                {course.totalLectures} bài học
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-400" />
              {(course.ratingCount ?? 0).toLocaleString("vi-VN")} học viên
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-blue-400" />
              Chứng chỉ
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(course.ratingStar ?? 5)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-600 text-gray-600"
                }`}
              />
            ))}
            <span className="ml-1 font-semibold text-white">{(course.ratingStar ?? 5).toFixed(1)}</span>
            <span className="text-sm text-gray-400">({course.ratingCount ?? 0} đánh giá)</span>
          </div>

          {hasAccess && (
            <div className="max-w-sm">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>Tiến độ học tập</span>
                <span className="text-blue-400 font-semibold">{Math.round(course.progressPercentage ?? 0)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${course.progressPercentage ?? 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 w-80 xl:w-96">
          <div className="relative overflow-hidden rounded-xl aspect-video shadow-2xl">
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
            {hasAccess && (
              <div className="absolute bottom-2 right-2">
                <span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                  <CheckCircle className="h-3 w-3" />
                  Đã đăng ký
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
