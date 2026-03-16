import { Badge } from "@workspace/ui/components/Badge";
import { BookOpen, CheckCircle, Clock, Heart, Play, Share2, Star, Users, Video } from "lucide-react";
import type React from "react";
import { CourseDetail } from "../types/course.type";

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

export const CourseHero: React.FC<CourseHeroProps> = ({ course, hasAccess, isLiked, onLike, onShare }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border-2 border-blue-200 dark:border-slate-800">
      <div className="relative group aspect-video overflow-hidden">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/40 transition-all">
            <Play className="ml-1 h-8 w-8" />
          </button>
        </div>

        <div className="absolute top-6 left-6 flex gap-2 flex-wrap">
          <Badge className="bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
            Lớp {course.grade}
          </Badge>
          <Badge className="bg-rose-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
            {getLevelLabel(course.level)}
          </Badge>
          {hasAccess && (
            <Badge className="bg-green-600 text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Đã đăng ký
            </Badge>
          )}
          {hasAccess && (
            <Badge className="bg-emerald-500 text-white text-xs font-bold px-3 py-1">
              {Math.round(course.progressPercentage)}% hoàn thành
            </Badge>
          )}
        </div>

        <div className="absolute bottom-6 right-6 flex gap-3">
          <button
            onClick={onLike}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border border-white/20 transition-all ${
              isLiked ? "bg-rose-500 text-white" : "bg-white/20 text-white hover:bg-rose-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-blue-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        <h1 className="font-display text-3xl font-bold mb-3 text-slate-900 dark:text-white">{course.title}</h1>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border">
          <div className="text-center">
            <div className="w-10 h-10  text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">
              Đánh giá
            </p>
            <p className="font-bold text-slate-900 dark:text-white">
              {(course.ratingStar ?? 5).toFixed(1)}/5.0
              {course.ratingCount ? ` (${course.ratingCount})` : ""}
            </p>
          </div>
          <div className="text-center border-x border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">
              Chương
            </p>
            <p className="font-bold text-slate-900 dark:text-white">{course.totalSections}</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Video className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">
              Bài học
            </p>
            <p className="font-bold text-slate-900 dark:text-white">{course.totalLectures}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
