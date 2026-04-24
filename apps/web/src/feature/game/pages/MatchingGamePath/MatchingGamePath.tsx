import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/feature/game/components/ThemeToggle";
import { CURRICULUM_DATA } from "@/feature/game/data";
import matchingGameService from "@/feature/game/services/matchingGameService";
import ScrollToTop from "@/layouts/scroll-to-top";
import PageMeta from "@/shared/components/seo/page-meta";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import GameCard from "@/feature/game/components/GameCard";

export default function PathPage() {
	const navigate = useNavigate();

	const { data: mappings = [], isLoading: isMappingsLoading } = useQuery({
		queryKey: ["curriculum-mappings"],
		queryFn: matchingGameService.getCurriculumMappings,
	});

	const mappingsByGrade = new Map<number, typeof mappings>();
	for (const mapping of mappings) {
		const existingMappings = mappingsByGrade.get(mapping.grade) ?? [];
		existingMappings.push(mapping);
		mappingsByGrade.set(mapping.grade, existingMappings);
	}

	const grades = CURRICULUM_DATA.grades.filter(
		(g) => (mappingsByGrade.get(g.id)?.length ?? 0) > 0,
	);

	return (
		<div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
			<PageMeta
				title="Lộ trình trò chơi ghép cặp - Bit Learning"
				description="Khám phá lộ trình trò chơi ghép cặp theo từng khối lớp và chủ đề tại Bit Learning."
			/>

			<div className="flex flex-col min-h-screen">
				{/* Header */}
				<header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
					<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button
								type="button"
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
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/matching/history" })}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
							>
								<span className="material-symbols-outlined text-base">
									history
								</span>
								Lịch sử chơi
							</button>
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
									Lựa chọn lớp, cuộn ngang để xem tất cả matching game đã xuất
									bản.
								</p>
							</div>

							<div className="space-y-10">
								{grades.map((grade) => {
									const isPrimary = grade.id === 3;
									const visibleMappings = [
										...(mappingsByGrade.get(grade.id) ?? []),
									].sort(
										(left, right) =>
											left.topicCode.localeCompare(right.topicCode) ||
											left.gameTitle.localeCompare(right.gameTitle) ||
											left.gameId - right.gameId,
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
																: "Các matching game được nhóm theo khối lớp."}
														</p>
													</div>
												</div>
												<span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold hidden md:inline">
													Cuộn để xem thêm
												</span>
											</div>

											<div className="-mx-6 px-6">
												<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
													{visibleMappings.map((mapping) => {
														return (
															<GameCard
																key={mapping.gameId}
																className="snap-start shrink-0"
																topicCode={mapping.topicCode}
																title={mapping.gameTitle}
																isPlayable
																onClick={() => {
																	navigate({
																		to: "/matching/game",
																		search: {
																			gameId: mapping.gameId,
																			grade: mapping.grade,
																			topic: mapping.topicCode,
																		},
																	});
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
