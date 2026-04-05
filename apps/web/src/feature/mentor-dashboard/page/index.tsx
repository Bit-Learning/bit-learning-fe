import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { StatsCards } from "../components/StatCards";
import { ExamMonthlyChart } from "../components/ExamMonthlyChart";
import { SlideMonthlyChart, MindMapMonthlyChart } from "../components/ContentMonthlyChart";
import { mockStats, mockQuestionStatus, mockExamMonthly, mockContentMonthly } from "../data/data";
import { QuestionStatusChart } from "../components/QuestionStatusChar";

export default function DashboardPage() {
  return (
    <>
      <PageMeta title="Trang thống kê - Mentor" description="Dashboard" />
      <MentorLayout>
        <div className="space-y-6 p-8 mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trang thống kê</h1>
            <p className="mt-1 text-gray-600">Xin chào! Đây là tổng quan hoạt động của bạn.</p>
          </div>

          <StatsCards stats={mockStats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExamMonthlyChart data={mockExamMonthly} />
            <QuestionStatusChart data={mockQuestionStatus} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SlideMonthlyChart data={mockContentMonthly} />
            <MindMapMonthlyChart data={mockContentMonthly} />
          </div>
        </div>
      </MentorLayout>
    </>
  );
}
