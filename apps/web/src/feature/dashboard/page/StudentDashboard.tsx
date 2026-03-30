import React from "react";
import { mockDashboardData } from "../data/data";
import DashboardStats from "../component/DashboardStats";
import ContinueLearning from "../component/ContinueLearning";
import MyCourses from "../component/MyCourses";
import LearningStreak from "../component/LearningStreak";
import ProgressChart from "../component/ProgressChart";

const StudentDashboard: React.FC = () => {
  const data = mockDashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Xin chào! 👋</h1>
          <p className="mt-1 text-gray-500">Tiếp tục hành trình học tập của bạn</p>
        </div>

        <div className="mb-8">
          <DashboardStats />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ContinueLearning />

            <MyCourses />
          </div>

          <div className="space-y-6">
            <LearningStreak streak={data.streak} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
