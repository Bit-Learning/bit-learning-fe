import React from "react";
import { Flame, Trophy, Calendar } from "lucide-react";
import type { LearningStreak as LearningStreakType } from "../types/dashboard.type";

interface LearningStreakProps {
  streak: LearningStreakType;
}

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const LearningStreak: React.FC<LearningStreakProps> = ({ streak }) => {
  const isActiveToday = streak.weekActivity[streak.weekActivity.length - 1];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Chuỗi học tập</h2>
        <Flame className={`h-5 w-5 ${isActiveToday ? "text-orange-500" : "text-gray-300"}`} />
      </div>

      <div className="mb-6 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-bold ${streak.currentStreak > 0 ? "text-orange-500" : "text-gray-300"}`}>
            {streak.currentStreak}
          </div>
          <p className="mt-1 text-sm text-gray-500">ngày liên tiếp</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-center text-xs font-medium text-gray-500">7 ngày gần nhất</p>
        <div className="flex justify-center gap-2">
          {streak.weekActivity.map((active, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {active ? <Flame className="h-4 w-4" /> : <span className="text-xs">{DAYS[index]}</span>}
              </div>
              <span className="text-[10px] text-gray-400">{DAYS[index]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
          <Trophy className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-xs text-gray-500">Kỷ lục</p>
            <p className="font-semibold text-gray-900">{streak.longestStreak} ngày</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
          <Calendar className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Tổng ngày học</p>
            <p className="font-semibold text-gray-900">{streak.totalDaysLearned} ngày</p>
          </div>
        </div>
      </div>

      {!isActiveToday && streak.currentStreak > 0 && (
        <div className="mt-4 rounded-lg bg-orange-50 p-3 text-center">
          <p className="text-sm text-orange-700">🔥 Học hôm nay để duy trì chuỗi {streak.currentStreak} ngày!</p>
        </div>
      )}
    </div>
  );
};

export default LearningStreak;
