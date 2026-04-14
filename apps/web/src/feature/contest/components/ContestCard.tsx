import React, { useState } from "react";
import {
	Star,
	FileText,
	Users,
	Timer,
	Calendar,
	LogIn,
	Loader2,
	AlertCircle,
	Trophy,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { ContestListDTO, ContestStatus } from "../types/contest.type";
import { useRegisterContest } from "../queries/useContest";

interface ContestCardProps {
	contest: ContestListDTO & {
		durationMinutes?: number;
		progress?: number;
		timeLeft?: string;
		countdown?: { d?: number; h?: number; m?: number; s?: number };
		myRank?: number | null;
		myScore?: { current: number; total: number };
	};
}

const StatusBadge = ({ status }: { status: ContestStatus }) => {
	if (status === ContestStatus.RUNNING)
		return (
			<span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
				<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
				Đang diễn ra
			</span>
		);
	if (status === ContestStatus.UPCOMING)
		return (
			<span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
				Sắp tới
			</span>
		);
	return (
		<span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
			Đã kết thúc
		</span>
	);
};

interface RegisterConfirmModalProps {
	contest: ContestCardProps["contest"];
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
				<div className=" px-6 py-5 flex items-start gap-3">
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
						<p className="font-bold text-slate-800 text-base leading-snug">
							{contest.title}
						</p>
						<div className="grid grid-cols-2 gap-2 text-md text-slate-600">
							{!!contest.durationMinutes && (
								<div className="flex items-center gap-1.5">
									<Timer className="w-3.5 h-3.5 text-blue-500 shrink-0" />
									<span>
										<span className="font-semibold text-slate-800">
											{contest.durationMinutes}
										</span>{" "}
										phút
									</span>
								</div>
							)}
							<div className="flex items-center gap-1.5">
								<Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
								<span>
									<span className="font-semibold text-slate-800">
										{contest.participantCount.toLocaleString()}
									</span>{" "}
									thí sinh
								</span>
							</div>
							<div className="flex items-center gap-1.5 col-span-2">
								<Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
								<span>
									Bắt đầu:{" "}
									<span className="font-semibold text-slate-800">
										{formatDate(contest.startTime)}
									</span>
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

export const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
	const [showConfirm, setShowConfirm] = useState(false);

	const isRunning = contest.status === ContestStatus.RUNNING;
	const isUpcoming = contest.status === ContestStatus.UPCOMING;
	const isEnded = contest.status === ContestStatus.ENDED;

	const registerMutation = useRegisterContest();

	const formatDate = (d: string) =>
		new Date(d).toLocaleDateString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "2-digit",
		});

	const handleRegisterConfirm = () => {
		registerMutation.mutate(contest.contestId, {
			onSuccess: () => setShowConfirm(false),
		});
	};

	const iconColor = isRunning
		? "text-green-600"
		: isUpcoming
			? "text-blue-600"
			: "text-slate-400";

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

			<div className="bg-white border rounded-md p-6 group transition-all shadow-sm hover:shadow-md flex flex-col gap-4">
				<div className="flex items-center gap-2 flex-wrap">
					<StatusBadge status={contest.status} />
					{contest.isRegistered && (
						<span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
							<Star className="w-3 h-3 fill-current" /> Đã đăng ký
						</span>
					)}
				</div>

				<Link to="/contests/$id/problems" params={{ id: contest.contestId }}>
					<h3
						className={cn(
							"text-xl font-bold leading-snug transition-colors",
							isEnded
								? "text-slate-500 group-hover:text-slate-700"
								: "text-slate-900 group-hover:text-blue-600",
						)}
					>
						{contest.title}
					</h3>
				</Link>

				{contest.prizeTopCount &&
					contest.prizeTopCount > 0 &&
					contest.prizeCoinsPerRank &&
					contest.prizeCoinsPerRank.length > 0 && (
						<div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
							<Trophy className="w-4 h-4 text-amber-500 shrink-0" />
							<span className="text-sm font-semibold text-amber-700">
								Giải thưởng:{" "}
								{contest.prizeCoinsPerRank
									.map((c) => c.toLocaleString())
									.join(" / ")}{" "}
								xu
							</span>
						</div>
					)}

				<div className="grid grid-cols-2 gap-x-6 gap-y-3">
					{!!contest.problemCount && (isRunning || isEnded) && (
						<div className="flex items-center gap-2 text-md text-slate-600">
							<FileText className={cn("w-4 h-4 shrink-0", iconColor)} />
							<span>
								<span className="font-semibold text-slate-800">
									{contest.problemCount}
								</span>{" "}
								bài tập
							</span>
						</div>
					)}
					<div className="flex items-center gap-2 text-md text-slate-600">
						<Users className={cn("w-4 h-4 shrink-0", iconColor)} />
						<span>
							<span className="font-semibold text-slate-800">
								{contest.participantCount.toLocaleString()}
							</span>{" "}
							thí sinh
						</span>
					</div>
					{!!contest.durationMinutes && (
						<div className="flex items-center gap-2 text-md text-slate-600">
							<Timer className={cn("w-4 h-4 shrink-0", iconColor)} />
							<span>
								<span className="font-semibold text-slate-800">
									{contest.durationMinutes}
								</span>{" "}
								phút
							</span>
						</div>
					)}
					<div className="flex items-center gap-2 text-md text-slate-600">
						<Calendar className={cn("w-4 h-4 shrink-0", iconColor)} />
						<span className="font-semibold text-slate-800">
							{formatDate(isUpcoming ? contest.startTime : contest.endTime)}
						</span>
					</div>
				</div>

				{isRunning && contest.progress !== undefined && (
					<div className="space-y-1.5">
						<div className="flex justify-between text-xs font-semibold text-slate-500">
							<span>Tiến trình</span>
							<span className="text-green-600">
								Còn lại: {contest.timeLeft}
							</span>
						</div>
						<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
							<div
								className="h-full bg-green-500 rounded-full transition-all"
								style={{ width: `${contest.progress}%` }}
							/>
						</div>
					</div>
				)}

				{isUpcoming && contest.countdown && (
					<div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
							Bắt đầu sau
						</p>
						<div className="flex items-baseline gap-2 text-blue-600 font-black text-2xl">
							{contest.countdown.d !== undefined && (
								<>
									<span>{String(contest.countdown.d).padStart(2, "0")}d</span>
									<span className="text-slate-300 text-base">:</span>
								</>
							)}
							<span>{String(contest.countdown.h ?? 0).padStart(2, "0")}h</span>
							<span className="text-slate-300 text-base">:</span>
							<span>{String(contest.countdown.m ?? 0).padStart(2, "0")}m</span>
						</div>
					</div>
				)}

				{isEnded && contest.myScore && contest.myRank && (
					<div className="flex gap-6">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
								Điểm số
							</p>
							<p className="text-2xl font-black text-blue-600">
								{contest.myScore.current}
								<span className="text-md text-slate-400">
									/{contest.myScore.total}
								</span>
							</p>
						</div>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
								Thứ hạng
							</p>
							<p className="text-2xl font-black text-blue-600">
								#{contest.myRank}
								<span className="text-md text-slate-400">
									/{contest.participantCount.toLocaleString()}
								</span>
							</p>
						</div>
					</div>
				)}

				<div className="mt-auto pt-2">
					{isRunning && contest.isRegistered && (
						<Link
							to="/contests/$id/problems"
							params={{ id: contest.contestId }}
						>
							<button className="cursor-pointer w-full py-2.5 rounded-xl font-bold text-md text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow">
								Vào phòng thi <LogIn className="w-4 h-4" />
							</button>
						</Link>
					)}
					{isRunning && !contest.isRegistered && (
						<button
							disabled
							className="w-full py-2.5 rounded-xl font-bold text-md text-slate-400 bg-slate-100 cursor-not-allowed"
						>
							Quá hạn đăng ký
						</button>
					)}
					{isUpcoming && contest.isRegistered && (
						<Link
							to="/contests/$id/problems"
							params={{ id: contest.contestId }}
						>
							<button className="cursor-pointer w-full py-2.5 rounded-xl font-bold text-md text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow">
								Xem chi tiết <LogIn className="w-4 h-4" />
							</button>
						</Link>
					)}
					{isUpcoming && !contest.isRegistered && (
						<button
							onClick={() => setShowConfirm(true)}
							className="cursor-pointer w-full py-2.5 rounded-xl font-bold text-md text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow"
						>
							Đăng ký ngay
						</button>
					)}
					{isEnded && (
						<Link
							to="/contests/$id/problems"
							params={{ id: contest.contestId }}
						>
							<button className="cursor-pointer w-full py-2.5 rounded-xl font-bold text-md text-blue-600 border-2 border-blue-600 hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2">
								Xem kết quả <LogIn className="w-4 h-4" />
							</button>
						</Link>
					)}
				</div>
			</div>
		</>
	);
};
