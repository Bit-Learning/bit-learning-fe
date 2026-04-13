import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Main } from "@/layout/main";
import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import { BookOpen, FileText, HelpCircle, Trophy, Gamepad2 } from "lucide-react";
import type {
	ManagerDashboardStats,
	GradeCount,
} from "../types/dashboard.types";
import { Header } from "@/layout/header";
// import { useManagerDashboard } from "../queries/useManagerDashboard";

const MOCK_DATA: ManagerDashboardStats = {
	courses: {
		totalCourses: 248,
		newCoursesThisMonth: 12,
		activeCourses: 198,
		monthlyNewCourses: [
			{ month: 1, count: 8 },
			{ month: 2, count: 11 },
			{ month: 3, count: 6 },
			{ month: 4, count: 14 },
			{ month: 5, count: 9 },
			{ month: 6, count: 17 },
			{ month: 7, count: 12 },
			{ month: 8, count: 20 },
			{ month: 9, count: 15 },
			{ month: 10, count: 18 },
			{ month: 11, count: 22 },
			{ month: 12, count: 12 },
		],
	},
	posts: { totalPosts: 1042, activePosts: 876, bannedPosts: 166 },
	questions: {
		totalQuestions: 3841,
		byGrade: [
			{ grade: 3, count: 210 },
			{ grade: 4, count: 245 },
			{ grade: 5, count: 280 },
			{ grade: 6, count: 390 },
			{ grade: 7, count: 420 },
			{ grade: 8, count: 460 },
			{ grade: 9, count: 510 },
			{ grade: 10, count: 380 },
			{ grade: 11, count: 470 },
			{ grade: 12, count: 476 },
		],
	},
	contests: {
		totalContests: 34,
		ongoingContests: 3,
		upcomingContests: 8,
		endedContests: 23,
	},
	games: { totalGames: 89, totalPlays: 14230 },
};

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
				<span className={`text-xs font-semibold tracking-wide ${s.label}`}>
					{label}
				</span>
				<div className={`rounded-lg p-1.5 ${s.icon}`}>
					<Icon className="h-4 w-4" />
				</div>
			</div>
			<div className={`text-2xl font-bold mb-1 ${s.value}`}>{value}</div>
			<div className={`text-xs ${s.desc}`}>{desc}</div>
		</div>
	);
}

function GradeBars({ data }: { data: GradeCount[] }) {
	const max = Math.max(...data.map((d) => d.count), 1);
	return (
		<div className="space-y-2.5">
			{data.map((d, i) => (
				<div key={d.grade} className="flex items-center gap-3">
					<span className="text-xs text-gray-500 w-12 text-right shrink-0">
						Lớp {d.grade}
					</span>
					<div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
						<div
							className="h-full rounded-full transition-all duration-700"
							style={{
								width: `${Math.round((d.count / max) * 100)}%`,
								background: GRADE_COLORS[i % GRADE_COLORS.length],
							}}
						/>
					</div>
					<span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-10 shrink-0">
						{d.count}
					</span>
				</div>
			))}
		</div>
	);
}

