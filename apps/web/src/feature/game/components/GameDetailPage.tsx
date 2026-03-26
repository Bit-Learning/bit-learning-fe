import { Eye, Heart, MessageCircle, Maximize } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import type { Comment, Game } from "../services/gameService";
import gameService from "../services/gameService";
import styles from "./GameDetailPage.module.css";
import { Link } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

interface GameDetailPageProps {
	id: number;
}

export default function GameDetailPage({ id }: GameDetailPageProps) {
	const navigate = useNavigate();
	const auth = useSelector((state: RootState) => state.auth);
	const username = auth.userInfo?.username ?? null;
	const role = auth.userInfo?.role ?? null;

	const [detailGame, setDetailGame] = useState<Game | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentText, setCommentText] = useState("");
	const [replyTo, setReplyTo] = useState<number | null>(null);
	const [replyText, setReplyText] = useState("");
	const [isLiked, setIsLiked] = useState(false);
	const [loading, setLoading] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const gameContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		loadGameDetail();
	}, [id]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const loadGameDetail = async () => {
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
	};

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

	const toggleFullscreen = () => {
		if (!gameContainerRef.current) return;

		if (!document.fullscreenElement) {
			gameContainerRef.current.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
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

	return (
		<div className="min-h-screen bg-[#12080a] text-white">
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

			<div className="max-w-7xl mx-auto px-6 py-16">
				<button
					onClick={() => navigate({ to: "/games" })}
					className="mb-6 bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
				>
					← Quay lại
				</button>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Game Player */}
					<div className="lg:col-span-2">
						<div
							ref={gameContainerRef}
							className="bg-linear-to-br from-purple-900 to-blue-900 rounded-lg overflow-hidden shadow-2xl relative"
						>
							<div className="aspect-video">
								<iframe
									src={detailGame.playUrl}
									className="w-full h-full border-none"
									title="Game Preview"
								/>
							</div>
							<button
								onClick={toggleFullscreen}
								className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all backdrop-blur-sm"
								title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
							>
								<Maximize className="w-5 h-5" />
							</button>
						</div>

						<div className="mt-6 mb-6 flex items-center gap-4">
							<button
								onClick={handlePlayGame}
								className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
							>
								▶ Chơi ngay
							</button>

							<button
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

						{/* Developer Card */}
						<section className={styles.devCard}>
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
						</section>

						{/* Comments Section */}
						<div className="mt-8  rounded-lg p-6">
							<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
								<MessageCircle className="w-6 h-6" />
								Bình luận ({comments.length})
							</h2>

							{username ? (
								<form onSubmit={handleAddComment} className="mb-12">
									<textarea
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										placeholder="Chia sẻ suy nghĩ của bạn..."
										className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-white"
										rows={3}
									/>
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
											<div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
												{comment.username.charAt(0).toUpperCase()}
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<p className="font-bold">{comment.username}</p>
													<span className="text-xs text-gray-500">
														{new Date(comment.datePosted).toLocaleDateString()}
													</span>
												</div>
												<p className="text-gray-300 text-sm">
													{comment.content}
												</p>

												{username && (
													<button
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
																onClick={() => handleAddReply(comment.id)}
																className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
															>
																Đăng
															</button>
															<button
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
															<div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-teal-500 flex items-center justify-center font-bold text-xs">
																{reply.username.charAt(0).toUpperCase()}
															</div>
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<p className="font-bold text-sm">
																		{reply.username}
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
								<div className="flex justify-between">
									<span className="text-gray-400">Tạo bởi</span>
									<span className="font-bold">
										{detailGame.createdBy || "Không rõ"}
									</span>
								</div>
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

			<footer className={styles.footer}>
				<div className={styles.footerGrid}>
					<div>
						<div className={styles.footerLogo}>
							<span
								className="material-icons"
								style={{ color: "#ec1337", fontSize: 22 }}
							>
								keyboard
							</span>
							<span className={styles.footerLogoText}>BIT LEARNING</span>
						</div>
						<p className={styles.footerDesc}>
							The #1 platform for educational typing games and competitive
							keyboarding challenges worldwide.
						</p>
					</div>
					{[
						{
							heading: "Platform",
							links: ["All Games", "Tournaments", "Rankings", "Store"],
						},
						{
							heading: "Support",
							links: [
								"Help Center",
								"Privacy Policy",
								"Terms of Service",
								"Cookie Settings",
							],
						},
					].map(({ heading, links }) => (
						<div key={heading}>
							<h4 className={styles.footerHeading}>{heading}</h4>
							<ul className={styles.footerLinks}>
								{links.map((l) => (
									<li key={l}>
										<a href="#" className={styles.footerLink}>
											{l}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
					<div>
						<h4 className={styles.footerHeading}>Follow Us</h4>
						<div className={styles.socialRow}>
							{["facebook", "alternate_email", "movie"].map((icon) => (
								<a key={icon} href="#" className={styles.socialBtn}>
									<span className="material-icons" style={{ fontSize: 20 }}>
										{icon}
									</span>
								</a>
							))}
						</div>
					</div>
				</div>
				<div className={styles.footerCopy}>
					© 2024 BIT LEARNING Gaming. All rights reserved.
				</div>
			</footer>
		</div>
	);
}
