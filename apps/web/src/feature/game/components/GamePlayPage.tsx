import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import type { Game } from "../services/gameService";
import gameService from "../services/gameService";

interface GamePlayPageProps {
	id: number;
}

export default function GamePlayPage({ id }: GamePlayPageProps) {
	const navigate = useNavigate();
	const auth = useSelector((state: RootState) => state.auth);
	const username = auth.userInfo?.username ?? null;

	const [game, setGame] = useState<Game | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [loading, setLoading] = useState(true);
	const gameContainerRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		loadGame();
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

	const loadGame = async () => {
		try {
			setLoading(true);
			const gameData = await gameService.getGameById(id);
			setGame(gameData);

			// Track play activity
			if (username) {
				const randomScore = Math.floor(Math.random() * 1000);
				try {
					await gameService.trackPlay(id, username, randomScore);
					console.log("Play tracked with score:", randomScore);
				} catch (e) {
					console.error("Tracking error", e);
				}
			}
		} catch (e) {
			console.error("Failed to load game", e);
		} finally {
			setLoading(false);
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
			<div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
				<div className="text-white text-2xl">Loading game...</div>
			</div>
		);
	}

	if (!game) {
		return (
			<div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
				<div className="text-center text-white">
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

	// Build the game URL with parameters
	const gameUrl = `${game.playUrl}?gameId=${game.id}&userId=${encodeURIComponent(username || "")}`;

	return (
		<div className="fixed inset-0 z-50 bg-black flex flex-col">
			<div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
				<div className="flex items-center gap-4">
					<button
						onClick={() =>
							navigate({ to: "/games/$id", params: { id: String(id) } })
						}
						className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
					>
						← Back
					</button>
					<h2 className="font-bold text-lg">{game.title}</h2>
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
					ref={gameContainerRef}
					src={gameUrl}
					className="w-full h-full border-none"
					title="Game Play"
				/>
			</div>
		</div>
	);
}
