import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import type { Game } from "../services/gameService";
import gameService from "../services/gameService";
import TrackedGameFrame from "./TrackedGameFrame";

interface GamePlayPageProps {
	id: number;
}

export default function GamePlayPage({ id }: GamePlayPageProps) {
	const navigate = useNavigate();
	const auth = useSelector((state: RootState) => state.auth);
	const username = auth.userInfo?.username ?? null;
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);

	const loadGame = useCallback(async () => {
		try {
			setLoading(true);
			const gameData = await gameService.getGameById(id);
			setGame(gameData);
		} catch (error) {
			console.error("Failed to load game", error);
			setGame(null);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		void loadGame();
	}, [loadGame]);

	if (loading) {
		return (
			<div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
				<div className="text-white text-2xl">Đang tải trò chơi...</div>
			</div>
		);
	}

	if (!game) {
		return (
			<div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
				<div className="text-center text-white">
					<div className="text-6xl mb-6">🎮</div>
					<p className="text-2xl font-bold text-gray-400 mb-2">
						Không tìm thấy trò chơi
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

	return (
		<TrackedGameFrame
			game={game}
			username={username}
			variant="page"
			onBack={() => navigate({ to: "/games/$id", params: { id: String(id) } })}
		/>
	);
}
