import React from "react";
import { Link } from "@tanstack/react-router";
import { Play, Clock } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import type { ContinueLearning as ContinueLearningType } from "../types/dashboard.type";

interface ContinueLearningProps {
  data: ContinueLearningType | null;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

const ContinueLearning: React.FC<ContinueLearningProps> = ({ data }) => {
  if (!data) {
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

  const progressTime = formatDuration(data.lastWatchedSecond);
  const totalTime = formatDuration(data.totalDuration);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tiếp tục học</h2>
        <span className="text-xs text-gray-400">{formatTimeAgo(data.lastWatchedAt)}</span>
      </div>

      <div className="flex gap-4">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg">
          <img src={data.courseThumbnail} alt={data.courseTitle} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-full bg-white/90 p-2">
              <Play className="h-5 w-5 text-gray-900" fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600">{data.sectionTitle}</p>
            <h3 className="mt-1 font-medium text-gray-900 line-clamp-1">{data.lectureTitle}</h3>
            <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{data.courseTitle}</p>
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {progressTime} / {totalTime}
                </span>
              </div>
              <span>{data.progressPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <Link to="/lectures/$id" params={{ id: String(data.lectureId) }} className="mt-4 block">
        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
          <Play className="mr-2 h-4 w-4" />
          Tiếp tục học
        </Button>
      </Link>
    </div>
  );
};

export default ContinueLearning;
