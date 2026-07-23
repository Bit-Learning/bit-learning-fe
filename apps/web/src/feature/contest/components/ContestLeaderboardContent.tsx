import React, { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Users, Trophy } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@workspace/ui/components/Avatar";
import { useLeaderboard } from "../queries/useContest";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { Pagination } from "@/shared/components/Pagination";

const PAGE_SIZE = 20;

const ScoringRulesModal: React.FC<{ open: boolean; onClose: () => void }> = ({
	open,
	onClose,
}) => {
	if (!open) return null;
	return (
		<div
			className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden">
				<div className="bg-blue-700 px-5 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">
							📋
						</div>
						<div>
							<p className="text-white font-medium text-sm">Luật tính điểm</p>
							<p className="text-white/65 text-xs">Chuẩn ICPC · BitLearning</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="w-7 h-7 rounded-full bg-white/20 text-white text-sm flex items-center justify-center hover:bg-white/30"
					>
						✕
					</button>
				</div>

				<div className="px-5 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
					<section>
						<p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
							Xếp hạng
						</p>
						<p className="text-sm text-gray-600 leading-relaxed">
							Ai{" "}
							<strong className="text-gray-900 font-medium">
								giải được nhiều bài nhất
							</strong>{" "}
							thì xếp trên. Nếu bằng nhau, ai có{" "}
							<strong className="text-gray-900 font-medium">
								tổng điểm phạt ít hơn
							</strong>{" "}
							thắng. Vẫn bằng thì ai{" "}
							<strong className="text-gray-900 font-medium">
								AC bài cuối sớm hơn
							</strong>{" "}
							xếp trên.
						</p>
					</section>

					<hr className="border-gray-100" />

					<section>
						<p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
							Điểm phạt là gì?
						</p>
						<p className="text-sm text-gray-600 leading-relaxed mb-2">
							Mỗi bài đã AC được tính theo công thức:
						</p>
						<div className="font-mono text-sm bg-gray-50 rounded-lg px-3 py-2.5 text-center text-gray-900">
							Điểm Phạt = thời gian(m) + số lần sai × 20m
						</div>
						<p className="text-sm text-gray-600 leading-relaxed mt-2">
							Trong đó{" "}
							<strong className="text-gray-900 font-medium">thời gian</strong>{" "}
							là thời gian từ lúc cuộc thi bắt đầu đến khi nộp AC lần đầu. Bài{" "}
							<strong className="text-gray-900 font-medium">
								chưa AC thì không bị tính
							</strong>{" "}
							điểm phạt — cứ mạnh dạn thử nộp.
						</p>
					</section>

					<hr className="border-gray-100" />

					<section>
						<p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
							Kết quả chấm bài
						</p>
						<div className="divide-y divide-gray-50">
							{[
								{
									code: "AC",
									ten: "Chấp nhận — đúng toàn bộ",
									phat: null,
									style: "bg-green-100 text-green-800",
								},
								{
									code: "WA",
									ten: "Sai kết quả",
									phat: "+20'",
									style: "bg-red-100 text-red-800",
								},
								{
									code: "TLE",
									ten: "Chạy quá thời gian cho phép",
									phat: "+20'",
									style: "bg-red-100 text-red-800",
								},
								{
									code: "MLE",
									ten: "Dùng quá bộ nhớ cho phép",
									phat: "+20'",
									style: "bg-red-100 text-red-800",
								},
								{
									code: "RE",
									ten: "Chương trình bị lỗi khi chạy",
									phat: "+20'",
									style: "bg-red-100 text-red-800",
								},
								{
									code: "CE",
									ten: "Lỗi biên dịch — không bị phạt",
									phat: null,
									style: "bg-gray-100 text-gray-600",
								},
							].map((v) => (
								<div key={v.code} className="flex items-center gap-3 py-1.5">
									<span
										className={`font-mono text-xs font-medium px-1.5 py-0.5 rounded min-w-7.5 text-center ${v.style}`}
									>
										{v.code}
									</span>
									<span className="text-xs text-gray-700 flex-1">{v.ten}</span>
									{v.phat && (
										<span className="text-xs text-red-600 font-medium">
											{v.phat}
										</span>
									)}
								</div>
							))}
						</div>
					</section>

					<hr className="border-gray-100" />

					<section>
						<p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
							Lời khuyên
						</p>
						<ul className="text-sm text-gray-600 leading-relaxed space-y-1.5 list-disc list-outside pl-4">
							<li>
								<strong className="text-gray-900 font-medium">
									Chắc chắn trước khi nộp
								</strong>{" "}
								— mỗi lần WA/TLE/RE tốn thêm 20 phút điểm phạt.
							</li>
							<li>
								<strong className="text-gray-900 font-medium">
									Bài chưa AC không bị phạt
								</strong>{" "}
								— xấu nhất là không có điểm, cứ thử nộp.
							</li>
							<li>
								<strong className="text-gray-900 font-medium">
									Bắt đầu sớm
								</strong>{" "}
								— giờ AC tính từ lúc cuộc thi mở, không phải lúc bạn vào.
							</li>
							<li>
								<strong className="text-gray-900 font-medium">
									Ưu tiên bài dễ trước
								</strong>{" "}
								— giải nhiều bài là tiêu chí quan trọng nhất.
							</li>
						</ul>
					</section>
				</div>
			</div>
		</div>
	);
};

