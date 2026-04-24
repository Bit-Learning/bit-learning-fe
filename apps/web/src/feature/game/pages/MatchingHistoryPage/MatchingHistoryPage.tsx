import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Clock3, Gamepad2 } from "lucide-react";
import { ThemeToggle } from "@/feature/game/components/ThemeToggle";
import PlayHistoryDetailModal from "@/feature/game/components/PlayHistoryDetailModal";
import studentService, {
	type PlayHistoryDetail,
	type PlayHistoryItem,
} from "@/feature/game/services/studentService";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import PageMeta from "@/shared/components/seo/page-meta";
import { cn } from "@workspace/ui/lib/utils";

const PAGE_SIZE = 12;

function formatDuration(duration: number) {
	if (!Number.isFinite(duration) || duration < 0) {
		return "-";
	}

	return `${Math.floor(duration / 60)}m ${duration % 60}s`;
}

export default function MatchingHistoryPage() {
	const navigate = useNavigate();
	const { isAuthenticated, userInfo } = useSelector(selectAuthStateInfo);
	const [loading, setLoading] = useState(false);
	const [historyItems, setHistoryItems] = useState<PlayHistoryItem[]>([]);
	const [clientPage, setClientPage] = useState(0);
	const [selectedHistory, setSelectedHistory] =
		useState<PlayHistoryItem | null>(null);
	const [selectedHistoryDetail, setSelectedHistoryDetail] =
		useState<PlayHistoryDetail | null>(null);
	const [historyDetailLoading, setHistoryDetailLoading] = useState(false);

	useEffect(() => {
		const userId = userInfo?.id;
		if (!isAuthenticated || !userId) {
			setHistoryItems([]);
			setClientPage(0);
			return;
		}

		let isMounted = true;
		const loadMatchingHistory = async () => {
			try {
				setLoading(true);
				const firstPage = await studentService.getStudentPlayHistory(
					userId,
					0,
					50,
				);
				const requests: ReturnType<
					typeof studentService.getStudentPlayHistory
				>[] = [];

				for (let page = 1; page < firstPage.totalPages; page += 1) {
					requests.push(studentService.getStudentPlayHistory(userId, page, 50));
				}

				const remainPages = requests.length ? await Promise.all(requests) : [];
				const allItems = [firstPage, ...remainPages].flatMap(
					(item) => item.content ?? [],
				);
				const matchingOnly = allItems
					.filter(
						(item) =>
							item.gameType === "MATCHING" || item.attemptType === "MATCHING",
					)
					.sort(
						(a, b) =>
							new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
					);

				if (!isMounted) {
					return;
				}

				setHistoryItems(matchingOnly);
				setClientPage(0);
			} catch (error) {
				console.error("Failed to load matching history", error);
				if (isMounted) {
					setHistoryItems([]);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		void loadMatchingHistory();

		return () => {
			isMounted = false;
		};
	}, [isAuthenticated, userInfo?.id]);

	const totalPages = Math.max(Math.ceil(historyItems.length / PAGE_SIZE), 1);
	const pagedItems = useMemo(
		() =>
			historyItems.slice(clientPage * PAGE_SIZE, (clientPage + 1) * PAGE_SIZE),
		[historyItems, clientPage],
	);

	const openHistoryDetail = async (item: PlayHistoryItem) => {
		if (!userInfo?.id) {
			return;
		}

		setSelectedHistory(item);
		setSelectedHistoryDetail(null);
		setHistoryDetailLoading(true);

		try {
			const detail = await studentService.getStudentPlayHistoryDetail(
				userInfo.id,
				item.id,
			);
			setSelectedHistoryDetail(detail);
		} catch (error) {
			console.error("Failed to load matching play history detail", error);
		} finally {
			setHistoryDetailLoading(false);
		}
	};

	return (
		<div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
			<PageMeta
				title="Lịch sử chơi matching - Bit Learning"
				description="Xem lại các lượt chơi game ghép cặp của bạn trên Bit Learning."
			/>

			<div className="flex flex-col min-h-screen">
				<header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
					<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<Link to="/matching/path" className="flex items-center gap-2">
								<img
									src="/Logo.png"
									alt="Bit Learning"
									className={cn(
										"object-contain transition-all duration-300 h-10",
									)}
								/>
							</Link>
							<span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400">
								Lịch sử chơi matching
							</span>
						</div>

						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={() => navigate({ to: "/matching/path" })}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
							>
								<Gamepad2 className="h-4 w-4" />
								Bài học
							</button>
							<ThemeToggle />
						</div>
					</div>
				</header>

				<main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
					<div className="mb-8">
						<h1 className="text-3xl font-extrabold tracking-tight">
							Lịch sử chơi game matching
						</h1>
						<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
							Xem lại các phiên chơi ghép cặp đã hoàn thành của bạn.
						</p>
					</div>

					{!isAuthenticated || !userInfo?.id ? (
						<div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 px-6 py-12 text-center">
							<p className="text-lg font-semibold">
								Bạn cần đăng nhập để xem lịch sử chơi.
							</p>
							<button
								type="button"
								onClick={() => navigate({ to: "/signin-role" })}
								className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
							>
								Đăng nhập ngay
							</button>
						</div>
					) : loading ? (
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className="h-48 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/60"
								/>
							))}
						</div>
					) : historyItems.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
							Bạn chưa có lượt chơi matching nào được ghi nhận.
						</div>
					) : (
						<>
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{pagedItems.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => void openHistoryDetail(item)}
										className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
									>
										<div className="aspect-video bg-slate-100 dark:bg-slate-800">
											{item.gameThumbnail ? (
												<img
													src={item.gameThumbnail}
													alt={item.gameTitle}
													className="h-full w-full object-cover"
												/>
											) : null}
										</div>
										<div className="p-4 space-y-2">
											<h3 className="line-clamp-2 text-sm font-bold">
												{item.gameTitle}
											</h3>
											<p className="text-xs text-slate-500 dark:text-slate-400">
												{new Date(item.playedAt).toLocaleString("vi-VN")}
											</p>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-slate-500">Điểm:</span>{" "}
													<span className="font-semibold">
														{item.score ?? 0}
													</span>
												</div>
												<div>
													<span className="text-slate-500">Accuracy:</span>{" "}
													<span className="font-semibold">
														{item.accuracy ?? 0}%
													</span>
												</div>
												<div className="col-span-2 flex items-center gap-1 text-slate-500">
													<Clock3 className="h-3.5 w-3.5" />
													<span>{formatDuration(item.duration ?? 0)}</span>
												</div>
											</div>
										</div>
									</button>
								))}
							</div>

							{totalPages > 1 ? (
								<div className="mt-8 flex items-center justify-center gap-3">
									<button
										type="button"
										onClick={() =>
											setClientPage((prev) => Math.max(0, prev - 1))
										}
										disabled={clientPage === 0}
										className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 disabled:opacity-40"
									>
										<ChevronLeft className="h-4 w-4" />
									</button>
									<span className="text-sm text-slate-500 dark:text-slate-400">
										Trang {clientPage + 1} / {totalPages}
									</span>
									<button
										type="button"
										onClick={() =>
											setClientPage((prev) =>
												Math.min(totalPages - 1, prev + 1),
											)
										}
										disabled={clientPage >= totalPages - 1}
										className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 disabled:opacity-40"
									>
										<ChevronRight className="h-4 w-4" />
									</button>
								</div>
							) : null}
						</>
					)}
				</main>
			</div>

			<PlayHistoryDetailModal
				open={selectedHistory !== null}
				onClose={() => {
					setSelectedHistory(null);
					setSelectedHistoryDetail(null);
				}}
				item={selectedHistory}
				detail={selectedHistoryDetail}
				loading={historyDetailLoading}
			/>
		</div>
	);
}
