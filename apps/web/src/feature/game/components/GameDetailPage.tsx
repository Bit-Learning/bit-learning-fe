import PageMeta from "@/shared/components/seo/page-meta";
import {
	Clock3,
	Eye,
	Heart,
	ListChecks,
	MessageCircle,
	TrendingUp,
	TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import type { Comment, Game } from "../services/gameService";
import gameService from "../services/gameService";
import studentService, {
	type PlayHistoryDetail,
	type PlayHistoryItem,
	type UserGameAnalyticsSummary,
} from "../services/studentService";
import PlayHistoryDetailModal from "./PlayHistoryDetailModal";
import TrackedGameFrame from "./TrackedGameFrame";
import { Navbar } from "./Navbar/Navbar";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import Footer from "./Footer";

interface GameDetailPageProps {
	id: number;
}

export default function GameDetailPage({ id }: GameDetailPageProps) {
	const navigate = useNavigate();
	const auth = useSelector((state: RootState) => state.auth);
	const currentUserId = auth.userInfo?.id ?? null;
	const username = auth.userInfo?.username ?? null;
	const userEmail = auth.userInfo?.email ?? null;
	const currentUserAvatar = auth.userInfo?.avatar ?? null;

	const [detailGame, setDetailGame] = useState<Game | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentText, setCommentText] = useState("");
	const [replyTo, setReplyTo] = useState<number | null>(null);
	const [replyText, setReplyText] = useState("");
	const [brokenAvatarKeys, setBrokenAvatarKeys] = useState<
		Record<string, boolean>
	>({});
	const [isLiked, setIsLiked] = useState(false);
	const [loading, setLoading] = useState(true);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historyStats, setHistoryStats] =
		useState<UserGameAnalyticsSummary | null>(null);
	const [historyItems, setHistoryItems] = useState<PlayHistoryItem[]>([]);
	const [selectedHistory, setSelectedHistory] =
		useState<PlayHistoryItem | null>(null);
	const [selectedHistoryDetail, setSelectedHistoryDetail] =
		useState<PlayHistoryDetail | null>(null);
	const [historyDetailLoading, setHistoryDetailLoading] = useState(false);

	const loadGameDetail = useCallback(async () => {
		try {
			setLoading(true);

			const gameData = await gameService.getGameById(id);
			setDetailGame(gameData);

			const commentsData = await gameService.getComments(id);
			setComments(commentsData);

			if (username) {
				const likeStatus = await gameService.checkLikeStatus(id, username);
				setIsLiked(likeStatus);
			} else {
				setIsLiked(false);
			}
		} catch (e) {
			console.error("Failed to load game details", e);
		} finally {
			setLoading(false);
		}
	}, [id, username]);

	useEffect(() => {
		loadGameDetail();
	}, [loadGameDetail]);

	const loadCurrentUserGameHistory = useCallback(async () => {
		if (!currentUserId) {
			setHistoryStats(null);
			setHistoryItems([]);
			return;
		}

		try {
			setHistoryLoading(true);
			const [stats, history] = await Promise.all([
				studentService.getStudentGameAnalytics(currentUserId, id),
				studentService.getStudentGamePlayHistory(currentUserId, id, 0, 6),
			]);
			setHistoryStats(stats);
			setHistoryItems(history.content ?? []);
		} catch (error) {
			console.error("Failed to load game play history", error);
			setHistoryStats(null);
			setHistoryItems([]);
		} finally {
			setHistoryLoading(false);
		}
	}, [currentUserId, id]);

	useEffect(() => {
		void loadCurrentUserGameHistory();
	}, [loadCurrentUserGameHistory]);

	const handleLike = async () => {
		if (!username) {
			alert("Vui lòng đăng nhập để thích game!");
			return;
		}
		if (!detailGame) return;
		try {
			const response = await gameService.toggleLike(detailGame.id, username);
			setDetailGame({ ...detailGame, likes: response.totalLikes });
			setIsLiked(response.isLiked);
		} catch (e) {
			console.error("Failed to like", e);
		}
	};

	const handleAddComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username) {
			alert("Vui lòng đăng nhập để bình luận!");
			return;
		}
		if (!detailGame || !commentText.trim()) return;

		try {
			await gameService.addComment({
				gameId: detailGame.id,
				username: username,
				content: commentText,
				parentCommentId: null,
			});
			setCommentText("");
			const commentsData = await gameService.getComments(detailGame.id);
			setComments(commentsData);
		} catch (e) {
			console.error("Failed to add comment", e);
		}
	};

	const handleAddReply = async (parentId: number) => {
		if (!username) {
			alert("Vui lòng đăng nhập để trả lời!");
			return;
		}
		if (!detailGame || !replyText.trim()) return;

		try {
			await gameService.addComment({
				gameId: detailGame.id,
				username: username,
				content: replyText,
				parentCommentId: parentId,
			});
			setReplyText("");
			setReplyTo(null);
			const commentsData = await gameService.getComments(detailGame.id);
			setComments(commentsData);
		} catch (e) {
			console.error("Failed to add reply", e);
		}
	};

	const handlePlayGame = () => {
		if (detailGame) {
			navigate({
				to: "/games/$id/play",
				params: { id: String(detailGame.id) },
			});
		}
	};

	const openHistoryDetail = async (item: PlayHistoryItem) => {
		if (!currentUserId) return;
		setSelectedHistory(item);
		setSelectedHistoryDetail(null);
		setHistoryDetailLoading(true);
		try {
			const detail = await studentService.getStudentPlayHistoryDetail(
				currentUserId,
				item.id,
			);
			setSelectedHistoryDetail(detail);
		} catch (error) {
			console.error("Failed to load play history detail", error);
		} finally {
			setHistoryDetailLoading(false);
		}
	};

	if (loading) {
		return <Loader />;
	}

	if (!detailGame) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
				<div className="text-center">
					<div className="text-6xl mb-6">🎮</div>
					<p className="text-2xl font-bold text-gray-400 mb-2">
						Không tìm thấy game
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/games" })}
						className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors"
					>
						← Quay lại danh sách game
					</button>
				</div>
			</div>
		);
	}

	const topLevelComments = comments.filter((c) => !c.parentCommentId);
	const getReplies = (parentId: number) =>
		comments.filter((c) => c.parentCommentId === parentId);
	const getCommentAvatarKey = (comment: Comment) => {
		return String(
			comment.id ??
				comment.author?.id ??
				comment.author?.username ??
				comment.author?.email ??
				comment.username,
		).toLowerCase();
	};
	const getCommentDisplayName = (comment: Comment) => {
		const fullName =
			`${comment.author?.firstName ?? ""} ${comment.author?.lastName ?? ""}`.trim();
		return fullName || comment.username;
	};
	const getCommentInitials = (comment: Comment) => {
		const firstName = comment.author?.firstName?.trim() ?? "";
		const lastName = comment.author?.lastName?.trim() ?? "";

		if (firstName || lastName) {
			return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
		}

		return comment.username.charAt(0).toUpperCase();
	};
	const getCommentAvatarSrc = (comment: Comment) => {
		const normalizedCommentUsername = comment.username.trim().toLowerCase();
		const isCurrentUser =
			(username &&
				normalizedCommentUsername === username.trim().toLowerCase()) ||
			(userEmail &&
				normalizedCommentUsername === userEmail.trim().toLowerCase());

		if (isCurrentUser && currentUserAvatar) {
			return currentUserAvatar;
		}

		return comment.author?.avatar ?? comment.avatar ?? null;
	};
	const renderCommentAvatar = (
		comment: Comment,
		sizeClassName: string,
		fallbackClassName: string,
	) => {
		const avatarSrc = getCommentAvatarSrc(comment);
		const avatarKey = getCommentAvatarKey(comment);

		if (avatarSrc && !brokenAvatarKeys[avatarKey]) {
			return (
				<img
					src={avatarSrc}
					alt={getCommentDisplayName(comment)}
					className={`${sizeClassName} rounded-full object-cover shrink-0`}
					onError={() =>
						setBrokenAvatarKeys((prev) => ({
							...prev,
							[avatarKey]: true,
						}))
					}
				/>
			);
		}

		return (
			<div
				className={`${sizeClassName} rounded-full flex items-center justify-center font-bold shrink-0 ${fallbackClassName}`}
			>
				{getCommentInitials(comment)}
			</div>
		);
	};

	const formatDuration = (duration: number) =>
		`${Math.floor(duration / 60)}m ${duration % 60}s`;
	const resolvedScoringModel =
		historyStats?.scoringModel ?? detailGame.scoringModel ?? "FINITE_SCORE";
	const isFiniteScore = resolvedScoringModel === "FINITE_SCORE";
	const isHighScore = resolvedScoringModel === "HIGH_SCORE";
	const isNoScore = resolvedScoringModel === "NO_SCORE";

	return (
		<div className="min-h-screen bg-[#12080a] text-white">
			<PageMeta
				title={`${detailGame.title} - Bit Learning Game Center`}
				description={
					detailGame.description ||
					"Chi tiết trò chơi học tập trên Bit Learning Game Center."
				}
				image={detailGame.thumbnailFullUrl ?? detailGame.thumbnailUrl}
			/>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link
				rel="preconnect"
				href="https://fonts.gstatic.com"
				crossOrigin="anonymous"
			/>
			<link
				href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap"
				rel="stylesheet"
			/>
			<link
				href="https://fonts.googleapis.com/icon?family=Material+Icons"
				rel="stylesheet"
			/>
			<Navbar />

			<div className="min-h-screen max-w-7xl mx-auto px-6 py-16 mt-10">
				<button
					type="button"
					onClick={() => navigate({ to: "/games" })}
					className="mb-10 bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
				>
					← Quay lại
				</button>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Game Player */}
					<div className="lg:col-span-2">
						<TrackedGameFrame
							game={detailGame}
							username={username}
							variant="embedded"
							className="aspect-video rounded-lg shadow-2xl"
							iframeClassName="h-full w-full border-none bg-black"
						/>

						<div className="mt-6 mb-6 flex items-center gap-4">
							<button
								type="button"
								onClick={handlePlayGame}
								className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
							>
								▶ Mở chế độ tập trung
							</button>

							<button
								type="button"
								onClick={handleLike}
								className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
									isLiked
										? "bg-red-600 hover:bg-red-700 text-white"
										: "bg-gray-800 hover:bg-gray-700 text-white"
								}`}
							>
								<Heart className={`w-5 h-5 ${isLiked ? "fill-white" : ""}`} />
								<span>{detailGame.likes || 0}</span>
							</button>

							<div className="bg-gray-800 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
								<Eye className="w-5 h-5" />
								<span>{detailGame.views || 0}</span>
							</div>
						</div>

						{/* <div className="mb-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
								Cách game được chấm và theo dõi
							</p>
							<div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-200">
								<span className="rounded-full bg-white/8 px-3 py-1">
									{detailGame.isScored === false ? "Không điểm" : "Có điểm"}
								</span>
								<span className="rounded-full bg-white/8 px-3 py-1">
									{isFiniteScore
										? "Điểm trên tổng điểm"
										: isHighScore
											? "Điểm kỷ lục"
											: "Mức độ tham gia"}
								</span>
							</div>
						</div> */}

						{!isNoScore && (
							<section className="rounded-[28px] border border-white/10 bg-linear-to-br from-white/8 via-white/4 to-transparent p-6 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-sm">
								<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
											Hoạt động của bạn
										</p>
										<h2 className="mt-2 text-2xl font-bold">
											Mức độ tham gia chơi trong game này
										</h2>
										<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
											{isFiniteScore
												? "Xem lại các lần chơi gần đây, mức độ hoàn thành và những lần sai/hết giờ để biết chính xác bạn đang vướng ở đâu."
												: isHighScore
													? "Theo dõi điểm số, thời lượng và các lượt chơi nổi bật để xem tiến bộ của bạn theo thời gian."
													: "Theo dõi mức độ tham gia, thời lượng và số phiên chơi cho dạng game không chấm điểm."}
										</p>
									</div>
									{historyStats?.lastPlayedAt ? (
										<div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
											Lần chơi gần nhất:{" "}
											<span className="font-semibold text-white">
												{new Date(historyStats.lastPlayedAt).toLocaleString(
													"vi-VN",
												)}
											</span>
										</div>
									) : null}
								</div>

								{!currentUserId ? (
									<div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center">
										<p className="text-lg font-semibold text-white">
											Đăng nhập để xem lịch sử chơi cá nhân
										</p>
										<p className="mt-2 text-sm text-slate-400">
											{isFiniteScore
												? "Khi có tài khoản, mỗi lần chơi sẽ được lưu lại cùng độ chính xác, số lần hết giờ và chi tiết câu hỏi sai."
												: isHighScore
													? "Khi có tài khoản, mỗi lần chơi sẽ được lưu lại cùng điểm số, thời lượng và trạng thái hoàn thành."
													: "Khi có tài khoản, mỗi lần tương tác sẽ được lưu lại để theo dõi mức độ tham gia và hoàn thành."}
										</p>
									</div>
								) : historyLoading ? (
									<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
										{Array.from({ length: 4 }).map((_, index) => (
											<div
												key={index}
												className="h-28 animate-pulse rounded-3xl bg-white/6"
											/>
										))}
									</div>
								) : (
									<>
										<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
											<HistoryStatCard
												icon={<ListChecks className="h-5 w-5" />}
												label="Số lượt chơi"
												value={String(historyStats?.totalAttempts ?? 0)}
												subtitle={`${historyStats?.completedAttempts ?? 0} hoàn thành • ${historyStats?.partialAttempts ?? 0} chưa hoàn thành`}
											/>
											<HistoryStatCard
												icon={<TrendingUp className="h-5 w-5" />}
												label={
													isFiniteScore
														? "Độ chính xác trung bình"
														: isHighScore
															? "Điểm trung bình"
															: "Tỷ lệ hoàn thành"
												}
												value={
													isFiniteScore
														? `${historyStats?.averageAccuracy ?? 0}%`
														: isHighScore
															? String(historyStats?.averageRawScore ?? 0)
															: `${historyStats?.scoredAttemptRate ?? 0}%`
												}
												subtitle={
													isFiniteScore
														? `Tốt nhất ${historyStats?.bestAccuracy ?? 0}% • Hết giờ ${historyStats?.timeoutRate ?? 0}%`
														: isHighScore
															? `Cao nhất ${historyStats?.bestRawScore ?? 0} • Hoàn thành ${historyStats?.completionRate ?? 0}%`
															: `Hoàn thành ${historyStats?.completionRate ?? 0}% • Chưa hoàn thành ${historyStats?.partialRate ?? 0}%`
												}
											/>
											<HistoryStatCard
												icon={<Clock3 className="h-5 w-5" />}
												label="Thời lượng trung bình"
												value={formatDuration(
													historyStats?.averageDurationSeconds ?? 0,
												)}
												subtitle={`Hoàn thành ${historyStats?.completionRate ?? 0}% • Chưa hoàn thành ${historyStats?.partialRate ?? 0}%`}
											/>
											<HistoryStatCard
												icon={<TriangleAlert className="h-5 w-5" />}
												label={
													isFiniteScore
														? "Tổng câu sai / hết giờ"
														: isHighScore
															? "Điểm xếp hạng tốt nhất"
															: "Số phiên hoàn thành"
												}
												value={
													isFiniteScore
														? `${historyStats?.totalWrong ?? 0} / ${historyStats?.totalTimeout ?? 0}`
														: isHighScore
															? String(historyStats?.bestLeaderboardPoints ?? 0)
															: String(historyStats?.completedAttempts ?? 0)
												}
												subtitle={
													isFiniteScore
														? `Tổng đúng ${historyStats?.totalCorrect ?? 0} trên ${historyStats?.totalQuestions ?? 0} câu`
														: isHighScore
															? `Điểm xếp hạng TB ${historyStats?.averageLeaderboardPoints ?? 0}`
															: `Tổng phiên ${historyStats?.totalAttempts ?? 0}`
												}
											/>
										</div>

										<div className="mt-6">
											<div className="mb-3 flex items-center justify-between">
												<h3 className="text-lg font-semibold text-white">
													6 lượt chơi gần nhất
												</h3>
												<p className="text-xs uppercase tracking-[0.18em] text-slate-500">
													{isFiniteScore
														? "Bấm vào một lượt để xem chi tiết từng câu"
														: "Bấm vào một lượt để xem chi tiết phiên chơi"}
												</p>
											</div>

											{historyItems.length > 0 ? (
												<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
													{historyItems.map((item) => {
														const isCompleted = item.completed;
														return (
															<button
																type="button"
																key={item.id}
																onClick={() => void openHistoryDetail(item)}
																className="rounded-3xl border border-white/10 bg-black/20 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-black/30"
															>
																<div className="flex items-start justify-between gap-3">
																	<div>
																		<div className="text-sm font-semibold text-white">
																			{new Date(item.playedAt).toLocaleString(
																				"vi-VN",
																			)}
																		</div>
																		<div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
																			{item.attemptState ??
																				(isCompleted ? "COMPLETED" : "PARTIAL")}
																		</div>
																	</div>
																	<span
																		className={`rounded-full px-3 py-1 text-xs font-semibold ${
																			isCompleted
																				? "bg-emerald-500/15 text-emerald-300"
																				: "bg-amber-500/15 text-amber-300"
																		}`}
																	>
																		{isCompleted
																			? "Hoàn thành"
																			: "Chưa hoàn thành"}
																	</span>
																</div>

																<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
																	<div className="rounded-2xl bg-white/5 p-3">
																		<div className="text-slate-400">
																			{isFiniteScore
																				? "Độ chính xác"
																				: isHighScore
																					? "Điểm"
																					: "Theo dõi"}
																		</div>
																		<div className="mt-1 text-lg font-bold text-white">
																			{isFiniteScore
																				? `${item.accuracy ?? 0}%`
																				: isHighScore
																					? String(item.rawScore ?? 0)
																					: item.completed
																						? "Đã lưu"
																						: "Chưa hoàn thành"}
																		</div>
																	</div>
																	<div className="rounded-2xl bg-white/5 p-3">
																		<div className="text-slate-400">
																			Thời gian
																		</div>
																		<div className="mt-1 text-lg font-bold text-white">
																			{formatDuration(item.duration ?? 0)}
																		</div>
																	</div>
																</div>

																<div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
																	{isFiniteScore ? (
																		<>
																			<span className="rounded-full bg-emerald-500/10 px-3 py-1">
																				Đúng {item.correctCount ?? 0}
																			</span>
																			<span className="rounded-full bg-rose-500/10 px-3 py-1">
																				Sai {item.wrongCount ?? 0}
																			</span>
																			<span className="rounded-full bg-amber-500/10 px-3 py-1">
																				Hết giờ {item.timeoutCount ?? 0}
																			</span>
																			<span className="rounded-full bg-sky-500/10 px-3 py-1">
																				Điểm {item.score ?? 0}
																			</span>
																		</>
																	) : isHighScore ? (
																		<>
																			<span className="rounded-full bg-sky-500/10 px-3 py-1">
																				Điểm thô {item.rawScore ?? 0}
																			</span>
																			<span className="rounded-full bg-fuchsia-500/10 px-3 py-1">
																				Điểm xếp hạng{" "}
																				{item.leaderboardPoints ?? 0}
																			</span>
																		</>
																	) : (
																		<span className="rounded-full bg-white/10 px-3 py-1">
																			Đã ghi nhận tham gia
																		</span>
																	)}
																</div>
															</button>
														);
													})}
												</div>
											) : (
												<div className="rounded-3xl border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center text-slate-400">
													Bạn chưa có lượt chơi nào được ghi nhận cho game này.
												</div>
											)}
										</div>
									</>
								)}
							</section>
						)}
						{/* Developer Card */}
						{/* <section className={styles.devCard}>
							<div className={styles.devAvatarWrap}>
								<img
									src={
										"https://lh3.googleusercontent.com/aida-public/AB6AXuBvcL9d3KBBZdbSMuCars2WvZvKStbOirEGuV7elK0pT9qIj4VhyUiTthc8qg-PmCabbAWNd58NDRgn915JPpdStQ0df2kzaCIXeMFq1OOkOhy4B9r0U2haGpmt6PlTIMHWUjtqfnW5hW9chufQEPDjNuAP3Ntyg0ZW3pAAkQhArQlwb_cSSL50FN7Ao_lnk-w_oy_y59WeMikQqQxNJZK-54xt2bPKo5jcCDyYyHEaH9xvV_HQG-QA94XpxUtnV9E02GZMhXYOE6fB"
									}
									alt="avatar dev"
									className={styles.devAvatar}
								/>
							</div>
							<div className={styles.devInfo}>
								<div className={styles.devNameRow}>
									<h3 className={styles.devName}>Bit Learning</h3>
									<span className={styles.devBadge}>
										Nhà phát triển hàng đầu
									</span>
								</div>
								<p className={styles.devBio}>
									Chuyên về các trò chơi giáo dục nhịp điệu. Nhà sáng tạo chuỗi
									"Quest" với hơn 5 triệu lượt chơi.
								</p>
							</div>
							<button className={styles.followBtn}>THEO DÕI</button>
						</section> */}

						{/* Comments Section */}
						<div className="mt-8  rounded-lg p-6">
							<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
								<MessageCircle className="w-6 h-6" />
								Bình luận ({comments.length})
							</h2>

							{username ? (
								<form onSubmit={handleAddComment} className="mb-12">
									<div className="flex items-start gap-3">
										{renderCommentAvatar(
											{
												id: -1,
												gameId: detailGame.id,
												username: username,
												content: "",
												datePosted: new Date().toISOString(),
												author: auth.userInfo
													? {
															id: auth.userInfo.id,
															username: auth.userInfo.username,
															email: auth.userInfo.email,
															firstName: auth.userInfo.firstName,
															lastName: auth.userInfo.lastName,
															avatar: auth.userInfo.avatar,
														}
													: null,
											},
											"w-10 h-10",
											"bg-linear-to-br from-purple-500 to-blue-500",
										)}
										<textarea
											value={commentText}
											onChange={(e) => setCommentText(e.target.value)}
											placeholder="Chia sẻ suy nghĩ của bạn..."
											className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-white"
											rows={3}
										/>
									</div>
									<div className="flex justify-end gap-3 mt-3">
										<button
											type="submit"
											className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors"
										>
											Đăng bình luận
										</button>
										<button
											type="button"
											onClick={() => setCommentText("")}
											className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
										>
											Hủy
										</button>
									</div>
								</form>
							) : (
								<div className="mb-8 bg-[rgba(255,255,255,0.04)] rounded-lg p-6 text-center">
									<p className="text-gray-400 mb-4">Đăng nhập để bình luận</p>
								</div>
							)}

							<div className="space-y-4">
								{topLevelComments.map((comment) => (
									<div
										key={comment.id}
										className="bg-[rgba(255,255,255,0.04)] rounded-lg p-4"
									>
										<div className="flex items-start gap-3">
											{renderCommentAvatar(
												comment,
												"w-10 h-10",
												"bg-linear-to-br from-purple-500 to-blue-500",
											)}
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<p className="font-bold">
														{getCommentDisplayName(comment)}
													</p>
													<span className="text-xs text-gray-500">
														{new Date(comment.datePosted).toLocaleDateString()}
													</span>
												</div>
												<p className="text-gray-300 text-sm">
													{comment.content}
												</p>

												{username && (
													<button
														type="button"
														onClick={() => setReplyTo(comment.id)}
														className="text-xs font-bold text-red-500 hover:text-red-400 mt-2"
													>
														Trả lời
													</button>
												)}

												{replyTo === comment.id && username && (
													<div className="mt-3 bg-[rgba(255,255,255,0.04)] rounded-lg p-3">
														<textarea
															value={replyText}
															onChange={(e) => setReplyText(e.target.value)}
															placeholder="Viết phản hồi..."
															className="w-full px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-white text-sm"
															rows={2}
														/>
														<div className="flex gap-2 mt-2">
															<button
																type="button"
																onClick={() => handleAddReply(comment.id)}
																className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
															>
																Đăng
															</button>
															<button
																type="button"
																onClick={() => {
																	setReplyTo(null);
																	setReplyText("");
																}}
																className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
															>
																Hủy
															</button>
														</div>
													</div>
												)}

												{getReplies(comment.id).map((reply) => (
													<div
														key={reply.id}
														className="mt-3 ml-8 bg-gray-800 rounded-lg p-3"
													>
														<div className="flex items-start gap-2">
															{renderCommentAvatar(
																reply,
																"w-8 h-8 text-xs",
																"bg-linear-to-br from-green-500 to-teal-500",
															)}
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<p className="font-bold text-sm">
																		{getCommentDisplayName(reply)}
																	</p>
																	<span className="text-xs text-gray-500">
																		{new Date(
																			reply.datePosted,
																		).toLocaleDateString()}
																	</span>
																</div>
																<p className="text-gray-300 text-sm">
																	{reply.content}
																</p>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								))}

								{comments.length === 0 && (
									<div className="text-center py-12">
										<p className="text-gray-500">Chưa có bình luận nào</p>
										<p className="text-gray-600 text-sm mt-1">
											Hãy là người đầu tiên chia sẻ suy nghĩ!
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Sidebar */}
					<div className="space-y-6">
						<div className="bg-gray-800/50 rounded-lg p-6">
							<h2 className="text-2xl font-bold mb-4">{detailGame.title}</h2>
							<p className="text-gray-300 leading-relaxed">
								{detailGame.description ||
									detailGame.instructions ||
									"Chưa có mô tả."}
							</p>
							{detailGame.category && (
								<div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full">
									<span className="font-bold">{detailGame.category.name}</span>
								</div>
							)}
						</div>

						<div className="bg-gray-800/50 rounded-lg p-6">
							<h3 className="font-bold mb-4">Thống kê</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-400">Lượt xem</span>
									<span className="font-bold">{detailGame.views || 0}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-400">Lượt thích</span>
									<span className="font-bold">{detailGame.likes || 0}</span>
								</div>
								{/* <div className="flex justify-between">
									<span className="text-gray-400">Tạo bởi</span>
									<span className="font-bold">
										{detailGame.createdBy || "Không rõ"}
									</span>
								</div> */}
								{detailGame.dateAdded && (
									<div className="flex justify-between">
										<span className="text-gray-400">Ngày thêm</span>
										<span className="font-bold">
											{new Date(detailGame.dateAdded).toLocaleDateString()}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
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
			<Footer />
		</div>
	);
}

function HistoryStatCard({
	icon,
	label,
	value,
	subtitle,
}: {
	icon: ReactNode;
	label: string;
	value: string;
	subtitle: string;
}) {
	return (
		<div className="rounded-3xl border border-white/10 bg-black/20 p-5">
			<div className="flex items-center justify-between gap-3">
				<div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
					{label}
				</div>
				<div className="rounded-2xl bg-white/8 p-2 text-amber-300">{icon}</div>
			</div>
			<div className="mt-4 text-3xl font-bold text-white">{value}</div>
			<div className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</div>
		</div>
	);
}
