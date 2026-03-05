import React from "react";
import { Info, TrendingUp, Users, FileText, Award, MessageSquare, Download } from "lucide-react";
import type { ContestDetailDTO } from "../types/contest.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      value: "150",
      icon: Users,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    },
    {
      label: "Trực tuyến",
      value: "142",
      icon: TrendingUp,
      color: "bg-green-50 text-green-600 dark:bg-green-900/20",
    },
    {
      label: "Bài nộp",
      value: "450",
      icon: FileText,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
    },
    {
      label: "Bài tập",
      value: contest.problemCount.toString(),
      icon: Award,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-10 gap-8">
      <div className="col-span-7 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-lg font-bold mb-3">Mô tả cuộc thi</h4>
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
                <p>
                  Chào mừng bạn đến với <strong>Spring Code Challenge 2026</strong>. Đây là cuộc thi lập trình thường
                  niên dành cho sinh viên CNTT trên toàn quốc.
                </p>
                <ul>
                  <li>Số lượng bài tập: 5 bài (A-E)</li>
                  <li>Ngôn ngữ hỗ trợ: C++, Python, Java</li>
                  <li>Luật chơi: ACM-ICPC</li>
                </ul>
                <p className="text-muted-foreground">
                  Vui lòng đọc kỹ quy định trước khi bắt đầu bài làm. Mọi hành vi gian lận sẽ bị hủy kết quả ngay lập
                  tức.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian bắt đầu</p>
                <p className="text-sm font-semibold">{formatDateTime(contest.startTime)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Thời gian kết thúc
                </p>
                <p className="text-sm font-semibold">{formatDateTime(contest.endTime)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời lượng</p>
                <p className="text-sm font-semibold">
                  {contest.durationMinutes} phút ({Math.floor(contest.durationMinutes / 60)} giờ)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Số liệu trực tiếp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                return (
                  <div key={index} className={`p-4 rounded-xl border ${stat.color}`}>
                    <p className="text-[10px] font-bold uppercase mb-1 opacity-80">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5 text-slate-500" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Gửi tin nhắn (Broadcast)</span>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Xuất báo cáo tổng quan</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
