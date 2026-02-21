import { Eye, Heart, MessageCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Comment, Game, GameCategory } from "../services/gameService";
import gameService from "../services/gameService";
import CategoryRow from "./CategoryRow";

interface GameListNetflixProps {
	username: string | null;
	role: string | null;
}

export default function GameListNetflix({
	username,
	role,
}: GameListNetflixProps) {
	const [categoriesWithGames, setCategoriesWithGames] = useState<
		GameCategory[]
	>([]);
	const [categories, setCategories] = useState<GameCategory[]>([]);
	const [selectedGame, setSelectedGame] = useState<Game | null>(null);
	const [detailGame, setDetailGame] = useState<Game | null>(null);

	// State for Upload Form
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [instructions, setInstructions] = useState("");
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [thumbnailUrl, setThumbnailUrl] = useState("");
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [showUpload, setShowUpload] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

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

	const handleUpload = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) return alert("Please select a file!");
		if (!categoryId) return alert("Please select a category!");
		if (!username) return alert("Please login to upload!");

		const formData = new FormData();
		formData.append("file", file);
		formData.append("title", title);
		formData.append("desc", desc);
		formData.append("instructions", instructions);
		formData.append("categoryId", categoryId.toString());
		formData.append("username", username);

		if (thumbnailFile) {
			formData.append("thumbnail", thumbnailFile);
		} else if (thumbnailUrl) {
			formData.append("thumbnailUrl", thumbnailUrl);
		}

		try {
			await gameService.uploadGame(formData);
			alert("Game uploaded successfully!");
			fetchCategoriesWithGames();
			// Reset form
			setTitle("");
			setDesc("");
			setInstructions("");
			setCategoryId(null);
			setThumbnailUrl("");
			setThumbnailFile(null);
			setFile(null);
			setShowUpload(false);
		} catch (error) {
			alert("Upload failed");
		}
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const droppedFiles = e.dataTransfer.files;
		if (droppedFiles && droppedFiles.length > 0) {
			const droppedFile = droppedFiles[0];
			if (droppedFile) {
				const fileExtension = droppedFile.name.split(".").pop()?.toLowerCase();
				if (fileExtension === "html" || fileExtension === "zip") {
					setFile(droppedFile);
				} else {
					alert("Please upload only .html or .zip files");
				}
			}
		}
	};

	const handlePlay = async (game: Game) => {
		setSelectedGame(game);
		setIsFullscreen(false);
		if (username) {
			const randomScore = Math.floor(Math.random() * 1000);
			try {
				await gameService.trackPlay(game.id, username, randomScore);
				console.log("Play tracked with score:", randomScore);
			} catch (e) {
				console.error("Tracking error", e);
			}
		}
	};

	const handleShowDetail = async (game: Game) => {
		try {
			const gameData = await gameService.getGameById(game.id);
			setDetailGame(gameData);

			const commentsData = await gameService.getComments(game.id);
			setComments(commentsData);

			if (username) {
				const likeStatus = await gameService.checkLikeStatus(game.id, username);
				setIsLiked(likeStatus);
			} else {
				setIsLiked(false);
			}
		} catch (e) {
			console.error("Failed to load game details", e);
		}
	};

	const handleDeleteGame = async (gameId: number) => {
		if (!username || role !== "ADMIN") {
			alert("Only admins can delete games!");
			return;
		}

		if (!confirm("Are you sure you want to delete this game?")) {
			return;
		}

		try {
			await gameService.deleteGame(gameId, username);
			alert("Game deleted successfully!");
			setDetailGame(null);
			fetchCategoriesWithGames();
		} catch (error) {
			alert("Failed to delete game");
			console.error(error);
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

								{role === "ADMIN" && (
									<button
										onClick={() => handleDeleteGame(detailGame.id)}
										className="bg-gray-800 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
									>
										🗑️
									</button>
								)}
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
										<span>{detailGame.category.icon}</span>
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
		<div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
			{/* Hero Header */}
			<div className="relative h-96 bg-gradient-to-r from-purple-900 to-blue-900 overflow-hidden">
				<div className="absolute inset-0 bg-black/40" />
				<div className="relative z-10 max-w-7xl mx-auto px-8 h-full flex flex-col justify-center">
					<h1 className="text-5xl md:text-6xl font-bold mb-4">
						🎮 Game Center
					</h1>
					<p className="text-xl text-gray-300 max-w-2xl">
						Discover amazing games created by students. Play, learn, and have
						fun!
					</p>

					{username && role === "ADMIN" && (
						<button
							onClick={() => setShowUpload(!showUpload)}
							className="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold inline-flex items-center gap-2 w-fit transition-colors"
						>
							<Upload className="w-5 h-5" />
							{showUpload ? "Cancel Upload" : "Upload New Game"}
						</button>
					)}
				</div>
			</div>

			<div className="relative -mt-32 z-20">
				{/* Upload Form */}
				{showUpload && username && role === "ADMIN" && (
					<div className="max-w-4xl mx-auto px-8 mb-12">
						<div className="bg-gray-900 rounded-lg p-8 shadow-2xl border border-gray-800">
							<h3 className="text-2xl font-bold mb-6">Upload New Game</h3>
							<form onSubmit={handleUpload} className="space-y-6">
								<div>
									<label className="block font-bold mb-2">Title</label>
									<input
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
										placeholder="Game title"
										required
									/>
								</div>

								<div>
									<label className="block font-bold mb-2">Description</label>
									<textarea
										value={desc}
										onChange={(e) => setDesc(e.target.value)}
										className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white resize-none"
										rows={3}
										placeholder="Brief description"
									/>
								</div>

								<div>
									<label className="block font-bold mb-2">Instructions</label>
									<textarea
										value={instructions}
										onChange={(e) => setInstructions(e.target.value)}
										className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white resize-none"
										rows={4}
										placeholder="How to play"
									/>
								</div>

								<div>
									<label className="block font-bold mb-2">Category</label>
									<select
										value={categoryId || ""}
										onChange={(e) =>
											setCategoryId(
												e.target.value ? Number(e.target.value) : null,
											)
										}
										className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
										required
									>
										<option value="">Select a category...</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.icon} {cat.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block font-bold mb-2">Thumbnail</label>
									<input
										type="text"
										value={thumbnailUrl}
										onChange={(e) => {
											setThumbnailUrl(e.target.value);
											if (e.target.value) setThumbnailFile(null);
										}}
										className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white mb-3"
										placeholder="Thumbnail URL"
										disabled={!!thumbnailFile}
									/>
									<div className="text-center text-gray-500 my-2">OR</div>
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											const selectedFile = e.target.files?.[0];
											if (selectedFile) {
												setThumbnailFile(selectedFile);
												setThumbnailUrl("");
											}
										}}
										className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
										disabled={!!thumbnailUrl}
									/>
								</div>

								<div>
									<label className="block font-bold mb-2">
										Game File (.html or .zip)
									</label>
									<div
										onDragEnter={handleDragEnter}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
											isDragging
												? "border-red-600 bg-red-900/20"
												: file
													? "border-green-600 bg-green-900/20"
													: "border-gray-700 bg-gray-800/50"
										}`}
									>
										<input
											type="file"
											id="file-upload"
											accept=".html,.zip"
											onChange={(e) => setFile(e.target.files?.[0] || null)}
											className="hidden"
											required={!file}
										/>

										{file ? (
											<>
												<div className="text-green-500 text-5xl mb-4">✓</div>
												<p className="text-green-500 font-bold mb-2">
													{file.name}
												</p>
												<p className="text-gray-500 text-sm">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</p>
												<button
													type="button"
													onClick={() => setFile(null)}
													className="text-red-500 hover:text-red-400 text-sm font-bold mt-3"
												>
													Remove file
												</button>
											</>
										) : (
											<>
												<div className="text-gray-500 text-5xl mb-4">📁</div>
												<p className="text-gray-400 font-bold mb-4">
													Drag and drop or
												</p>
												<label
													htmlFor="file-upload"
													className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition-colors"
												>
													Choose File
												</label>
												<p className="text-gray-600 text-sm mt-4">
													Supported: .html, .zip
												</p>
											</>
										)}
									</div>
								</div>

								<button
									type="submit"
									className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors"
								>
									Upload Game
								</button>
							</form>
						</div>
					</div>
				)}

				{/* Categories with Games - Netflix Style */}
				<div className="space-y-12 pb-16 mt-36">
					{categoriesWithGames.length > 0 ? (
						categoriesWithGames.map((category) => (
							<CategoryRow
								key={category.id}
								categoryName={category.name}
								categoryDescription={category.description}
								categoryIcon={category.icon}
								games={category.games || []}
							/>
						))
					) : (
						<div className="text-center py-20 px-8">
							<div className="text-6xl mb-6">🎮</div>
							<p className="text-2xl font-bold text-gray-400 mb-2">
								No games available yet
							</p>
							<p className="text-gray-600">
								{username
									? "Be the first to upload a game!"
									: "Sign in to start playing"}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
