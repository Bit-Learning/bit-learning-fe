import React from "react";
import { Info, TrendingUp } from "lucide-react";
import type { ContestDetailDTO } from "../types/contest.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContestOverviewProps {
  contest: ContestDetailDTO;
}

export const ContestOverview: React.FC<ContestOverviewProps> = ({ contest }) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const stats = [
    {
      label: "Người đăng ký",
      value: contest.participantCount.toString(),
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Bài tập",
      value: contest.problemCount.toString(),
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-10 gap-8 max-w-7xl mx-auto">
      <div className="col-span-7 space-y-8">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Info className="w-5 h-5 text-blue-600" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-lg font-bold mb-3 text-gray-900">Mô tả cuộc thi</h4>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{contest.description || "Chưa có mô tả"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Thời gian bắt đầu</p>
                <p className="text-sm font-semibold text-gray-900">{formatDateTime(contest.startTime)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Thời gian kết thúc</p>
                <p className="text-sm font-semibold text-gray-900">{formatDateTime(contest.endTime)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Thời lượng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {contest.durationMinutes} phút ({Math.floor(contest.durationMinutes / 60)} giờ)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3 space-y-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Số liệu trực tiếp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className={`p-4 rounded-xl border ${stat.color}`}>
                  <p className="text-xs font-bold uppercase mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
