import React, { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useProblems, useToggleFavorite } from "../queries/useCoding";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { DIFFICULTY_MAP, DifficultyBadge } from "./DifficultyBadge";
import { Pagination } from "@/shared/components/Pagination";
import { ProblemStatsCard } from "./ProblemStatsCard";
import { toast } from "@/shared/components/Sonner";
import HttpServerCard from "./HttpServer";
import Card from "./JSConsole";

const Tag = ({ label }: { label: string }) => (
	<span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-tight px-2 py-1 rounded">
		{label}
	</span>
);

const StudentProblemListContent: React.FC = () => {
	const [search, setSearch] = useState("");
	const [difficulty, setDifficulty] = useState("all");
	const [page, setPage] = useState(0);
	const size = 10;

	const navigate = useNavigate();

	const { data: problemsData, isLoading } = useProblems({
		page,
		size,
		sort: "createdAt,desc",
	});

	const toggleFavorite = useToggleFavorite();

	const problems = problemsData?.data || [];
	const pageInfo = problemsData?.page;
	const totalPages = pageInfo?.totalPages || 0;
	const totalElements = pageInfo?.totalElements || 0;

	const filteredProblems = problems.filter((p) => {
		const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
		const matchDifficulty = difficulty === "all" || p.difficulty === difficulty;
		return matchSearch && matchDifficulty;
	});

	const solvedCount = problems.length;
	const progressPct =
		totalElements > 0 ? Math.round((solvedCount / totalElements) * 100) : 0;

	const handleFavorite = (
		e: React.MouseEvent,
		problem: { id: string; title: string; isFavorite?: boolean },
	) => {
		e.stopPropagation();
		const willFavorite = !problem.isFavorite;
		toggleFavorite.mutate(problem.id, {
			onSuccess: () => {
				if (willFavorite) {
					toast.success({
						title: "Đã thêm vào yêu thích",
						description: problem.title,
					});
				} else {
					toast.info({
						title: "Đã xóa khỏi yêu thích",
						description: problem.title,
					});
				}
			},
		});
	};

	const handleProblemClick = (problemId: string) => {
		navigate({ to: `/problem/${problemId}` });
	};

	const handleReset = () => {
		setSearch("");
		setDifficulty("all");
		setPage(0);
	};

	if (isLoading) return <Loader />;

	return (
		<div
			className="min-h-screen relative overflow-hidden bg-slate-900"
			style={{
				backgroundImage:
					"url('https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=1600&q=80')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundAttachment: "fixed",
			}}
		>
			{/* Dark overlay so text stays readable */}
			<div className="pointer-events-none absolute inset-0 bg-slate-950/50" />

			<main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
				<div className="flex md:flex-row flex-col md:items-center justify-between gap-6">
					<div className="flex flex-col md:flex-col md:items-start justify-between gap-6">
						<div>
							<h1 className="text-4xl font-black text-slate-200 tracking-tight mb-2">
								Không gian Luyện tập
							</h1>
							<p className="text-slate-200 text-base max-w-xl">
								Rèn luyện tư duy kiến trúc thông qua các thử thách logic. Giải
								quyết, tối ưu hóa và làm chủ nghệ thuật mã hóa.
							</p>
						</div>

						<div className="flex items-center gap-4 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
							<div className="text-right">
								<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
									Bài tập đã giải
								</p>
								<p className="text-2xl font-black text-blue-600 leading-none">
									{solvedCount}{" "}
									<span className="text-slate-500 font-semibold text-lg">
										/ {totalElements}
									</span>
								</p>
							</div>
							<div className="relative w-12 h-12 shrink-0">
								<svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
									<circle
										cx="24"
										cy="24"
										r="20"
										fill="none"
										stroke="#e2e8f0"
										strokeWidth="4"
									/>
									<circle
										cx="24"
										cy="24"
										r="20"
										fill="none"
										stroke="#2563eb"
										strokeWidth="4"
										strokeDasharray={`${2 * Math.PI * 20}`}
										strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPct / 100)}`}
										strokeLinecap="round"
									/>
								</svg>
								<span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">
									{progressPct}%
								</span>
							</div>
						</div>
					</div>

					<Card />
				</div>

				<div className="bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl px-5 py-4 shadow-sm flex flex-wrap items-center gap-6">
					<div className="flex items-center gap-3">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
							Độ khó:
						</span>
						<div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
							{[
								{ value: "all", label: "Tất cả" },
								{ value: "EASY", label: "Dễ" },
								{ value: "MEDIUM", label: "Trung bình" },
								{ value: "HARD", label: "Khó" },
							].map((opt) => {
								const isActive = difficulty === opt.value;

								const colorClasses =
									opt.value === "EASY"
										? isActive
											? "bg-emerald-500 text-white shadow"
											: "text-emerald-600 hover:bg-emerald-500/10"
										: opt.value === "MEDIUM"
											? isActive
												? "bg-amber-400 text-slate-900 shadow"
												: "text-amber-600 hover:bg-amber-400/10"
											: opt.value === "HARD"
												? isActive
													? "bg-rose-500 text-white shadow"
													: "text-rose-600 hover:bg-rose-500/10"
												: isActive
													? "bg-white text-blue-600 shadow"
													: "text-slate-500 hover:text-slate-700";

								return (
									<button
										key={opt.value}
										onClick={() => {
											setDifficulty(opt.value);
											setPage(0);
										}}
										className={cn(
											"cursor-pointer px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
											colorClasses,
										)}
									>
										{opt.label}
									</button>
								);
							})}
						</div>
					</div>

					<div className="flex-1 min-w-45">
						<input
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(0);
							}}
							placeholder="Tìm kiếm bài tập..."
							className="w-full h-9 px-4 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
						/>
					</div>
				</div>

				<div className="space-y-4">
					{filteredProblems.length === 0 && (
						<div className="text-center py-16 text-slate-400 text-sm">
							Không tìm thấy bài tập nào.
						</div>
					)}

					{filteredProblems.map((problem, index) => {
						const diffCfg = DIFFICULTY_MAP[problem.difficulty] ?? {
							border: "border-l-slate-300",
						};
						return (
							<div
								key={index}
								onClick={() => handleProblemClick(problem.id)}
								className={cn(
									"group bg-white border border-slate-200/60 border-l-4 rounded-xl px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-all cursor-pointer",
									diffCfg.border,
								)}
							>
								<div className="flex-1 min-w-0">
									<div className="flex flex-wrap items-center gap-3 mb-2">
										<h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
											<button
												onClick={(e) => handleFavorite(e, problem)}
												className={cn(
													"transition-all active:scale-90",
													problem.isFavorite
														? "text-red-500 hover:text-red-400"
														: "text-slate-300 hover:text-red-400",
												)}
												title={
													problem.isFavorite
														? "Xóa khỏi yêu thích"
														: "Thêm vào yêu thích"
												}
											>
												<Heart
													className={cn(
														"w-5 h-5 transition-all",
														problem.isFavorite ? "fill-red-500" : "",
													)}
												/>
											</button>
											{problem.title}
										</h3>
										<DifficultyBadge difficulty={problem.difficulty} />
									</div>

									{problem.description && (
										<p className="text-slate-500 text-sm mb-3 line-clamp-1">
											{problem.description}
										</p>
									)}

									<div className="flex flex-wrap gap-1.5">
										{problem.tags?.map((tag) => (
											<Tag key={tag.id} label={tag.name} />
										))}
									</div>
								</div>

								<div className="flex items-center gap-8 shrink-0">
									<ProblemStatsCard problemId={problem.id} />
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleProblemClick(problem.id);
										}}
										className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2.5 rounded-md font-bold text-sm shadow transition-all"
									>
										Giải ngay
									</button>
								</div>
							</div>
						);
					})}
				</div>

				{totalPages > 1 && (
					<div className="flex justify-center pt-4">
						<Pagination
							currentPage={page}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</div>
				)}
			</main>
		</div>
	);
};

export default StudentProblemListContent;
