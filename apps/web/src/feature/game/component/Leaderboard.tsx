import { Award, Medal, Trophy } from "lucide-react";
import type React from "react";
import { mergeName } from "@/shared/lib/string-utils";
import { useLeaderboard } from "../hooks/useGame";
import "../styles/playerscorebutton.css";
interface LeaderboardProps {
	gameId: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameId }) => {
	const { data: leaderboard, isLoading } = useLeaderboard(gameId, 10);

	if (isLoading) {
		return (
			<div className="rounded-2xl bg-white p-6 shadow-lg">
				<h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
					<Trophy className="text-yellow-500" size={28} />
					Leaderboard
				</h3>
				<div className="animate-pulse space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-16 rounded-lg bg-gray-200" />
					))}
				</div>
			</div>
		);
	}

	if (!leaderboard || leaderboard.length === 0) {
		return (
			<div className="rounded-2xl bg-white p-6 shadow-lg">
				<h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
					<Trophy className="text-yellow-500" size={28} />
					Leaderboard
				</h3>
				<p className="py-8 text-center text-gray-500">
					No players yet. Be the first to play!
				</p>
			</div>
		);
	}

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Trophy className="text-yellow-500" size={24} />;
			case 2:
				return <Medal className="text-gray-400" size={24} />;
			case 3:
				return <Award className="text-orange-600" size={24} />;
			default:
				return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
		}
	};

	const getRankBgColor = (rank: number) => {
		switch (rank) {
			case 1:
				return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300";
			case 2:
				return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300";
			case 3:
				return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300";
			default:
				return "bg-white border-gray-200";
		}
	};

	return (
		<div className="rounded-2xl bg-white p-6 shadow-lg">
			<h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
				<Trophy className="text-yellow-500" size={28} />
				Leaderboard
			</h3>

			<div className="space-y-5">
				{leaderboard.map((entry) => (
					<div
						key={entry.userId}
						className={`${getRankBgColor(entry.rank)} rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-md`}
					>
						<div className="flex items-center gap-4">
							{/* Rank */}
							<div className="flex w-12 flex-shrink-0 items-center justify-center">
								{getRankIcon(entry.rank)}
							</div>

							{/* Avatar & Username */}
							<div className="flex flex-1 items-center gap-3">
								<img
									src={
										entry.avatar ||
										`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`
									}
									alt={entry.username}
									className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
								/>
								<div>
									<div className="font-bold text-gray-900">
										{mergeName(entry.firstName, entry.lastName)}
									</div>
									{entry.rank <= 3 && (
										<div className="text-xs text-gray-500">
											{entry.rank === 1 && "👑 Champion"}
											{entry.rank === 2 && "🥈 Runner-up"}
											{entry.rank === 3 && "🥉 Third Place"}
										</div>
									)}
								</div>
							</div>

							{/* Score */}
							<div className="flex-shrink-0">
								{/* <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-lg font-bold text-white shadow-sm">
                                    {entry.score}
                                </div> */}
								<div className="comic-brutal-button-container">
									<button className="comic-brutal-button">
										<div className="button-inner">
											<span className="button-text">{entry.score}</span>
											<div className="halftone-overlay" />
											<div className="ink-splatter" />
										</div>
										<div className="button-shadow" />
										<div className="button-frame" />
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