const ContestLeaderboardContent: React.FC = () => {
	const { id } = useParams({ strict: false });
	const { userInfo } = useSelector(selectAuthStateInfo);
	const [page, setPage] = useState(0);
	const [showScoring, setShowScoring] = useState(false);
	const { data: leaderboardData, isLoading } = useLeaderboard(
		id || "",
		page,
		PAGE_SIZE,
	);

	const leaderboard = leaderboardData?.data || {
		rankings: [],
		totalParticipants: 0,
		myRank: null,
	};

	const prizeTopCount = leaderboardData?.data?.prizeTopCount ?? 0;
	const prizeCoinsPerRank = leaderboardData?.data?.prizeCoinsPerRank ?? [];
	const hasPrize = prizeTopCount > 0 && prizeCoinsPerRank.length > 0;

	const getMedal = (rank: number) =>
		rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏆";

	const getPrizeForRank = (rank: number): number | null => {
		if (!hasPrize || rank < 1 || rank > prizeTopCount) return null;
		return prizeCoinsPerRank[rank - 1] ?? null;
	};

	const totalPages = Math.ceil(leaderboard.totalParticipants / PAGE_SIZE);
	const displayFrom = page * PAGE_SIZE + 1;
	const displayTo = Math.min(
		page * PAGE_SIZE + leaderboard.rankings.length,
		leaderboard.totalParticipants,
	);

	const getInitials = (name: string | null | undefined) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getProblemBadgeClass = (result: any) => {
		if (!result.solved && result.wrongAttempts === 0)
			return "bg-gray-100 text-gray-400";
		if (!result.solved && result.wrongAttempts > 0)
			return "bg-red-500 text-white";
		if (result.solved && result.wrongAttempts === 0)
			return "bg-green-500 text-white";
		return "bg-yellow-500 text-white";
	};

	const formatTime = (minutes: number | null) => {
		if (minutes === null) return "--";
		return `${minutes}m`;
	};

	if (isLoading) return <Loader />;

	return (
		<main className="flex-1 px-6 lg:px-20 py-8">
			<div className="max-w-7xl mx-auto space-y-6">
				<div className="flex items-end justify-between">
					<div>
						<h2 className="text-gray-900 text-2xl font-bold">Bảng xếp hạng</h2>
						<p className="text-gray-500 text-md mt-1">Kết quả thi đấu </p>
					</div>
					<div className="flex gap-3">
						<button
							onClick={() => setShowScoring(true)}
							className="cursor-pointer flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
						>
							<span className="text-sm">📋</span>
							<span className="text-sm font-medium text-gray-600">
								Luật tính điểm
							</span>
						</button>
						<div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
							<Users className="w-5 h-5 text-blue-600" />
							<span className="text-md font-semibold text-gray-500">
								Thí sinh {leaderboard.totalParticipants}
							</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse min-w-250">
							<thead>
								<tr className="bg-gray-50 border-b border-gray-200">
									<th className="px-6 py-4 text-md uppercase font-semibold text-gray-600 w-16 text-center">
										Hạng
									</th>
									<th className="px-6 py-4 text-md uppercase font-semibold text-gray-600">
										Thí sinh
									</th>
									<th className="px-6 py-4 text-md uppercase font-semibold text-gray-600 text-center">
										Đã giải
									</th>
									<th className="px-6 py-4 text-md uppercase font-semibold text-gray-600 text-center">
										Điểm phạt
									</th>
									{hasPrize && (
										<th className="px-6 py-4 text-md uppercase font-semibold text-amber-600 text-center border-l border-gray-200">
											<div className="flex items-center justify-center gap-1">
												<Trophy className="w-3.5 h-3.5" />
												Thưởng
											</div>
										</th>
									)}
									{leaderboard.rankings[0]?.problemResults.map((p: any) => (
										<th
											key={p.label}
											className="px-4 py-4 text-md uppercase font-semibold text-gray-600 text-center w-24 border-l border-gray-200"
										>
											{p.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{leaderboard.rankings.map((ranking: any) => {
									const isCurrentUser = ranking.userId === userInfo?.id;
									const displayName =
										ranking.username ?? `Thí sinh #${ranking.rank}`;
									return (
										<tr
											key={ranking.userId}
											className={`transition-colors ${isCurrentUser ? "bg-blue-50 border-y border-blue-200" : "hover:bg-gray-50"}`}
										>
											<td
												className={`px-6 py-4 text-center font-bold ${isCurrentUser ? "text-blue-600" : "text-gray-700"}`}
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
														<span className="font-medium text-gray-900">
															{displayName}
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
													className={`${isCurrentUser ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"} px-3 py-1 rounded-full text-md font-semibold`}
												>
													{ranking.solvedCount}
												</Badge>
											</td>
											<td className="px-6 py-4 text-center text-md font-medium text-gray-600">
												{ranking.totalPenaltyMinutes}
											</td>
											{hasPrize && (
												<td className="px-6 py-4 text-center border-l border-gray-200">
													{(() => {
														const prize = getPrizeForRank(ranking.rank);
														if (prize) {
															return (
																<span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
																	{getMedal(ranking.rank)}{" "}
																	{prize.toLocaleString()} xu
																</span>
															);
														}
														return <span className="text-gray-300">—</span>;
													})()}
												</td>
											)}
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
					<div className="text-gray-500 text-sm">
						<p>
							Hiển thị {displayFrom}–{displayTo} /{" "}
							{leaderboard.totalParticipants}
						</p>
					</div>
					<div className="flex items-center text-gray-500 text-sm">
						{totalPages > 1 && (
							<Pagination
								currentPage={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						)}
					</div>
				</div>
			</div>

			<ScoringRulesModal
				open={showScoring}
				onClose={() => setShowScoring(false)}
			/>
		</main>
	);
};

export default ContestLeaderboardContent;