function DonutLegend({
	items,
}: {
	items: { label: string; value: number; color: string }[];
}) {
	const total = items.reduce((s, i) => s + i.value, 0);
	return (
		<div className="space-y-2.5">
			{items.map((item) => (
				<div key={item.label} className="flex items-center gap-2">
					<span
						className="w-2.5 h-2.5 rounded-sm shrink-0"
						style={{ background: item.color }}
					/>
					<span className="text-xs text-gray-500 flex-1">{item.label}</span>
					<span className="text-xs font-medium text-gray-800 dark:text-gray-200">
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
	const cx = size / 2,
		cy = size / 2,
		r = size * 0.38,
		inner = size * 0.24;
	let angle = -Math.PI / 2;
	const paths: { d: string; color: string; label: string }[] = [];

	items.forEach((item) => {
		const sweep = (item.value / total) * 2 * Math.PI;
		const x1 = cx + r * Math.cos(angle),
			y1 = cy + r * Math.sin(angle);
		angle += sweep;
		const x2 = cx + r * Math.cos(angle),
			y2 = cy + r * Math.sin(angle);
		const xi1 = cx + inner * Math.cos(angle - sweep),
			yi1 = cy + inner * Math.sin(angle - sweep);
		const xi2 = cx + inner * Math.cos(angle),
			yi2 = cy + inner * Math.sin(angle);
		const large = sweep > Math.PI ? 1 : 0;
		paths.push({
			d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`,
			color: item.color,
			label: item.label,
		});
	});

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			{paths.map((p) => (
				<path
					key={p.label}
					d={p.d}
					fill={p.color}
					stroke="white"
					strokeWidth="1.5"
				/>
			))}
			<text
				x={cx}
				y={cy - 4}
				textAnchor="middle"
				fontSize="15"
				fontWeight="600"
				fill="currentColor"
			>
				{total}
			</text>
			<text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#888">
				tổng
			</text>
		</svg>
	);
}

function DashboardContent({ data }: { data: ManagerDashboardStats }) {
	const { courses, posts, questions, contests, games } = data;

	const courseChartData = courses.monthlyNewCourses.map((m) => ({
		name: `T${m.month}`,
		count: m.count,
	}));

	const postItems = [
		{ label: "Hoạt động", value: posts.activePosts, color: "#0F6E56" },
		{ label: "Bị khóa", value: posts.bannedPosts, color: "#E24B4A" },
	];

	const contestItems = [
		{
			label: "Đang diễn ra",
			value: contests.ongoingContests,
			color: "#0F6E56",
		},
		{ label: "Sắp tới", value: contests.upcomingContests, color: "#378ADD" },
		{ label: "Đã kết thúc", value: contests.endedContests, color: "#888780" },
	];

	return (
		<div className="space-y-5">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				<StatCard
					label="KHÓA HỌC"
					icon={BookOpen}
					color="purple"
					value={fmt(courses.totalCourses)}
					desc={`+${courses.newCoursesThisMonth} tháng này · ${courses.activeCourses} active`}
				/>
				<StatCard
					label="BÀI VIẾT"
					icon={FileText}
					color="teal"
					value={fmt(posts.totalPosts)}
					desc={`${posts.activePosts} hoạt động · ${posts.bannedPosts} bị khóa`}
				/>
				<StatCard
					label="CÂU HỎI"
					icon={HelpCircle}
					color="coral"
					value={fmt(questions.totalQuestions)}
					desc={`Trải đều ${questions.byGrade.length} lớp học`}
				/>
				<StatCard
					label="CUỘC THI"
					icon={Trophy}
					color="amber"
					value={fmt(contests.totalContests)}
					desc={`${contests.ongoingContests} đang diễn ra · ${contests.upcomingContests} sắp tới`}
				/>
				<StatCard
					label="GAME HỌC TẬP"
					icon={Gamepad2}
					color="pink"
					value={fmt(games.totalGames)}
					desc={`${fmt(games.totalPlays)} lượt chơi tổng`}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
				<Card className="lg:col-span-3">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Khóa học mới theo tháng
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={courseChartData} barCategoryGap="30%">
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(0,0,0,.05)"
									vertical={false}
								/>
								<XAxis
									dataKey="name"
									fontSize={11}
									tickLine={false}
									axisLine={false}
									tick={{ fill: "#aaa" }}
								/>
								<YAxis
									fontSize={11}
									tickLine={false}
									axisLine={false}
									tick={{ fill: "#aaa" }}
								/>
								<Tooltip
									cursor={{ fill: "rgba(83,74,183,.06)" }}
									content={({ active, payload }) => {
										if (!active || !payload?.length) return null;
										return (
											<div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md text-xs">
												<p className="text-gray-400">
													{payload[0].payload.name}
												</p>
												<p className="font-semibold text-[#534AB7]">
													{payload[0].value} khóa học
												</p>
											</div>
										);
									}}
								/>
								<Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
									{courseChartData.map((_, i) => (
										<Cell
											key={i}
											fill={MONTH_COLORS[i % MONTH_COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="lg:col-span-2">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Câu hỏi theo lớp
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<GradeBars data={questions.byGrade} />
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Trạng thái bài viết
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0 flex items-center gap-6">
						<DonutChart items={postItems} size={120} />
						<DonutLegend items={postItems} />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Trạng thái cuộc thi
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0 flex items-center gap-6">
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
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="rounded-xl border border-gray-200 p-4 space-y-2"
					>
						<Skeleton className="h-3 w-20" />
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-3 w-28" />
					</div>
				))}
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
				<Card className="lg:col-span-3">
					<CardContent className="pt-4">
						<Skeleton className="h-52 w-full" />
					</CardContent>
				</Card>
				<Card className="lg:col-span-2">
					<CardContent className="pt-4 space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-4 w-full" />
						))}
					</CardContent>
				</Card>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{[0, 1].map((i) => (
					<Card key={i}>
						<CardContent className="pt-4">
							<Skeleton className="h-32 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export function ManagerDashboard() {
	// const { data, isLoading, isError } = useManagerDashboard();

	return (
		<>
			<Header />
			<Main className="flex flex-1 flex-col gap-5 p-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Bảng điều khiển</h2>
					<p className="text-muted-foreground text-sm">
						Tổng quan hoạt động nội dung hệ thống
					</p>
				</div>

				<DashboardContent data={MOCK_DATA} />
			</Main>
		</>
	);
}
