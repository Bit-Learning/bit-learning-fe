import React, { useState } from "react";
import {
	Calendar,
	Timer,
	Trophy,
	Users,
	FileText,
	Medal,
	LogIn,
	Loader2,
	Star,
	CheckCircle2,
	Clock,
	ArrowRight,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { ContestDetailDTO, ContestStatus } from "../types/contest.type";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { useContestDetail, useRegisterContest } from "../queries/useContest";
import { cn } from "@workspace/ui/lib/utils";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

interface RegisterConfirmModalProps {
	contest: ContestDetailDTO;
	onConfirm: () => void;
	onCancel: () => void;
	isPending: boolean;
}

const RegisterConfirmModal: React.FC<RegisterConfirmModalProps> = ({
	contest,
	onConfirm,
	onCancel,
	isPending,
}) => {
	const formatDate = (d: string) =>
		new Date(d).toLocaleDateString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black/50" onClick={onCancel} />
			<div className="relative z-50 bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 overflow-hidden">
				<div className="px-6 py-5 flex items-start gap-3">
					<div>
						<h3 className="text-xl font-bold text-slate-800">
							Xác nhận đăng ký thi
						</h3>
						<p className="text-md text-slate-500 mt-0.5">
							Vui lòng kiểm tra thông tin trước khi đăng ký
						</p>
					</div>
				</div>

				<div className="px-6 py-5 space-y-4">
					<div className="bg-slate-50 rounded-xl p-4 space-y-3">
						<p className="font-bold text-slate-800 text-lg leading-snug">
							{contest.title}
						</p>
						<div className="grid grid-cols-2 gap-2 text-md text-slate-600">
							<div className="flex items-center gap-1.5 col-span-2">
								<Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
								<span>
									Bắt đầu:{" "}
									<span className="font-semibold text-slate-800">
										{formatDate(contest.startTime)}
									</span>
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<Timer className="w-3.5 h-3.5 text-blue-500 shrink-0" />
								<span>
									<span className="font-semibold text-slate-800">
										{contest.durationMinutes}
									</span>{" "}
									phút
								</span>
							</div>
						</div>
					</div>

					<p className="text-md text-slate-500">
						Sau khi đăng ký, bạn sẽ được tham gia kỳ thi này. Bạn có chắc chắn
						muốn đăng ký không?
					</p>
				</div>

				<div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isPending}
						className="cursor-pointer px-5 py-2.5 rounded-xl font-semibold text-md text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
					>
						Hủy
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isPending}
						className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-md text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-2 shadow disabled:opacity-50"
					>
						{isPending ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" /> Đang đăng ký...
							</>
						) : (
							"Xác nhận đăng ký"
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export const ContestInfoContent: React.FC = () => {
	const { id } = useParams({ strict: false });
	const { data: contestData } = useContestDetail(id!);

	const [showConfirm, setShowConfirm] = useState(false);
	const registerMutation = useRegisterContest();

	const contest = contestData?.data;
	if (!contest) return null;

	const isRunning = contest.status === ContestStatus.RUNNING;
	const isUpcoming = contest.status === ContestStatus.UPCOMING;
	const isEnded = contest.status === ContestStatus.ENDED;

	const formatDate = (date: string) =>
		new Date(date).toLocaleString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});

	const getStatusColor = () => {
		switch (contest.status) {
			case ContestStatus.UPCOMING:
				return "bg-blue-100 text-blue-600";
			case ContestStatus.RUNNING:
				return "bg-green-100 text-green-600";
			case ContestStatus.ENDED:
				return "bg-gray-200 text-gray-600";
			default:
				return "bg-gray-100 text-gray-500";
		}
	};

	const getStatusLabel = () => {
		switch (contest.status) {
			case ContestStatus.UPCOMING:
				return "Sắp tới";
			case ContestStatus.RUNNING:
				return "Đang diễn ra";
			case ContestStatus.ENDED:
				return "Đã kết thúc";
		}
	};

	const handleRegisterConfirm = () => {
		registerMutation.mutate(contest.contestId, {
			onSuccess: () => setShowConfirm(false),
		});
	};

	const renderActionButton = () => {
		if (contest.isRegistered) {
			return (
				<div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border border-blue-200 rounded-xl">
					<CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
					<div>
						<p className="font-bold text-blue-700">Đã đăng ký thành công</p>
						<p className="text-sm text-blue-500">
							Cuộc thi sẽ bắt đầu lúc {formatDate(contest.startTime)}
						</p>
					</div>
				</div>
			);
		}

		if (isUpcoming) {
			return (
				<button
					onClick={() => setShowConfirm(true)}
					className="cursor-pointer px-5 py-3 rounded-xl font-bold text-sm text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
				>
					Đăng ký tham gia
				</button>
			);
		}

		if (isRunning && !contest.isRegistered) {
			return (
				<div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl">
					<Clock className="w-5 h-5 text-slate-400 shrink-0" />
					<p className="text-slate-500 font-semibold">
						Đã hết thời hạn đăng ký
					</p>
				</div>
			);
		}

		return null;
	};

	return (
		<>
			{showConfirm && (
				<RegisterConfirmModal
					contest={contest}
					onConfirm={handleRegisterConfirm}
					onCancel={() => setShowConfirm(false)}
					isPending={registerMutation.isPending}
				/>
			)}

			<div className="max-w-5xl mx-auto p-8 space-y-6">
				<div className="flex justify-between px-2">
					<div className="flex items-center gap-2">
						<h1 className="text-3xl font-bold text-slate-900">
							{contest.title}
						</h1>
						<div className="flex items-center gap-3 mt-2 flex-wrap">
							<span
								className={cn(
									"px-3 py-1 rounded-md text-sm font-medium",
									getStatusColor(),
								)}
							>
								{getStatusLabel()}
							</span>
							{contest.myRank && (
								<span className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
									<Medal className="w-4 h-4" /> Rank #{contest.myRank}
								</span>
							)}
						</div>
					</div>
					<div>{renderActionButton()}</div>
				</div>

				<Card className="py-0">
					<CardContent className="p-6 space-y-6">
						<div>
							<p className="text-slate-800 leading-relaxed whitespace-pre-line">
								{contest.description || "Không có mô tả"}
							</p>
						</div>

						<div className="h-px bg-slate-200 dark:bg-slate-700" />

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
									Bắt đầu
								</span>
								<div className="flex items-center gap-2 text-slate-700 font-semibold">
									<Calendar className="w-4 h-4 text-slate-400 shrink-0" />
									{formatDate(contest.startTime)}
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
									Kết thúc
								</span>
								<div className="flex items-center gap-2 text-slate-700 font-semibold">
									<Calendar className="w-4 h-4 text-slate-400 shrink-0" />
									{formatDate(contest.endTime)}
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
									Thời lượng
								</span>
								<div className="flex items-center gap-2 text-slate-700 font-semibold">
									<Timer className="w-4 h-4 text-slate-400 shrink-0" />
									{contest.durationMinutes} phút
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
									Số bài
								</span>
								<div className="flex items-center gap-2 text-slate-700 font-semibold">
									<FileText className="w-4 h-4 text-slate-400 shrink-0" />
									{contest.problemCount} bài
								</div>
							</div>

							<div className="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
									Thí sinh
								</span>
								<div className="flex items-center gap-2 text-slate-700 font-semibold">
									<Users className="w-4 h-4 text-slate-400 shrink-0" />
									{contest.participantCount.toLocaleString()} người tham gia
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{contest.prizeTopCount && contest.prizeCoinsPerRank?.length ? (
					<Card className="py-0">
						<CardContent className="p-6 space-y-4">
							<div className="flex items-center gap-2">
								<Trophy className="w-5 h-5 text-amber-600" />
								<h2 className="font-semibold text-amber-700">Giải thưởng</h2>
							</div>

							<div className="space-y-2">
								{contest.prizeCoinsPerRank.map((coin, i) => {
									const medal =
										i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏆";
									return (
										<div
											key={i}
											className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-amber-400"
										>
											<div className="flex items-center gap-2">
												<span>{medal}</span>
												<span className="font-semibold text-slate-700">
													Top {i + 1}
												</span>
											</div>
											<span className="font-bold text-amber-600 flex items-center gap-1">
												{coin.toLocaleString()} <BitCoinIcon size={20} />
											</span>
										</div>
									);
								})}
							</div>

							{contest.prizesDistributed && (
								<p className="text-xs text-green-600 font-semibold">
									✔ Đã phát thưởng
								</p>
							)}
						</CardContent>
					</Card>
				) : null}

				{isEnded && contest.myRank && (
					<Card>
						<CardContent className="p-6">
							<h2 className="font-semibold mb-3 text-slate-800">
								Kết quả của tôi
							</h2>
							<div className="flex items-center gap-6">
								<div>
									<p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
										Thứ hạng
									</p>
									<p className="text-3xl font-black text-blue-600">
										#{contest.myRank}
										<span className="text-base text-slate-400 font-semibold">
											/{contest.participantCount.toLocaleString()}
										</span>
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</>
	);
};
