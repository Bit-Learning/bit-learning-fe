import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/feature/game/components/ThemeToggle";
import { CURRICULUM_DATA } from "@/feature/game/data";
import matchingGameService from "@/feature/game/services/matchingGameService";
import ScrollToTop from "@/layouts/scroll-to-top";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import GameCard from "@/feature/game/components/GameCard";

const topicVisualMap: Record<string, { icon: string; gradient: string }> = {
	A: {
		icon: "computer",
		gradient: "from-sky-500 via-sky-400 to-cyan-400",
	},
	B: {
		icon: "public",
		gradient: "from-indigo-500 via-indigo-400 to-sky-400",
	},
	C: {
		icon: "folder_open",
		gradient: "from-amber-500 via-amber-400 to-orange-400",
	},
	D: {
		icon: "verified_user",
		gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
	},
	E: {
		icon: "apps",
		gradient: "from-emerald-500 via-emerald-400 to-teal-400",
	},
	F: {
		icon: "psychology",
		gradient: "from-purple-500 via-violet-500 to-indigo-500",
	},
};

export default function PathPage() {
	const navigate = useNavigate();

	const { data: mappings = [], isLoading: isMappingsLoading } = useQuery({
		queryKey: ["curriculum-mappings"],
		queryFn: matchingGameService.getCurriculumMappings,
	});

	// Map of "grade-topicCode" → mapping entry for O(1) lookup
	const gameMap = new Map(
		mappings.map((m) => [`${m.grade}-${m.topicCode}`, m]),
	);

	// Only render grades that have at least one live game in the DB
	const grades = CURRICULUM_DATA.grades.filter((g) =>
		g.topics.some((t) => gameMap.has(`${g.id}-${t.code}`)),
	);

	return (
		<div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
			<title>Tổng quan lộ trình</title>

			<div className="flex flex-col min-h-screen">
				{/* Header */}
				<header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
					<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div
								className="cursor-pointer"
								onClick={() => navigate({ to: "/matching" })}
							>
								<img
									src="/Logo.png"
									alt="Bit Learning"
									className={cn(
										"object-contain transition-all duration-300 h-10",
									)}
								/>
							</div>
						</div>
						<ThemeToggle />
					</div>
				</header>

				{/* Main */}
				<main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
					{isMappingsLoading && (
						<div className="flex items-center justify-center py-32 text-slate-400">
							<span className="material-symbols-outlined animate-spin mr-2">
								progress_activity
							</span>
							Đang tải danh sách bài học...
						</div>
					)}
					{!isMappingsLoading && grades.length === 0 && (
						<div className="flex items-center justify-center py-32 text-slate-400">
							Chưa có bài học nào được xuất bản.
						</div>
					)}
					{!isMappingsLoading && grades.length > 0 && (
						<>
							<div className="mb-10">
								<h2 className="text-4xl font-extrabold mb-3 tracking-tight">
									Lộ trình học Tin học 3–12
								</h2>
								<p className="text-slate-500 dark:text-slate-400 text-lg max-w-3xl">
									Lựa chọn lớp, cuộn ngang để xem các chủ đề A–F.
								</p>
							</div>

							{/* Netflix-style rows: mỗi lớp là một hàng cuộn ngang */}
							<div className="space-y-10">
								{grades.map((grade) => {
									const isPrimary = grade.id === 3;
									// Only show topics that exist in DB for this grade
									const visibleTopics = grade.topics.filter((t) =>
										gameMap.has(`${grade.id}-${t.code}`),
									);
									return (
										<section key={grade.id} className="space-y-3">
											<div className="flex items-center justify-between px-1">
												<div className="flex items-center gap-3">
													<div
														className={`size-10 rounded-md flex items-center justify-center shadow-sm ${
															isPrimary
																? "bg-primary/10 text-primary"
																: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
														}`}
													>
														<span className="material-symbols-outlined text-xl">
															school
														</span>
													</div>
													<div>
														<h3 className="text-lg font-bold flex items-center gap-2">
															{grade.label}
															{isPrimary && (
																<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
																	<span className="material-symbols-outlined text-xs">
																		star
																	</span>
																	Gợi ý bắt đầu
																</span>
															)}
														</h3>
														<p className="text-xs text-slate-500 dark:text-slate-400">
															{isPrimary
																? "Làm quen máy tính và môi trường học tập số."
																: "Các chủ đề A–F theo chương trình Tin học mới."}
														</p>
													</div>
												</div>
												<span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold hidden md:inline">
													Cuộn để xem thêm
												</span>
											</div>

											<div className="-mx-6 px-6">
												<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
													{visibleTopics.map((topic) => {
														const mapping = gameMap.get(
															`${grade.id}-${topic.code}`,
														);
														const isPlayable = !!mapping;
														const displayTitle =
															mapping?.gameTitle ?? topic.title;
														const visual = (topicVisualMap[topic.code] ??
															topicVisualMap.A)!;

														return (
															<GameCard
																key={topic.code}
																className="snap-start shrink-0"
																topicCode={topic.code}
																title={displayTitle}
																isPlayable={isPlayable}
																onClick={() => {
																	if (isPlayable) {
																		navigate({
																			to: "/matching/game",
																			search: {
																				grade: grade.id,
																				topic: topic.code,
																			},
																		});
																	}
																}}
															/>
														);
													})}
												</div>
											</div>
										</section>
									);
								})}
							</div>
						</>
					)}
				</main>

				{/* Footer */}
				<footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-background-dark">
					<div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="flex items-center gap-2 text-slate-400">
							<span className="material-symbols-outlined text-sm">school</span>
							<span className="text-sm font-medium">Bit Learning</span>
						</div>
						<div className="flex gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
							<a className="hover:text-primary transition-colors" href="/about">
								Hỗ trợ
							</a>
							<a className="hover:text-primary transition-colors" href="/terms">
								Chính sách
							</a>
						</div>
					</div>
				</footer>
			</div>
			<ScrollToTop />
		</div>
	);
}
