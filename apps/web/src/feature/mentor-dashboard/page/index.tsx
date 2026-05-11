import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { StatsCards } from "../components/StatCards";
import { ExamMonthlyChart } from "../components/ExamMonthlyChart";
import { SlideMonthlyChart, MindMapMonthlyChart } from "../components/ContentMonthlyChart";
import { QuestionStatusChart, ProblemStatusChart } from "../components/QuestionStatusChar";
import { MentorHeader } from "@/shared/components/mentor/mentor-header";
import { useGetMentorStats } from "../queries/useMentorStats";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

export default function DashboardPage() {
  const { data, isLoading } = useGetMentorStats();

  return (
    <>
      <PageMeta title="Trang thống kê - Mentor" description="Dashboard" />
      <MentorLayout>
        <MentorHeader />

        <div className="space-y-6 p-8 mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trang thống kê</h1>
            <p className="mt-1 text-gray-600">Xin chào! Đây là tổng quan hoạt động của bạn.</p>
          </div>

          {isLoading || !data ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-20" />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SkeletonBlock className="h-60" />
                <SkeletonBlock className="h-60" />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SkeletonBlock className="h-60" />
                <SkeletonBlock className="h-60" />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SkeletonBlock className="h-52" />
                <SkeletonBlock className="h-52" />
              </div>
            </>
          ) : (
            <>
              <StatsCards stats={data.stats} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ProblemStatusChart data={data.problemStatus} />

                <QuestionStatusChart data={data.questionStatus} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SlideMonthlyChart data={data.contentMonthly} />

                <MindMapMonthlyChart data={data.contentMonthly} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* <ExamMonthlyChart data={data.examMonthly} /> */}
              </div>
            </>
          )}
        </div>
      </MentorLayout>
    </>
  );
}
