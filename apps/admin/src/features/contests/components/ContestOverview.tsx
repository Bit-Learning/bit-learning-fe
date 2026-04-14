import React from "react";
import { Info, TrendingUp, Trophy, CheckCircle2, Clock } from "lucide-react";
import { ContestStatus } from "../types/contest.type";
import type { ContestDetailDTO } from "../types/contest.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContestOverviewProps {
	contest: ContestDetailDTO;
}

export const ContestOverview: React.FC<ContestOverviewProps> = ({
	contest,
}) => {
	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const stats = [
		{
			label: "Người đăng ký",
			value: contest.participantCount.toString(),
			color: "bg-blue-100 text-blue-600",
		},
		{
			label: "Bài tập",
			value: contest.problemCount.toString(),
			color: "bg-orange-100 text-orange-600",
		},
	];

	const hasPrize =
		contest.prizeTopCount &&
		contest.prizeTopCount > 0 &&
		contest.prizeCoinsPerRank?.length;
	const getMedal = (i: number) =>
		i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏆";

	return (
		<div className="grid grid-cols-10 gap-8 max-w-7xl mx-auto">
			<div className="col-span-7 space-y-8">
				<Card className="bg-white border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900">
							<Info className="w-5 h-5 text-blue-600" />
							Thông tin chung
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<h4 className="text-lg font-bold mb-3 text-gray-900">
								Mô tả cuộc thi
							</h4>
							<div className="prose prose-sm max-w-none text-gray-700">
								<p>{contest.description || "Chưa có mô tả"}</p>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
							<div>
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
									Thời gian bắt đầu
								</p>
								<p className="text-sm font-semibold text-gray-900">
									{formatDateTime(contest.startTime)}
								</p>
							</div>
							<div>
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
									Thời gian kết thúc
								</p>
								<p className="text-sm font-semibold text-gray-900">
									{formatDateTime(contest.endTime)}
								</p>
							</div>
							<div>
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
									Thời lượng
								</p>
								<p className="text-sm font-semibold text-gray-900">
									{contest.durationMinutes} phút (
									{Math.floor(contest.durationMinutes / 60)} giờ)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="col-span-3 space-y-6">
				<Card className="bg-white border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900">
							<TrendingUp className="w-5 h-5 text-green-600" />
							Số liệu trực tiếp
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							{stats.map((stat, index) => (
								<div
									key={index}
									className={`p-4 rounded-xl border ${stat.color}`}
								>
									<p className="text-xs font-bold uppercase mb-1">
										{stat.label}
									</p>
									<p className="text-2xl font-bold">{stat.value}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900">
							<Trophy className="w-5 h-5 text-amber-500" />
							Giải thưởng
						</CardTitle>
					</CardHeader>
					<CardContent>
						{hasPrize ? (
							<div className="space-y-4">
								<div className="space-y-2">
									{contest.prizeCoinsPerRank!.map((coins, i) => (
										<div
											key={i}
											className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 border border-amber-100"
										>
											<div className="flex items-center gap-2">
												<span className="text-lg">{getMedal(i)}</span>
												<span className="text-sm font-semibold text-gray-700">
													Top {i + 1}
												</span>
											</div>
											<span className="text-sm font-bold text-amber-600">
												{coins.toLocaleString()} xu
											</span>
										</div>
									))}
								</div>

								{contest.status === ContestStatus.ENDED && (
									<div
										className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
											contest.prizesDistributed
												? "bg-green-50 text-green-700 border border-green-200"
												: "bg-yellow-50 text-yellow-700 border border-yellow-200"
										}`}
									>
										{contest.prizesDistributed ? (
											<>
												<CheckCircle2 className="w-4 h-4" />
												Đã phát thưởng
											</>
										) : (
											<>
												<Clock className="w-4 h-4" />
												Chưa phát thưởng
											</>
										)}
									</div>
								)}
							</div>
						) : (
							<p className="text-sm text-gray-400 text-center py-4">
								Không có giải thưởng
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
