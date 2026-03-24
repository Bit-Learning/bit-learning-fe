import React from "react";
import { useParams } from "@tanstack/react-router";
import {
	Users,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@workspace/ui/components/Avatar";
import { useLeaderboard } from "../queries/useContest";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const ContestLeaderboardContent: React.FC = () => {
	const { id } = useParams({ strict: false });
	const { data: leaderboardData, isLoading } = useLeaderboard(id || "", 0, 50);

	const leaderboard = leaderboardData?.data || {
		rankings: [],
		totalParticipants: 0,
		myRank: null,
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getProblemBadgeClass = (result: any) => {
		if (!result.solved && result.wrongAttempts === 0) {
			return "bg-gray-100 text-gray-400";
		}
		if (!result.solved && result.wrongAttempts > 0) {
			return "bg-red-500 text-white";
		}
		if (result.solved && result.wrongAttempts === 0) {
			return "bg-green-500 text-white";
		}
		return "bg-yellow-500 text-white";
	};

	const formatTime = (minutes: number | null) => {
		if (minutes === null) return "--";
		return `${minutes}m`;
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main className="flex-1 px-6 lg:px-20 py-8">
			<div className="max-w-7xl mx-auto space-y-6">
				<div className="flex items-end justify-between">
					<div>
						<h2 className="text-gray-900 text-2xl font-bold">Bảng xếp hạng</h2>
						<p className="text-gray-500 text-sm mt-1">
							Kết quả thi đấu cập nhật realtime
						</p>
					</div>
					<div className="flex gap-4">
						<div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
							<Users className="w-5 h-5 text-blue-600" />
							<div className="flex flex-col">
								<span className="text-xs font-semibold text-gray-500">
									Thí sinh
								</span>
								<span className="font-bold text-gray-900">
									{leaderboard.totalParticipants}
								</span>
							</div>
						</div>
						<Button variant="outline" className="gap-2">
							<RefreshCw className="w-4 h-4" />
							Làm mới
						</Button>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse min-w-250">
							<thead>
								<tr className="bg-gray-50 border-b border-gray-200">
									<th className="px-6 py-4 text-xs font-semibold text-gray-600 w-16 text-center">
										Hạng
									</th>
									<th className="px-6 py-4 text-xs font-semibold text-gray-600">
										Thí sinh
									</th>
									<th className="px-6 py-4 text-xs font-semibold text-gray-600 text-center">
										Solved
									</th>
									<th className="px-6 py-4 text-xs font-semibold text-gray-600 text-center">
										Penalty
									</th>
									{leaderboard.rankings[0]?.problemResults.map((p: any) => (
										<th
											key={p.label}
											className="px-4 py-4 text-xs font-semibold text-gray-600 text-center w-24 border-l border-gray-200"
										>
											{p.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{leaderboard.rankings.map((ranking: any) => {
									const isCurrentUser = ranking.rank === leaderboard.myRank;
									return (
										<tr
											key={ranking.userId}
											className={`transition-colors ${
												isCurrentUser
													? "bg-blue-50 border-y border-blue-200"
													: "hover:bg-gray-50"
											}`}
										>
											<td
												className={`px-6 py-4 text-center font-bold ${
													isCurrentUser ? "text-blue-600" : "text-gray-700"
												}`}
											>
												{ranking.rank}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<Avatar
														className={`size-8 ${isCurrentUser ? "ring-2 ring-blue-600" : ""}`}
													>
														<AvatarImage src={ranking.avatar || undefined} />
														<AvatarFallback
															className={
																isCurrentUser ? "bg-blue-600 text-white" : ""
															}
														>
															{getInitials(ranking.username)}
														</AvatarFallback>
													</Avatar>
													<div className="flex items-center gap-2">
														<span className={`font-medium text-gray-900`}>
															{ranking.username}
														</span>
														{isCurrentUser && (
															<Badge className="bg-blue-600 text-white text-xs px-2">
																Bạn
															</Badge>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-center">
												<Badge
													className={`${
														isCurrentUser
															? "bg-blue-600 text-white"
															: "bg-blue-100 text-blue-700"
													} px-3 py-1 rounded-full text-sm font-semibold`}
												>
													{ranking.solvedCount}
												</Badge>
											</td>
											<td
												className={`px-6 py-4 text-center text-sm font-medium text-gray-600`}
											>
												{ranking.totalPenaltyMinutes}
											</td>
											{ranking.problemResults.map((result: any) => (
												<td
													key={result.label}
													className="px-4 py-4 text-center border-l border-gray-200"
												>
													<div
														className={`${getProblemBadgeClass(result)} rounded-lg py-1.5 text-xs font-semibold`}
													>
														{!result.solved && result.wrongAttempts === 0 ? (
															"--"
														) : !result.solved ? (
															`-${result.wrongAttempts}`
														) : (
															<>
																+{result.wrongAttempts + 1}{" "}
																<span className="font-normal opacity-80">
																	{formatTime(result.acTimeMinutes)}
																</span>
															</>
														)}
													</div>
												</td>
											))}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>

				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex flex-wrap gap-4">
						<div className="flex items-center gap-2 text-xs">
							<div className="size-3 bg-green-500 rounded-sm" />
							<span className="text-gray-600 font-medium">AC lần đầu</span>
						</div>
						<div className="flex items-center gap-2 text-xs">
							<div className="size-3 bg-yellow-500 rounded-sm" />
							<span className="text-gray-600 font-medium">AC có sai</span>
						</div>
						<div className="flex items-center gap-2 text-xs">
							<div className="size-3 bg-red-500 rounded-sm" />
							<span className="text-gray-600 font-medium">Lỗi</span>
						</div>
						<div className="flex items-center gap-2 text-xs">
							<div className="size-3 bg-gray-200 rounded-sm" />
							<span className="text-gray-600 font-medium">Chưa làm</span>
						</div>
					</div>

					<div className="flex items-center gap-4 text-gray-500 text-sm">
						<p>
							Hiển thị 1-{leaderboard.rankings.length} /{" "}
							{leaderboard.totalParticipants}
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" className="size-8 p-0">
								<ChevronLeft className="w-4 h-4" />
							</Button>
							<Button className="bg-blue-600 text-white size-8 p-0 font-semibold">
								1
							</Button>
							<Button variant="ghost" size="sm" className="size-8 p-0">
								2
							</Button>
							<Button variant="outline" size="sm" className="size-8 p-0">
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default ContestLeaderboardContent;
