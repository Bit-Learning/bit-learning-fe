import { Badge } from "@workspace/ui/components/Badge";
import { BookOpen, Star, Users, Video, CheckCircle } from "lucide-react";
import type React from "react";
import type { CourseDetail } from "../types/course.type";

interface CourseHeroProps {
  course: CourseDetail;
  hasAccess?: boolean;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
}

const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    BEGINNING: "Cơ bản",
    INTERMEDIATE: "Trung bình",
    ADVANCED: "Nâng cao",
  };
  return labels[level] || level;
};

export const CourseHero: React.FC<CourseHeroProps> = ({ course, hasAccess }) => {
  return (
    <div className="rounded-md overflow-hidden bg-[#1a2744] text-white">
      <div className="flex flex-col md:flex-row items-center gap-6 p-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-white leading-tight">{course.title}</h1>
          <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">{course.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="rounded bg-white/10 px-2.5 py-1 text-xs text-gray-300">Lớp {course.grade}</span>
            <span className="rounded bg-white/10 px-2.5 py-1 text-xs text-gray-300">{getLevelLabel(course.level)}</span>
            {course.language && (
              <span className="rounded bg-white/10 px-2.5 py-1 text-xs text-gray-300">
                {course.language === "VIETNAMESE" ? "Tiếng Việt" : "English"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.ratingCount || 0} Học viên
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(course.ratingStar || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"
                  }`}
                />
              ))}
              <span className="ml-1 text-white font-semibold">{(course.ratingStar ?? 5).toFixed(1)}</span>
            </span>
          </div>

          {hasAccess && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Tiến độ học tập</span>
                <span className="text-blue-400 font-medium">{Math.round(course.progressPercentage ?? 0)}%</span>
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

        <div className="w-full md:w-72 shrink-0">
          <div className="relative overflow-hidden rounded-xl aspect-video">
            <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
            {hasAccess && (
              <div className="absolute bottom-2 right-2">
                <span className="flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
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
