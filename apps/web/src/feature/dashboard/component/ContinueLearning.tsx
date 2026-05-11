import React from "react";
import { Link } from "@tanstack/react-router";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { useMyCourses } from "../../course/queries/useCourse";
import type { MyCourse } from "../../course/types/course.type";

const ContinueLearning: React.FC = () => {
  const { data, isLoading } = useMyCourses();

  const courses: MyCourse[] = Array.isArray(data?.data) ? data.data : [];

  const continueCourse =
    courses
      .filter((c) => c.progressPercentage > 0 && c.progressPercentage < 100)
      .sort((a, b) => b.progressPercentage - a.progressPercentage)[0] ?? null;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Tiếp tục học</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!continueCourse) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Tiếp tục học</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-4">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Bạn chưa bắt đầu khóa học nào</p>
          <Link to="/courses" className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
            Khám phá khóa học →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Tiếp tục học</h2>

      <div className="flex gap-4">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg">
          <img src={continueCourse.thumbnailUrl} alt={continueCourse.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-full bg-white/90 p-2">
              <Play className="h-5 w-5 text-gray-900" fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-2">{continueCourse.title}</h3>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
              <span>Tiến độ</span>
              <span className="font-medium text-blue-600">{Math.round(continueCourse.progressPercentage)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${continueCourse.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <Link to="/courses/$id" params={{ id: String(continueCourse.id) }} className="mt-4 block">
        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
          <Play className="mr-2 h-4 w-4" />
          Tiếp tục học
        </Button>
      </Link>
    </div>
  );
};

export default ContinueLearning;
