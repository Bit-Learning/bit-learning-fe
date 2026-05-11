import React from "react";
import { Flame, Trophy, Calendar } from "lucide-react";
import { useLoginStreak } from "../queries/useDashboard";
import { DailyLoginInfo } from "../types/dashboard.type";

const DAY_LABEL: Record<string, string> = {
  MONDAY: "T2",
  TUESDAY: "T3",
  WEDNESDAY: "T4",
  THURSDAY: "T5",
  FRIDAY: "T6",
  SATURDAY: "T7",
  SUNDAY: "CN",
};

const LearningStreak: React.FC = () => {
  const { data, isLoading } = useLoginStreak();

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100" />
          <div className="flex justify-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 w-9 rounded-full bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { currentStreak, maxStreak, weeklyLogins } = data;
  const todayEntry = weeklyLogins[weeklyLogins.length - 1];
  const isActiveToday = todayEntry?.loggedIn ?? false;
  const totalLoggedIn = weeklyLogins.filter((d) => d.loggedIn).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Chuỗi học tập</h2>
        <Flame className={`h-5 w-5 ${isActiveToday ? "text-orange-500" : "text-gray-300"}`} />
      </div>

      <div className="mb-6 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-bold ${currentStreak > 0 ? "text-orange-500" : "text-gray-300"}`}>
            {currentStreak}
          </div>
          <p className="mt-1 text-sm text-gray-500">ngày liên tiếp</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-center text-xs font-medium text-gray-500">7 ngày gần nhất</p>
        <div className="flex justify-center gap-2">
          {weeklyLogins.map((day: DailyLoginInfo) => {
            const label = DAY_LABEL[day.dayOfWeek] ?? day.dayOfWeek;
            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    day.loggedIn ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {day.loggedIn ? <Flame className="h-4 w-4" /> : <span className="text-xs">{label}</span>}
                </div>
                <span className="text-[10px] text-gray-400">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
          <Trophy className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-xs text-gray-500">Kỷ lục</p>
            <p className="font-semibold text-gray-900">{maxStreak} ngày</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
          <Calendar className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Tuần này</p>
            <p className="font-semibold text-gray-900">{totalLoggedIn} ngày</p>
          </div>
        </div>
      </div>

      {!isActiveToday && currentStreak > 0 && (
        <div className="mt-4 rounded-lg bg-orange-50 p-3 text-center">
          <p className="text-sm text-orange-700">🔥 Học hôm nay để duy trì chuỗi {currentStreak} ngày!</p>
        </div>
      )}
    </div>
  );
};

export default LearningStreak;
