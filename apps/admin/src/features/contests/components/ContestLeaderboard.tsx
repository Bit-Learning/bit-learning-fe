import React from "react";
import { useAdminLeaderboard } from "../queries/useContest";
import { RefreshCw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/shared/lib/utils";

interface ContestLeaderboardProps {
	contestId: string;
}

export const ContestLeaderboard: React.FC<ContestLeaderboardProps> = ({
	contestId,
}) => {
	const {
		data: leaderboard,
		isLoading,
		refetch,
	} = useAdminLeaderboard(contestId);

	const getRankBadge = (rank: number) => {
		if (rank === 1) {
			return (
				<span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
					{rank}
				</span>
			);
		} else if (rank === 2) {
			return (
				<span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
					{rank}
				</span>
			);
		} else if (rank === 3) {
			return (
				<span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
					{rank}
				</span>
			);
		}
		return (
			<span className="flex items-center justify-center w-7 h-7 text-gray-600 text-xs font-bold">
				{rank}
			</span>
		);
	};

	const getProblemCell = (result: any) => {
		if (!result.solved && result.attempts === 0) {
			return (
				<td className="min-w-25 text-center text-xs font-medium py-3 border-l border-gray-100">
					<div className="text-gray-300 font-bold">—</div>
				</td>
			);
		}

		if (!result.solved && result.attempts > 0) {
			return (
				<td className="min-w-25 text-center text-xs font-medium py-3 bg-red-50 border-l border-gray-100">
					<div className="text-red-600 font-bold">-{result.attempts}</div>
					<div className="text-[10px] text-red-500">
						{result.attempts > 5 ? "Failed" : "In progress"}
					</div>
				</td>
			);
		}

		const bgColor = result.attempts > 2 ? "bg-yellow-50" : "bg-green-50";
		const textColor =
			result.attempts > 2 ? "text-yellow-600" : "text-green-600";

		return (
			<td
				className={cn(
					"min-w-25 text-center text-xs font-medium py-3 border-l border-gray-100",
					bgColor,
				)}
			>
				<div className={cn(textColor, "font-bold")}>+{result.attempts}</div>
				<div className={cn("text-[10px]", textColor)}>
					{result.acTimeMinutes}m
				</div>
			</td>
		);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
					<p className="text-gray-600">Đang tải bảng xếp hạng...</p>
				</div>
			</div>
		);
	}

	if (!leaderboard || leaderboard.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">Chưa có dữ liệu xếp hạng</p>
			</div>
		);
	}

	return (
		<div className="max-w-full">
			<div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-6">
					<div className="flex flex-col">
						<span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
							Thí sinh
						</span>
						<span className="text-xl font-bold text-gray-900">
							{leaderboard.length}
						</span>
					</div>
					<div className="w-px h-8 bg-gray-200"></div>
					<div className="flex flex-col">
						<span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
							Trạng thái
						</span>
						<div className="flex items-center gap-1.5">
							<span className="text-sm font-medium text-gray-600">
								Cập nhật lần cuối: vài giây trước
							</span>
							<button
								onClick={() => refetch()}
								className="text-blue-600 hover:rotate-180 transition-transform duration-500"
							>
								<RefreshCw className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
				<Button variant="outline" className="border-gray-300">
					<Download className="h-4 w-4 mr-2" />
					Xuất Excel
				</Button>
			</div>

			<Card className="bg-white p-0 border-gray-200">
				<CardContent className="p-0 overflow-x-auto">
					<table className="w-full text-left border-collapse min-w-250">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 w-16">
									Hạng
								</th>
								<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">
									Thí sinh
								</th>
								<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 text-center">
									Penalty
								</th>
								{leaderboard[0]?.problemResults.map((_, idx) => (
									<th
										key={idx}
										className="text-center text-xs text-gray-600 border-l border-gray-200 min-w-25 py-3"
									>
										{String.fromCharCode(65 + idx)}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{leaderboard.map((entry) => (
								<tr
									key={entry.userId}
									className="hover:bg-blue-50 transition-colors cursor-pointer"
								>
									<td className="px-6 py-4">{getRankBadge(entry.rank)}</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<Avatar className="w-8 h-8 border border-gray-200">
												<AvatarImage
													src={entry.avatar || undefined}
													alt={entry.username}
												/>
												<AvatarFallback className="text-xs bg-gray-100 text-gray-700">
													{entry.username.substring(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="text-sm font-bold text-gray-900 leading-tight">
													{entry.username}
												</span>
												<span className="text-[11px] text-gray-500">
													{entry.email}
												</span>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="text-sm font-medium text-gray-600">
											{entry.totalPenaltyMinutes}
										</span>
									</td>
									{entry.problemResults.map((result) => getProblemCell(result))}
								</tr>
							))}
						</tbody>
					</table>
				</CardContent>
			</Card>
		</div>
	);
};
