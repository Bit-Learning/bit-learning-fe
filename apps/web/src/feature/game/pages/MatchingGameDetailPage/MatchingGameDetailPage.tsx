import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { Route } from "@/routes/matching/detail";
import type { GameSearch } from "@/feature/game/types";
import type { RootState } from "@/shared/redux/store";
import type { Comment, Game } from "@/feature/game/services/gameService";
import gameService from "@/feature/game/services/gameService";
import studentService, {
	type PlayHistoryItem,
	type UserGameAnalyticsSummary,
} from "@/feature/game/services/studentService";
import PageMeta from "@/shared/components/seo/page-meta";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const formatDuration = (duration: number) =>
	`${Math.floor(duration / 60)}m ${duration % 60}s`;

function getGameByIdErrorMessage(error: unknown): string {
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof (error as { response?: unknown }).response === "object" &&
		(error as { response?: unknown }).response !== null
	) {
		const response = (error as { response: { status?: number } }).response;
		if (response.status === 404) {
			return "Game không tồn tại hoặc chưa được xuất bản";
		}
		if (response.status === 403) {
			return "Bạn không có quyền xem game này";
		}
	}
	return "Không thể tải thông tin game. Vui lòng thử lại.";
}

export default function MatchingGameDetailPage() {
	const navigate = useNavigate();
	const { gameId, grade, topic } = Route.useSearch() as GameSearch;
	const auth = useSelector((state: RootState) => state.auth);
	const userId = auth.userInfo?.id ?? null;
	const username = auth.userInfo?.username ?? null;

	const [game, setGame] = useState<Game | null>(null);
	const [isLiked, setIsLiked] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [historyItems, setHistoryItems] = useState<PlayHistoryItem[]>([]);
	const [historyStats, setHistoryStats] =
		useState<UserGameAnalyticsSummary | null>(null);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentText, setCommentText] = useState("");
	const [replyTo, setReplyTo] = useState<number | null>(null);
	const [replyText, setReplyText] = useState("");

	// Validate params
	const hasInvalidParams =
		gameId === undefined && (grade === undefined || topic === undefined);

	// Load game info
	const loadGame = useCallback(async () => {
		if (hasInvalidParams || gameId === undefined) return;

		setLoading(true);
		setError(null);
		try {
			const gameData = await gameService.getGameById(gameId);
			setGame(gameData);

			const [commentsData] = await Promise.all([
				gameService.getComments(gameId),
			]);
			setComments(commentsData);

			if (username) {
				const likeStatus = await gameService.checkLikeStatus(gameId, username);
				setIsLiked(likeStatus);
			}
		} catch (err) {
			setError(getGameByIdErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [gameId, username, hasInvalidParams]);

	useEffect(() => {
		void loadGame();
	}, [loadGame]);

	// Load play history independently
	const loadHistory = useCallback(async () => {
		if (!userId || gameId === undefined) return;

		setHistoryLoading(true);
		try {
			const [historyData, analyticsData] = await Promise.all([
				studentService.getStudentGamePlayHistory(userId, gameId, 0, 6),
				studentService.getStudentGameAnalytics(userId, gameId),
			]);
			setHistoryItems(historyData.content ?? []);
			setHistoryStats(analyticsData);
		} catch {
			setHistoryItems([]);
			setHistoryStats(null);
		} finally {
			setHistoryLoading(false);
		}
	}, [userId, gameId]);

	useEffect(() => {
		void loadHistory();
	}, [loadHistory]);

	const handleLike = async () => {
		if (!username) {
			alert("Vui lòng đăng nhập để thích game!");
			return;
		}
		if (!game) return;

		const prevLiked = isLiked;
		const prevLikes = game.likes ?? 0;

		try {
			const response = await gameService.toggleLike(game.id, username);
			setGame({ ...game, likes: response.totalLikes });
			setIsLiked(response.isLiked);
		} catch {
			// Revert on failure
			setIsLiked(prevLiked);
			setGame({ ...game, likes: prevLikes });
		}
	};

	const handleFocusMode = () => {
		navigate({
			to: "/matching/game",
			search: { gameId, grade, topic },
		});
	};

	const handleAddComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username || !game || !commentText.trim()) return;
		try {
			await gameService.addComment({
				gameId: game.id,
				username,
				content: commentText,
				parentCommentId: null,
			});
			setCommentText("");
			setComments(await gameService.getComments(game.id));
		} catch {
			// silently ignore
		}
	};

	const handleAddReply = async (parentId: number) => {
		if (!username || !game || !replyText.trim()) return;
		try {
			await gameService.addComment({
				gameId: game.id,
				username,
				content: replyText,
				parentCommentId: parentId,
			});
			setReplyText("");
			setReplyTo(null);
			setComments(await gameService.getComments(game.id));
		} catch {
			// silently ignore
		}
	};

	// Invalid params error state
	if (hasInvalidParams) {
		return (
			<div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white">
				<PageMeta
					title="Liên kết không hợp lệ"
					description="Liên kết matching game không hợp lệ."
				/>
				<div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
					<div className="w-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center shadow-sm">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300">
							<span className="material-symbols-outlined text-3xl">
								warning
							</span>
						</div>
						<h1 className="text-2xl font-bold tracking-tight">
							Liên kết không hợp lệ
						</h1>
						<p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
							Liên kết matching game không hợp lệ.
						</p>
						<div className="mt-6">
							<button
								type="button"
								onClick={() => navigate({ to: "/games" })}
								className="rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
							>
								Quay lại
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (loading) {
		return <Loader />;
	}

	// API error state
	if (error) {
		return (
			<div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white">
				<PageMeta title="Không thể tải game" description={error} />
				<div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
					<div className="w-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center shadow-sm">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300">
							<span className="material-symbols-outlined text-3xl">
								warning
							</span>
						</div>
						<h1 className="text-2xl font-bold tracking-tight">
							Không thể tải game
						</h1>
						<p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
							{error}
						</p>
						<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
							<button
								type="button"
								onClick={() => navigate({ to: "/games" })}
								className="rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
							>
								Quay lại trung tâm trò chơi
							</button>
							<button
								type="button"
								onClick={() => void loadGame()}
								className="rounded-xl border border-slate-200 dark:border-white/10 px-6 py-3 font-bold transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
							>
								Thử lại
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!game) return null;

	const thumbnailSrc = game.thumbnailFullUrl ?? game.thumbnailUrl ?? null;

	return (
		<div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white">
			<PageMeta
				title={`${game.title} - Matching Game`}
				description={
					game.description || "Chi tiết matching game trên Bit Learning."
				}
				image={thumbnailSrc ?? undefined}
			/>

			<div className="mx-auto max-w-4xl px-4 py-10">
				{/* Back button */}
				<button
					type="button"
					onClick={() => navigate({ to: "/games" })}
					className="mb-8 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
				>
					<span>←</span>
					<span>Quay lại trung tâm trò chơi</span>
				</button>

				<div className="grid gap-8 lg:grid-cols-5">
					{/* Left: Thumbnail */}
					<div className="lg:col-span-2">
						<div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 aspect-video flex items-center justify-center">
							{thumbnailSrc ? (
								<img
									src={thumbnailSrc}
									alt={game.title}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
									<span className="material-symbols-outlined text-5xl">
										sports_esports
									</span>
									<span className="text-sm">Không có ảnh</span>
								</div>
							)}
						</div>

						{/* Views & Likes */}
						<div className="mt-4 flex items-center gap-3">
							<div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3">
								<Eye className="h-5 w-5 text-slate-500 dark:text-slate-400" />
								<span className="font-bold">{game.views ?? 0}</span>
								<span className="text-sm text-slate-500 dark:text-slate-400">
									lượt xem
								</span>
							</div>

							<button
								type="button"
								onClick={() => void handleLike()}
								className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold transition-all ${
									isLiked
										? "border-rose-400/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
										: "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
								}`}
							>
								<Heart
									className={`h-5 w-5 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`}
								/>
								<span>{game.likes ?? 0}</span>
								<span className="text-sm opacity-70">thích</span>
							</button>
						</div>
					</div>

					{/* Right: Info & Actions */}
					<div className="lg:col-span-3 flex flex-col gap-6">
						<div>
							<h1 className="text-3xl font-bold leading-tight">{game.title}</h1>
							{game.description && (
								<p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
									{game.description}
								</p>
							)}
							{game.category && (
								<div className="mt-4">
									<span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
										{game.category.name}
									</span>
								</div>
							)}
						</div>

						{/* Focus mode button */}
						<button
							type="button"
							onClick={handleFocusMode}
							className="w-full rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/30 hover:shadow-xl active:scale-[0.98]"
						>
							▶ Mở chế độ tập trung
						</button>
					</div>
				</div>

				{/* Play History Section */}
				<section className="mt-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
					<div className="mb-4">
						<p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-200/80">
							Hoạt động của bạn
						</p>
						<h2 className="mt-1 text-xl font-bold">Lịch sử chơi</h2>
					</div>

					{!userId ? (
						<div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-black/20 px-6 py-10 text-center">
							<p className="font-semibold text-slate-700 dark:text-white">
								Đăng nhập để xem lịch sử chơi cá nhân
							</p>
							<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
								Mỗi lần chơi sẽ được lưu lại cùng độ chính xác và trạng thái
								hoàn thành.
							</p>
						</div>
					) : historyLoading ? (
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/6"
								/>
							))}
						</div>
					) : historyItems.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-black/20 px-6 py-10 text-center text-slate-500 dark:text-slate-400">
							Bạn chưa có lượt chơi nào được ghi nhận cho game này.
						</div>
					) : (
						<>
							{historyStats && (
								<div className="mb-4 flex flex-wrap gap-3 text-sm">
									<span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1">
										Tổng lượt chơi:{" "}
										<strong>{historyStats.totalAttempts}</strong>
									</span>
									<span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1">
										Độ chính xác TB:{" "}
										<strong>{historyStats.averageAccuracy}%</strong>
									</span>
									{historyStats.lastPlayedAt && (
										<span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1">
											Lần cuối:{" "}
											<strong>
												{new Date(historyStats.lastPlayedAt).toLocaleDateString(
													"vi-VN",
												)}
											</strong>
										</span>
									)}
								</div>
							)}

							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{historyItems.map((item) => (
									<div
										key={item.id}
										className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4"
									>
										<div className="flex items-start justify-between gap-2">
											<div className="text-sm font-semibold">
												{new Date(item.playedAt).toLocaleString("vi-VN")}
											</div>
											<span
												className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
													item.completed
														? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
														: "bg-amber-500/15 text-amber-600 dark:text-amber-300"
												}`}
											>
												{item.completed ? "Hoàn thành" : "Chưa hoàn thành"}
											</span>
										</div>

										<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
											<div className="rounded-xl bg-white dark:bg-white/5 p-2.5">
												<div className="text-xs text-slate-500 dark:text-slate-400">
													Độ chính xác
												</div>
												<div className="mt-0.5 font-bold">
													{item.accuracy ?? 0}%
												</div>
											</div>
											<div className="rounded-xl bg-white dark:bg-white/5 p-2.5">
												<div className="text-xs text-slate-500 dark:text-slate-400">
													Thời gian
												</div>
												<div className="mt-0.5 font-bold">
													{formatDuration(item.duration ?? 0)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					)}
				</section>

				{/* Comments Section */}
				<section className="mt-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
					<h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
						<MessageCircle className="h-5 w-5" />
						Bình luận ({comments.length})
					</h2>

					{username ? (
						<form onSubmit={(e) => void handleAddComment(e)} className="mb-8">
							<textarea
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								placeholder="Chia sẻ suy nghĩ của bạn..."
								className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
								rows={3}
							/>
							<div className="mt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setCommentText("")}
									className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
								>
									Hủy
								</button>
								<button
									type="submit"
									className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
								>
									Đăng bình luận
								</button>
							</div>
						</form>
					) : (
						<div className="mb-8 rounded-2xl border border-dashed border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-black/20 px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
							Đăng nhập để bình luận
						</div>
					)}

					<div className="space-y-4">
						{comments
							.filter((c) => !c.parentCommentId)
							.map((comment) => (
								<div
									key={comment.id}
									className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4"
								>
									<div className="flex items-start gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
											{comment.username.charAt(0).toUpperCase()}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-sm font-semibold">
													{comment.username}
												</span>
												<span className="text-xs text-slate-400">
													{new Date(comment.datePosted).toLocaleDateString(
														"vi-VN",
													)}
												</span>
											</div>
											<p className="text-sm text-slate-700 dark:text-slate-300">
												{comment.content}
											</p>
											{username && (
												<button
													type="button"
													onClick={() =>
														setReplyTo(
															replyTo === comment.id ? null : comment.id,
														)
													}
													className="mt-2 text-xs font-semibold text-primary hover:text-primary/80"
												>
													Trả lời
												</button>
											)}
											{replyTo === comment.id && (
												<div className="mt-3">
													<textarea
														value={replyText}
														onChange={(e) => setReplyText(e.target.value)}
														placeholder="Viết phản hồi..."
														className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
														rows={2}
													/>
													<div className="mt-2 flex gap-2">
														<button
															type="button"
															onClick={() => void handleAddReply(comment.id)}
															className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
														>
															Đăng
														</button>
														<button
															type="button"
															onClick={() => {
																setReplyTo(null);
																setReplyText("");
															}}
															className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5"
														>
															Hủy
														</button>
													</div>
												</div>
											)}
											{comments
												.filter((r) => r.parentCommentId === comment.id)
												.map((reply) => (
													<div
														key={reply.id}
														className="mt-3 ml-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3"
													>
														<div className="flex items-center gap-2 mb-1">
															<span className="text-xs font-semibold">
																{reply.username}
															</span>
															<span className="text-xs text-slate-400">
																{new Date(reply.datePosted).toLocaleDateString(
																	"vi-VN",
																)}
															</span>
														</div>
														<p className="text-sm text-slate-700 dark:text-slate-300">
															{reply.content}
														</p>
													</div>
												))}
										</div>
									</div>
								</div>
							))}
						{comments.length === 0 && (
							<div className="py-10 text-center text-sm text-slate-400">
								Chưa có bình luận nào. Hãy là người đầu tiên!
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
