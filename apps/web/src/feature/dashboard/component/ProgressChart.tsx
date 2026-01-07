import React, { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import type { WeeklyProgress, MonthlyProgress } from "../types/dashboard.type";

interface ProgressChartProps {
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
}

type ViewType = "weekly" | "monthly";

const ProgressChart: React.FC<ProgressChartProps> = ({ weeklyProgress, monthlyProgress }) => {
  const [view, setView] = useState<ViewType>("weekly");

  const maxWeeklyMinutes = Math.max(...weeklyProgress.map((d) => d.minutesLearned), 1);
  const maxMonthlyMinutes = Math.max(...monthlyProgress.map((d) => d.totalMinutes), 1);

  const totalWeeklyMinutes = weeklyProgress.reduce((sum, d) => sum + d.minutesLearned, 0);
  const totalWeeklyLectures = weeklyProgress.reduce((sum, d) => sum + d.lecturesCompleted, 0);

  const formatMinutes = (mins: number): string => {
    if (mins < 60) return `${mins}p`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}p` : `${h}h`;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tiến độ học tập</h2>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setView("weekly")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "weekly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            6 tháng
          </button>
        </div>
      </div>

      {view === "weekly" ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-600">Tổng thời gian</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">{formatMinutes(totalWeeklyMinutes)}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-600">Bài học hoàn thành</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{totalWeeklyLectures}</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2" style={{ height: "160px" }}>
            {weeklyProgress.map((day, index) => {
              const height = (day.minutesLearned / maxWeeklyMinutes) * 100;
              const isToday = index === weeklyProgress.length - 1;

              return (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">
                    {day.minutesLearned > 0 ? formatMinutes(day.minutesLearned) : ""}
                  </span>
                  <div className="relative w-full flex-1">
                    <div
                      className={`absolute bottom-0 left-1/2 w-8 -translate-x-1/2 rounded-t-md transition-all ${
                        isToday ? "bg-blue-600" : "bg-blue-400"
                      } ${day.minutesLearned === 0 ? "bg-gray-200" : ""}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-600"}`}>{day.day}</p>
                    <p className="text-[10px] text-gray-400">{day.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-purple-50 p-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600">Xu hướng 6 tháng</p>
              <p className="font-semibold text-purple-700">
                {monthlyProgress.reduce((sum, m) => sum + m.coursesCompleted, 0)} khóa học hoàn thành
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3" style={{ height: "160px" }}>
            {monthlyProgress.map((month) => {
              const height = (month.totalMinutes / maxMonthlyMinutes) * 100;

              return (
                <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">
                    {month.totalMinutes > 0 ? formatMinutes(month.totalMinutes) : ""}
                  </span>
                  <div className="relative w-full flex-1">
                    <div
                      className={`absolute bottom-0 left-1/2 w-10 -translate-x-1/2 rounded-t-md bg-purple-500 transition-all ${
                        month.totalMinutes === 0 ? "bg-gray-200" : ""
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-600">{month.month}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressChart;
