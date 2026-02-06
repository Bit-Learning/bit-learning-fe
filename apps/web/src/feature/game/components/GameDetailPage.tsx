import { Eye, Heart, MessageCircle, Maximize } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import type { Comment, Game } from "../services/gameService";
import gameService from "../services/gameService";

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
			alert("Please login to like games!");
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
			alert("Please login to comment!");
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
			alert("Please login to reply!");
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
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
				<div className="text-2xl">Loading...</div>
			</div>
		);
	}

	if (!detailGame) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
				<div className="text-center">
					<div className="text-6xl mb-6">🎮</div>
					<p className="text-2xl font-bold text-gray-400 mb-2">
						Game not found
					</p>
					<button
						onClick={() => navigate({ to: "/games" })}
						className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors"
					>
						← Back to Games
					</button>
				</div>
			</div>
		);
	}

	const topLevelComments = comments.filter((c) => !c.parentCommentId);
	const getReplies = (parentId: number) =>
		comments.filter((c) => c.parentCommentId === parentId);

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
			<div className="max-w-7xl mx-auto px-6 py-8">
				<button
					onClick={() => navigate({ to: "/games" })}
					className="mb-6 bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
				>
					← Back
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

						<div className="mt-6 flex items-center gap-4">
							<button
								onClick={handlePlayGame}
								className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
							>
								▶ Play Now
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

						{/* Comments Section */}
						<div className="mt-8 bg-gray-800/50 rounded-lg p-6">
							<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
								<MessageCircle className="w-6 h-6" />
								Comments ({comments.length})
							</h2>

							{username ? (
								<form onSubmit={handleAddComment} className="mb-8">
									<textarea
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										placeholder="Share your thoughts..."
										className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-white"
										rows={3}
									/>
									<div className="flex gap-3 mt-3">
										<button
											type="submit"
											className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors"
										>
											Post Comment
										</button>
										<button
											type="button"
											onClick={() => setCommentText("")}
											className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
										>
											Cancel
										</button>
									</div>
								</form>
							) : (
								<div className="mb-8 bg-gray-900 rounded-lg p-6 text-center">
									<p className="text-gray-400 mb-4">Sign in to comment</p>
								</div>
							)}

							<div className="space-y-4">
								{topLevelComments.map((comment) => (
									<div key={comment.id} className="bg-gray-900 rounded-lg p-4">
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
														Reply
													</button>
												)}

												{replyTo === comment.id && username && (
													<div className="mt-3 bg-gray-800 rounded-lg p-3">
														<textarea
															value={replyText}
															onChange={(e) => setReplyText(e.target.value)}
															placeholder="Write a reply..."
															className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-white text-sm"
															rows={2}
														/>
														<div className="flex gap-2 mt-2">
															<button
																onClick={() => handleAddReply(comment.id)}
																className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
															>
																Post
															</button>
															<button
																onClick={() => {
																	setReplyTo(null);
																	setReplyText("");
																}}
																className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
															>
																Cancel
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
										<p className="text-gray-500">No comments yet</p>
										<p className="text-gray-600 text-sm mt-1">
											Be the first to share what you think!
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
									"No description available."}
							</p>
							{detailGame.category && (
								<div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full">
									<span>{detailGame.category.icon}</span>
									<span className="font-bold">{detailGame.category.name}</span>
								</div>
							)}
						</div>

						<div className="bg-gray-800/50 rounded-lg p-6">
							<h3 className="font-bold mb-4">Game Stats</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-400">Views</span>
									<span className="font-bold">{detailGame.views || 0}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-400">Likes</span>
									<span className="font-bold">{detailGame.likes || 0}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-400">Created By</span>
									<span className="font-bold">
										{detailGame.createdBy || "Unknown"}
									</span>
								</div>
								{detailGame.dateAdded && (
									<div className="flex justify-between">
										<span className="text-gray-400">Date Added</span>
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
		</div>
	);
}
