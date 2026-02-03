import { Badge } from "@workspace/ui/components/Badge";
import { BookOpen, CheckCircle, Clock, Heart, Play, Share2, Star, Users, Video } from "lucide-react";
import type React from "react";

interface CourseHeroProps {
  course: {
    thumbnailUrl: string;
    grade: number;
    level: string;
    title: string;
    subtitle: string;
    instructorName: string;
    totalDuration: number;
    ratingStar: number;
    ratingCount: number;
    totalSections: number;
    totalLectures: number;
  };
  hasAccess?: boolean;
  progress?: number;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
}

const CourseHero: React.FC<CourseHeroProps> = ({ course, hasAccess, progress, isLiked, onLike, onShare }) => {
  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-xl transition-all hover:shadow-2xl">
      <div className="relative h-72 overflow-hidden md:h-96">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute left-6 top-6 flex flex-wrap gap-2">
          <Badge className="bg-blue-600 px-3 py-1 text-white shadow-lg backdrop-blur-sm">Lớp {course.grade}</Badge>
          <Badge className="bg-linear-to-r from-orange-500 to-pink-500 px-3 py-1 text-white shadow-lg">
            {course.level}
          </Badge>
          {hasAccess && (
            <Badge className="bg-green-600 px-3 py-1 text-white shadow-lg backdrop-blur-sm">
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Đã đăng ký
            </Badge>
          )}
          {hasAccess && progress !== undefined && (
            <Badge className="bg-linear-to-r from-green-500 to-emerald-500 px-3 py-1 text-white shadow-lg">
              {Math.round(progress)}% hoàn thành
            </Badge>
          )}
        </div>

        <div className="absolute bottom-6 left-6">
          <button className="group/play flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30">
            <Play className="ml-1 h-7 w-7 text-white transition-transform group-hover/play:scale-110" />
          </button>
        </div>

        <div className="absolute bottom-6 right-6 flex gap-3">
          <button
            onClick={onLike}
            className={`rounded-full p-3 backdrop-blur-md transition-all hover:scale-110 ${
              isLiked
                ? "bg-red-500/90 text-white shadow-lg shadow-red-500/50"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onShare}
            className="rounded-full bg-white/20 p-3 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6">
          <h1 className="mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
            {course.title}
          </h1>
          <p className="text-xl text-gray-600">{course.subtitle}</p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-500">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Giảng viên</p>
            <p className="font-semibold text-gray-900">{course.instructorName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 p-6 md:grid-cols-4">
          <div className="text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <p className="text-sm text-gray-600">Thời lượng</p>
            <p className="font-bold text-gray-900">{course.totalDuration} phút</p>
          </div>
          <div className="text-center">
            <Star className="mx-auto mb-2 h-8 w-8 fill-yellow-400 text-yellow-400" />
            <p className="text-sm text-gray-600">Đánh giá</p>
            <p className="font-bold text-gray-900">
              {course.ratingStar}/5.0 ({course.ratingCount})
            </p>
          </div>
          <div className="text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
            <p className="text-sm text-gray-600">Chương</p>
            <p className="font-bold text-gray-900">{course.totalSections}</p>
          </div>
          <div className="text-center">
            <Video className="mx-auto mb-2 h-8 w-8 text-purple-600" />
            <p className="text-sm text-gray-600">Bài học</p>
            <p className="font-bold text-gray-900">{course.totalLectures}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;
