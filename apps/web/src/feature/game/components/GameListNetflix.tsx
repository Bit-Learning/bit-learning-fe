import { Eye, Heart, MessageCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Comment, Game, GameCategory } from "../services/gameService";
import gameService from "../services/gameService";
import CategoryRow from "./CategoryRow";
import { Navbar } from "./Navbar";
import styles from "./HomePage.module.css";
import { Link } from "@tanstack/react-router";
import { featuredGame } from "../data/games";
interface GameListNetflixProps {
	username: string | null;
}

export default function GameListNetflix({ username }: GameListNetflixProps) {
	const [categoriesWithGames, setCategoriesWithGames] = useState<
		GameCategory[]
	>([]);
	const [categories, setCategories] = useState<GameCategory[]>([]);
	const [selectedGame, setSelectedGame] = useState<Game | null>(null);
	const [detailGame, setDetailGame] = useState<Game | null>(null);

	// State for Fullscreen
	const [isFullscreen, setIsFullscreen] = useState(false);
	const gameContainerRef = useRef<HTMLDivElement>(null);

	// State for Detail View
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentText, setCommentText] = useState("");
	const [replyTo, setReplyTo] = useState<number | null>(null);
	const [replyText, setReplyText] = useState("");
	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		fetchCategoriesWithGames();
		fetchCategories();

		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const fetchCategoriesWithGames = async () => {
		try {
			const data = await gameService.getCategoriesWithGames();
			console.log("Categories with games:", data);
			// Ensure data is an array before setting state
			if (Array.isArray(data)) {
				setCategoriesWithGames(data);
			} else {
				console.error("API returned non-array data:", data);
				setCategoriesWithGames([]);
			}
		} catch (error) {
			console.error("Failed to load categories with games", error);
			setCategoriesWithGames([]);
		}
	};

	const fetchCategories = async () => {
		try {
			const data = await gameService.getAllCategories();
			setCategories(data);
		} catch (error) {
			console.error("Failed to load categories", error);
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

	// --- VIEW: Playing Game Screen ---
	if (selectedGame) {
		// Debug logging
		console.log("Playing game with username:", username);
		console.log("Game ID:", selectedGame.id);

		// Build the game URL with parameters
		const gameUrl = `${selectedGame.playUrl}?gameId=${selectedGame.id}&userId=${encodeURIComponent(username || "")}`;
		console.log("Game URL:", gameUrl);

		return (
			<div className="fixed inset-0 z-50 bg-black flex flex-col">
				<div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSelectedGame(null)}
							className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
						>
							← Back
						</button>
						<h2 className="font-bold text-lg">{selectedGame.title}</h2>
						{!username && (
							<span className="text-yellow-500 text-sm">
								⚠️ Not logged in - game progress won't be tracked
							</span>
						)}
					</div>
					<button
						onClick={toggleFullscreen}
						className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors"
					>
						{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
					</button>
				</div>
				<div className="flex-1 relative">
					<iframe
						ref={gameContainerRef as any}
						src={gameUrl}
						className="w-full h-full border-none"
						title="Game Play"
					/>
				</div>
			</div>
		);
	}

	// --- VIEW: Detail Page ---
	if (detailGame) {
		const topLevelComments = comments.filter((c) => !c.parentCommentId);
		const getReplies = (parentId: number) =>
			comments.filter((c) => c.parentCommentId === parentId);

		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
				<div className="max-w-7xl mx-auto px-6 py-8">
					<button
						onClick={() => setDetailGame(null)}
						className="mb-6 bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
					>
						← Back
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Left Column - Game Player */}
						<div className="lg:col-span-2">
							<div className="bg-linear-to-br from-purple-900 to-blue-900 rounded-lg overflow-hidden shadow-2xl">
								<div className="aspect-video">
									<iframe
										src={detailGame.playUrl}
										className="w-full h-full border-none"
										title="Game Preview"
									/>
								</div>
							</div>

							<div className="mt-6 flex items-center gap-4">
								<button
									onClick={() => setSelectedGame(detailGame)}
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
										<div
											key={comment.id}
											className="bg-gray-900 rounded-lg p-4"
										>
											<div className="flex items-start gap-3">
												<div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
													{comment.username.charAt(0).toUpperCase()}
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<p className="font-bold">{comment.username}</p>
														<span className="text-xs text-gray-500">
															{new Date(
																comment.datePosted,
															).toLocaleDateString()}
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
										<span className="font-bold">
											{detailGame.category.name}
										</span>
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

	// --- VIEW: Netflix-style Home ---
	return (
		<div className="min-h-screen bg-[#12080a] text-white">
			<title>Bit Learning Game Center</title>
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

			{/* Hero */}
			<section className={styles.hero}>
				<div className={styles.heroBg}>
					<img
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1wWV_VAD5lyWQZbGNgh4vcyi65uAw_hT_rvT8jG0u5IYOuOQRL8vYCZpnQEOQDxkE95l8zwrFbr1Kvwurgb9wmlARDd8SAPmu9PV_DBNw_RaSVRxiLM583UqvAqK5Q2Qa_0TuCHyL90xF_AXSlxVYBz0pSnqCZwdumTIbxFK58RhN_dXSsBphatRDvXOkdr_yMxBevirnOnaTThpfcZJt7420ERKus8OsQNAktJcOGSpga4Q7Q9tVR71YnxvehM0V2zIMh_nnSDX9"
						alt="Space Typer Hero"
						className={styles.heroBgImg}
					/>
					<div className={styles.heroGradient} />
				</div>
				<div className={styles.heroContent}>
					<div className={styles.heroInner}>
						<div className={styles.heroBadges}>
							<span className={styles.badge}>Featured Game</span>
							<span className={styles.badgeSub}>#1 Trending in Typing</span>
						</div>
						<h1 className={styles.heroTitle}>
							Space <br />
							<span className={styles.heroAccent}>Typer</span>
						</h1>
						<p className={styles.heroDesc}>
							Master your keyboard while navigating through the asteroid belt.
							The faster you type, the quicker you dodge! Unlock legendary ships
							and conquer the cosmos.
						</p>
						<div className={styles.heroActions}>
							<Link
								to="/games/$id"
								params={{ id: featuredGame.id }}
								className={styles.btnPlay}
							>
								<span className="material-icons">play_arrow</span>
								PLAY NOW
							</Link>
							<button className={styles.btnInfo}>
								<span className="material-icons" style={{ fontSize: 20 }}>
									info
								</span>
								MORE INFO
							</button>
						</div>
					</div>
				</div>
			</section>

			<main className={styles.main}>
				{/* Categories with Games - Netflix Style */}
				{categoriesWithGames.length > 0 ? (
					categoriesWithGames.map((category) => (
						<CategoryRow
							key={category.id}
							categoryName={category.name}
							categoryDescription={category.description}
							games={category.games || []}
						/>
					))
				) : (
					<div className="text-center py-20 px-8">
						<div className="text-6xl mb-6">🎮</div>
						<p className="text-2xl font-bold text-gray-400 mb-2">
							No games available yet
						</p>
					</div>
				)}
			</main>

			<footer className={styles.footer}>
				<div className={styles.footerGrid}>
					<div className={styles.footerBrand}>
						<div className={styles.footerLogo}>
							<span className={styles.footerLogoIcon}>
								<span
									className="material-icons"
									style={{ fontSize: 18, color: "white" }}
								>
									videogame_asset
								</span>
							</span>
							<span className={styles.footerLogoText}>
								Edu<span className={styles.footerLogoAccent}>Play</span>
							</span>
						</div>
						<p className={styles.footerTagline}>
							Elevating the learning experience through immersive, fun, and
							competitive casual games for all ages.
						</p>
					</div>
					<div>
						<h4 className={styles.footerHeading}>Platform</h4>
						<ul className={styles.footerLinks}>
							{["Home", "Categories", "Tournaments", "Leaderboard"].map((l) => (
								<li key={l}>
									<a href="#" className={styles.footerLink}>
										{l}
									</a>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className={styles.footerHeading}>Support</h4>
						<ul className={styles.footerLinks}>
							{[
								"Help Center",
								"Parents Guide",
								"Safety Center",
								"Contact Us",
							].map((l) => (
								<li key={l}>
									<a href="#" className={styles.footerLink}>
										{l}
									</a>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className={styles.footerHeading}>Community</h4>
						<div className={styles.socialRow}>
							{["discord", "public"].map((icon) => (
								<a key={icon} href="#" className={styles.socialBtn}>
									<span className="material-icons" style={{ fontSize: 20 }}>
										{icon}
									</span>
								</a>
							))}
						</div>
					</div>
				</div>
				<div className={styles.footerBottom}>
					<p className={styles.footerCopy}>
						© 2024 EduPlay Game Center. All rights reserved.
					</p>
					<div className={styles.footerLegal}>
						{["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
							(l) => (
								<a key={l} href="#" className={styles.footerLegalLink}>
									{l}
								</a>
							),
						)}
					</div>
				</div>
			</footer>
		</div>
	);
}
