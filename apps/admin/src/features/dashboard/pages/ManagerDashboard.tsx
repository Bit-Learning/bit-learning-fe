import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Main } from "@/layout/main";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { BookOpen, FileText, HelpCircle, Trophy, Gamepad2 } from "lucide-react";
import { Header } from "@/layout/header";
import { useGetManagerStats } from "../queries/useManagerStats";
import type { ManagerStatsDto } from "../types/manager-stats.type";
import { GradeCount } from "../types/dashboard.types";

const MONTH_COLORS = [
  "#CECBF6",
  "#9FE1CB",
  "#F5C4B3",
  "#CECBF6",
  "#9FE1CB",
  "#F5C4B3",
  "#CECBF6",
  "#534AB7",
  "#0F6E56",
  "#993C1D",
  "#534AB7",
  "#CECBF6",
];

const GRADE_COLORS = [
  "#534AB7",
  "#993C1D",
  "#0F6E56",
  "#854F0B",
  "#993556",
  "#185FA5",
  "#3B6D11",
  "#A32D2D",
  "#0F6E56",
  "#534AB7",
];

function fmt(n: number) {
  return n.toLocaleString("vi-VN");
}

function StatCard({
  label,
  value,
  desc,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  desc: string;
  color: "purple" | "teal" | "coral" | "amber" | "pink";
  icon: React.ElementType;
}) {
  const styles = {
    purple: {
      bg: "bg-[#EEEDFE]",
      border: "border-[#AFA9EC]",
      label: "text-[#534AB7]",
      value: "text-[#3C3489]",
      desc: "text-[#7F77DD]",
      icon: "bg-[#CECBF6] text-[#3C3489]",
    },
    teal: {
      bg: "bg-[#E1F5EE]",
      border: "border-[#5DCAA5]",
      label: "text-[#0F6E56]",
      value: "text-[#085041]",
      desc: "text-[#1D9E75]",
      icon: "bg-[#9FE1CB] text-[#085041]",
    },
    coral: {
      bg: "bg-[#FAECE7]",
      border: "border-[#F0997B]",
      label: "text-[#993C1D]",
      value: "text-[#712B13]",
      desc: "text-[#D85A30]",
      icon: "bg-[#F5C4B3] text-[#712B13]",
    },
    amber: {
      bg: "bg-[#FAEEDA]",
      border: "border-[#EF9F27]",
      label: "text-[#854F0B]",
      value: "text-[#633806]",
      desc: "text-[#BA7517]",
      icon: "bg-[#FAC775] text-[#633806]",
    },
    pink: {
      bg: "bg-[#FBEAF0]",
      border: "border-[#ED93B1]",
      label: "text-[#993556]",
      value: "text-[#72243E]",
      desc: "text-[#D4537E]",
      icon: "bg-[#F4C0D1] text-[#72243E]",
    },
  };

  const s = styles[color];

  return (
    <div className={`rounded-xl border ${s.bg} ${s.border} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-sm font-semibold ${s.label}`}>{label}</span>
        <div className={`rounded-lg p-1.5 ${s.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`text-2xl font-bold mb-1 ${s.value}`}>{value}</div>
      <div className={`text-sm ${s.desc}`}>{desc}</div>
    </div>
  );
}

function GradeBars({ data }: { data: GradeCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.grade} className="flex items-center gap-3">
          <span className="text-sm text-gray-500 w-12 text-right shrink-0">Lớp {d.grade}</span>

          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.round((d.count / max) * 100)}%`,
                background: GRADE_COLORS[i % GRADE_COLORS.length],
              }}
            />
          </div>

          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 shrink-0">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function DonutLegend({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
          <span className="text-sm text-gray-500 flex-1">{item.label}</span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {Math.round((item.value / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  items,
  size = 120,
}: {
  items: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = items.reduce((s, i) => s + i.value, 0);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const inner = size * 0.24;

  let angle = -Math.PI / 2;

  const paths: { d: string; color: string; label: string }[] = [];

  items.forEach((item) => {
    const sweep = (item.value / total) * 2 * Math.PI;

    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);

    const nextAngle = angle + sweep;

    const x2 = cx + r * Math.cos(nextAngle);
    const y2 = cy + r * Math.sin(nextAngle);

    const xi1 = cx + inner * Math.cos(angle);
    const yi1 = cy + inner * Math.sin(angle);

    const xi2 = cx + inner * Math.cos(nextAngle);
    const yi2 = cy + inner * Math.sin(nextAngle);

    const large = sweep > Math.PI ? 1 : 0;

    paths.push({
      d: `
        M ${x1} ${y1}
        A ${r} ${r} 0 ${large} 1 ${x2} ${y2}
        L ${xi2} ${yi2}
        A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1}
        Z
      `,
      color: item.color,
      label: item.label,
    });

    angle = nextAngle;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p) => (
        <path key={p.label} d={p.d} fill={p.color} stroke="#fff" strokeWidth="1.5" />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="15" fontWeight="600">
        {total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#888">
        tổng
      </text>
    </svg>
  );
}

function DashboardContent({ data }: { data: ManagerStatsDto }) {
  const courseChartData = [
    { name: "T1", count: data.courseStats.coursesInJanuary },
    { name: "T2", count: data.courseStats.coursesInFebruary },
    { name: "T3", count: data.courseStats.coursesInMarch },
    { name: "T4", count: data.courseStats.coursesInApril },
    { name: "T5", count: data.courseStats.coursesInMay },
    { name: "T6", count: data.courseStats.coursesInJune },
    { name: "T7", count: data.courseStats.coursesInJuly },
    { name: "T8", count: data.courseStats.coursesInAugust },
    { name: "T9", count: data.courseStats.coursesInSeptember },
    { name: "T10", count: data.courseStats.coursesInOctober },
    { name: "T11", count: data.courseStats.coursesInNovember },
    { name: "T12", count: data.courseStats.coursesInDecember },
  ];

  const gradeData = [
    { grade: 3, count: data.questionStats.grade3Questions },
    { grade: 4, count: data.questionStats.grade4Questions },
    { grade: 5, count: data.questionStats.grade5Questions },
    { grade: 6, count: data.questionStats.grade6Questions },
    { grade: 7, count: data.questionStats.grade7Questions },
    { grade: 8, count: data.questionStats.grade8Questions },
    { grade: 9, count: data.questionStats.grade9Questions },
    { grade: 10, count: data.questionStats.grade10Questions },
    { grade: 11, count: data.questionStats.grade11Questions },
    { grade: 12, count: data.questionStats.grade12Questions },
  ];

  const postItems = [
    { label: "Bài viết hoạt động", value: data.postStats.activePosts, color: "#0F6E56" },
    { label: "Bài viết không hoạt động", value: data.postStats.inactivePosts, color: "#E24B4A" },
  ];

  const contestItems = [
    { label: "Đang diễn ra", value: data.contestStats.runningContests, color: "#0F6E56" },
    { label: "Sắp diễn ra", value: data.contestStats.upcomingContests, color: "#378ADD" },
    { label: "Đã kết thúc", value: data.contestStats.endedContests, color: "#888780" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Khóa học"
          icon={BookOpen}
          color="purple"
          value={fmt(data.courseStats.totalCourses)}
          desc={``}
        />
        <StatCard label="Bài viết" icon={FileText} color="teal" value={fmt(data.postStats.totalPosts)} desc={``} />
        <StatCard
          label="Câu hỏi"
          icon={HelpCircle}
          color="coral"
          value={fmt(data.questionStats.totalQuestions)}
          desc="Lớp 3 - 12"
        />
        <StatCard
          label="Cuộc thi"
          icon={Trophy}
          color="amber"
          value={fmt(data.contestStats.totalContests)}
          desc={`${data.contestStats.runningContests} đang diễn ra · ${data.contestStats.upcomingContests} sắp diễn ra`}
        />
        <StatCard
          label="Trò chơi"
          icon={Gamepad2}
          color="pink"
          value={fmt(data.gameStats.totalGames)}
          desc={`${data.gameStats.publishedGames} đã xuất bản`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Khóa học theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={courseChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {courseChartData.map((_, i) => (
                    <Cell key={i} fill={MONTH_COLORS[i % MONTH_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Câu hỏi theo lớp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <GradeBars data={gradeData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Bài viết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DonutChart items={postItems} size={120} />
            <DonutLegend items={postItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Cuộc thi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DonutChart items={contestItems} size={120} />
            <DonutLegend items={contestItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}

export function ManagerDashboard() {
  const { data, isLoading, isError } = useGetManagerStats();

  return (
    <>
      <Header />
      <Main className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bảng điều khiển quản lý</h1>
          <p className="text-md text-muted-foreground">Tổng quan thống kê hệ thống</p>
        </div>

        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : isError ? (
          <div>Lỗi khi tải dữ liệu</div>
        ) : (
          <DashboardContent data={data} />
        )}
      </Main>
    </>
  );
}
