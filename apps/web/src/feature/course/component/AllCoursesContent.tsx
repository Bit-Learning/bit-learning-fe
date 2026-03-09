import React from "react";
import { Link } from "@tanstack/react-router";
import {
	Book,
	BookOpen,
	GraduationCap,
	Laptop,
	Code,
	Cpu,
	Terminal,
	Layers,
	Brain,
	Database,
	Network,
	Sparkles,
	CheckCircle,
	Star,
	Clock,
} from "lucide-react";
import { useCourseActions } from "../queries/useCourse";

const gradeGroups = [
	{
		name: "Tiểu học",
		subtitle: "Lớp 1 — Lớp 5",
		grades: [
			{
				number: 1,
				title: "Lớp 1",
				description: "Khóa học tin học lớp 1",
				icon: Book,
				color: "blue",
			},
			{
				number: 2,
				title: "Lớp 2",
				description: "Khóa học tin học lớp 2",
				icon: BookOpen,
				color: "blue",
			},
			{
				number: 3,
				title: "Lớp 3",
				description: "Khóa học tin học lớp 3",
				icon: GraduationCap,
				color: "blue",
			},
			{
				number: 4,
				title: "Lớp 4",
				description: "Khóa học tin học lớp 4",
				icon: Laptop,
				color: "blue",
			},
			{
				number: 5,
				title: "Lớp 5",
				description: "Khóa học tin học lớp 5",
				icon: Code,
				color: "blue",
			},
		],
		borderColor: "border-blue-500",
		bgColor: "bg-blue-50 dark:bg-blue-900/20",
		textColor: "text-blue-600",
		hoverBg: "hover:bg-blue-600",
	},
	{
		name: "THCS",
		subtitle: "Lớp 6 — Lớp 9",
		grades: [
			{
				number: 6,
				title: "Lớp 6",
				description: "Khóa học tin học lớp 6",
				icon: Cpu,
				color: "emerald",
			},
			{
				number: 7,
				title: "Lớp 7",
				description: "Khóa học tin học lớp 7",
				icon: Terminal,
				color: "emerald",
			},
			{
				number: 8,
				title: "Lớp 8",
				description: "Khóa học tin học lớp 8",
				icon: Layers,
				color: "emerald",
			},
			{
				number: 9,
				title: "Lớp 9",
				description: "Khóa học tin học lớp 9",
				icon: Brain,
				color: "emerald",
			},
		],
		borderColor: "border-emerald-500",
		bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
		textColor: "text-emerald-600",
		hoverBg: "hover:bg-emerald-600",
	},
	{
		name: "THPT",
		subtitle: "Lớp 10 — Lớp 12",
		grades: [
			{
				number: 10,
				title: "Lớp 10",
				description: "Khóa học tin học lớp 10",
				icon: Database,
				color: "orange",
			},
			{
				number: 11,
				title: "Lớp 11",
				description: "Khóa học tin học lớp 11",
				icon: Network,
				color: "orange",
			},
			{
				number: 12,
				title: "Lớp 12",
				description: "Khóa học tin học lớp 12",
				icon: Sparkles,
				color: "orange",
			},
		],
		borderColor: "border-orange-500",
		bgColor: "bg-orange-50 dark:bg-orange-900/20",
		textColor: "text-orange-600",
		hoverBg: "hover:bg-orange-600",
	},
];

const AllCoursesContent: React.FC = () => {
	const { selectGrade } = useCourseActions();

	return (
		<div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
			<div
				className="fixed inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(rgb(226 232 240) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			></div>
			<div
				className="fixed inset-0 -z-10 dark:block hidden"
				style={{
					backgroundImage:
						"radial-gradient(rgb(30 41 59) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			></div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<section className="text-center pt-4 pb-12">
					<div className="inline-flex items-center gap-2 px-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6">
						<Sparkles className="w-4 h-4" />
						<span>Học tập không giới hạn</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
						Khóa học Tin học <br className="hidden md:block" /> từ{" "}
						<span className="text-blue-600">Lớp 1</span> đến{" "}
						<span className="text-blue-600">Lớp 12</span>
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
						Chương trình học tin học toàn diện, cập nhật theo xu hướng công nghệ
						mới nhất dành cho học sinh từ Tiểu học đến THPT.
					</p>
				</section>

				<section className="space-y-16 mb-20">
					{gradeGroups.map((group) => (
						<div key={group.name} className="mb-16">
							<div className="flex items-center justify-between mb-8">
								<div className="flex items-center gap-3">
									<div
										className={`w-2 h-8 ${group.borderColor.replace("border-", "bg-")} rounded-full`}
									></div>
									<h2 className="text-2xl font-bold text-slate-900 dark:text-white">
										{group.name}
									</h2>
								</div>
								<span className="text-sm font-medium text-slate-400">
									{group.subtitle}
								</span>
							</div>

							<div
								className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${group.grades.length} gap-6`}
							>
								{group.grades.map((grade) => {
									const IconComponent = grade.icon;
									return (
										<Link
											key={grade.number}
											to="/courses/grade/$grade"
											params={{ grade: String(grade.number) }}
											onClick={() => selectGrade(grade.number)}
										>
											<div
												className={`grade-card group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 ${group.borderColor} overflow-hidden cursor-pointer`}
											>
												<div className="flex flex-col items-center text-center">
													<div
														className={`w-16 h-16 rounded-2xl ${group.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}
													>
														<IconComponent
															className={`${group.textColor} w-8 h-8`}
														/>
													</div>
													<h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">
														{grade.title}
													</h3>
													<p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
														{grade.description}
													</p>
													<button
														className={`cursor-pointer px-4 py-2 bg-slate-50 dark:bg-slate-700 ${group.hoverBg} hover:text-white transition-colors rounded-full text-xs font-semibold`}
													>
														Xem khóa học
													</button>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
						</div>
					))}
				</section>

				<section className="mt-24">
					<div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white p-12 lg:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
						<div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
						<div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>

						<div className="relative text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-extrabold mb-4">
								Tại sao chọn Bit Learning?
							</h2>
							<p className="text-slate-400 text-lg">
								Cam kết mang lại giá trị học thuật cao nhất cho học viên
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-12 text-center relative">
							<div className="space-y-6 group">
								<div className="mx-auto w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
									<CheckCircle className="w-10 h-10 text-blue-400 group-hover:text-white" />
								</div>
								<h3 className="text-xl font-bold">Chương trình chuẩn</h3>
								<p className="text-slate-400 leading-relaxed">
									Nội dung theo chương trình BGD&ĐT, phù hợp từng cấp học và
									luôn cập nhật xu hướng công nghệ.
								</p>
							</div>

							<div className="space-y-6 group">
								<div className="mx-auto w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center ring-1 ring-green-500/30 group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
									<Star className="w-10 h-10 text-green-400 group-hover:text-white" />
								</div>
								<h3 className="text-xl font-bold">Giảng viên chất lượng</h3>
								<p className="text-slate-400 leading-relaxed">
									Đội ngũ giáo viên giàu kinh nghiệm, tận tâm với học sinh và có
									phương pháp dạy hiện đại.
								</p>
							</div>

							<div className="space-y-6 group">
								<div className="mx-auto w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/30 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
									<Clock className="w-10 h-10 text-orange-400 group-hover:text-white" />
								</div>
								<h3 className="text-xl font-bold">Học mọi lúc mọi nơi</h3>
								<p className="text-slate-400 leading-relaxed">
									Video bài giảng chất lượng cao, hệ thống bài tập thực hành
									phong phú, học tập linh hoạt.
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default AllCoursesContent;
