import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Clock, Target } from "lucide-react";
import type React from "react";
import { NotFoundErrorPage } from "@/feature/app/page/NotFound";
import { GameHistory } from "../component/GameHistory";
import { Leaderboard } from "../component/Leaderboard";
import { useGameDetail } from "../hooks/useGame";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import "../styles/playbutton.css";

interface Props {
	id: string;
}

export const GameDetailPage: React.FC<Props> = ({ id }) => {
	const navigate = useNavigate();
	const gameId = Number.parseInt(id || "0", 10);
	const { data: game, isLoading, error } = useGameDetail(gameId);

	if (isLoading) {
		return <Loader />;
	}

	if (error) {
		throw error;
	}

	if (!game) {
		return <NotFoundErrorPage />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* Game Header */}
				<div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl">
					<div className="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
						{game.thumbnailUrl ? (
							<img
								src={game.thumbnailUrl}
								alt={game.title}
								className="h-full w-full object-cover opacity-50"
							/>
						) : (
							<div className="flex h-full items-center justify-center text-8xl text-white">
								🎯
							</div>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-8 text-white">
							<div className="mb-3 flex items-center gap-2">
								<span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
									{game.topic}
								</span>
								<span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
									{game.type}
								</span>
							</div>
							<h1 className="mb-2 text-4xl font-bold">{game.title}</h1>
							<p className="text-lg text-white/90">{game.description}</p>
						</div>
					</div>

					<div className="p-8">
						<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
							<div className="rounded-xl bg-indigo-50 p-4 text-center">
								<BookOpen className="mx-auto mb-2 text-indigo-600" size={32} />
								<div className="text-2xl font-bold text-gray-900">
									{game.questions.length}
								</div>
								<div className="text-sm text-gray-600">Questions</div>
							</div>

							<div className="rounded-xl bg-purple-50 p-4 text-center">
								<Clock className="mx-auto mb-2 text-purple-600" size={32} />
								<div className="text-2xl font-bold text-gray-900">
									{game.settings.timePerQuestion}s
								</div>
								<div className="text-sm text-gray-600">Per Question</div>
							</div>

							<div className="rounded-xl bg-pink-50 p-4 text-center">
								<Target className="mx-auto mb-2 text-pink-600" size={32} />
								<div className="text-2xl font-bold text-gray-900">
									{game.settings.pointsBase}
								</div>
								<div className="text-sm text-gray-600">Base Points</div>
							</div>

							<div className="flex items-center justify-center rounded-xl p-4 text-center">
								<button
									onClick={() => navigate({ to: `/games/${gameId}/play` })}
									className="button-with-icon"
								>
									<svg
										className="icon"
										id="Play"
										viewBox="0 0 48 48"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											className="color000000 svgShape"
											fill="#ffffff"
											d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z"
										/>
									</svg>
									<span className="text">Play</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div>
						<GameHistory gameId={gameId} />
					</div>
					<div>
						<Leaderboard gameId={gameId} />
					</div>
				</div>
			</div>
		</div>
	);
};
