import { Card, CardContent, CardTitle } from "@workspace/ui/components/Card";
import type React from "react";

interface CourseInfoCardProps {
  level: string;
  grade: number;
  language: string;
  totalSections: number;
  totalLectures: number;
  totalDuration: number;
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({
  level,
  grade,
  language,
  totalSections,
  totalLectures,
  totalDuration,
}) => {
  return (
    <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
      <div className="bg-linear-to-r from-gray-800 to-gray-900 p-6">
        <CardTitle className="text-white">Thông tin khóa học</CardTitle>
      </div>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <span className="font-medium text-gray-600">Cấp độ</span>
          <span className="rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-3 py-1 text-sm font-bold text-white">
            {level}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <span className="font-medium text-gray-600">Lớp</span>
          <span className="font-bold text-gray-900">Lớp {grade}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <span className="font-medium text-gray-600">Ngôn ngữ</span>
          <span className="font-bold text-gray-900">{language}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <span className="font-medium text-gray-600">Số chương</span>
          <span className="font-bold text-gray-900">{totalSections}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <span className="font-medium text-gray-600">Số bài học</span>
          <span className="font-bold text-gray-900">{totalLectures}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <span className="font-medium text-gray-600">Thời lượng</span>
          <span className="font-bold text-gray-900">{totalDuration} phút</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInfoCard;
