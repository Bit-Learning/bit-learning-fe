import { useEffect, useState } from "react";
import gameService, {
	type LeaderboardEntry,
	type Page,
} from "../services/gameService";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Leaderboard() {
	const [leaderboard, setLeaderboard] = useState<Page<LeaderboardEntry> | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchLeaderboard(currentPage, pageSize);
	}, [currentPage, pageSize]);

	const fetchLeaderboard = async (page: number, size: number) => {
		try {
			setLoading(true);
			const data = await gameService.getLeaderboard(page, size);
			setLeaderboard(data);
		} catch (error) {
			console.error("Failed to load leaderboard", error);
		} finally {
			setLoading(false);
		}
	};

	const handlePreviousPage = () => {
		if (leaderboard && !leaderboard.first) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (leaderboard && !leaderboard.last) {
			setCurrentPage(currentPage + 1);
		}
	};

	const getRankDisplay = (index: number) => {
		const globalRank = currentPage * pageSize + index;
		if (globalRank === 0) return "🥇";
		if (globalRank === 1) return "🥈";
		if (globalRank === 2) return "🥉";
		return `#${globalRank + 1}`;
	};

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center py-12">
					<div className="text-2xl text-gray-600">Loading leaderboard...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h2 className="text-3xl font-bold text-gray-800 mb-6">🏆 Leaderboard</h2>

			<div className="bg-white rounded-lg shadow-lg overflow-hidden">
				<table className="w-full">
					<thead className="bg-gradient-to-r from-yellow-400 to-yellow-500">
						<tr>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Rank
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Player
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Total Score
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Games Played
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{leaderboard?.content.map((entry, index) => {
							const globalRank = currentPage * pageSize + index;
							return (
								<tr
									key={entry.userId}
									className={`hover:bg-gray-50 transition-colors ${globalRank === 0 ? "bg-yellow-50" : ""}`}
								>
									<td className="px-6 py-4 text-lg font-bold text-gray-700">
										{getRankDisplay(index)}
									</td>
									<td className="px-6 py-4">
										<span className="text-gray-800 font-medium">
											{entry.username}
										</span>
									</td>
									<td className="px-6 py-4 text-gray-800 font-semibold">
										{entry.totalScore.toLocaleString()}
									</td>
									<td className="px-6 py-4 text-gray-600">
										{entry.gamesPlayed}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				{(!leaderboard || leaderboard.content.length === 0) && (
					<div className="text-center py-12 text-gray-500">
						No players yet. Be the first to play!
					</div>
				)}

				{leaderboard && leaderboard.totalElements > 0 && (
					<div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
						<div className="text-sm text-gray-700">
							Showing{" "}
							<span className="font-semibold">
								{currentPage * pageSize + 1}
							</span>{" "}
							to{" "}
							<span className="font-semibold">
								{Math.min(
									(currentPage + 1) * pageSize,
									leaderboard.totalElements,
								)}
							</span>{" "}
							of{" "}
							<span className="font-semibold">{leaderboard.totalElements}</span>{" "}
							players
						</div>

						<div className="flex items-center gap-2">
							<button
								onClick={handlePreviousPage}
								disabled={leaderboard.first}
								className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
									leaderboard.first
										? "bg-gray-200 text-gray-400 cursor-not-allowed"
										: "bg-yellow-500 text-white hover:bg-yellow-600"
								}`}
							>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</button>

							<span className="text-sm text-gray-700 px-4">
								Page <span className="font-semibold">{currentPage + 1}</span> of{" "}
								<span className="font-semibold">{leaderboard.totalPages}</span>
							</span>

							<button
								onClick={handleNextPage}
								disabled={leaderboard.last}
								className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
									leaderboard.last
										? "bg-gray-200 text-gray-400 cursor-not-allowed"
										: "bg-yellow-500 text-white hover:bg-yellow-600"
								}`}
							>
								Next
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
