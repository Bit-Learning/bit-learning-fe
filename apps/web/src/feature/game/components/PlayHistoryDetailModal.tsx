import type {
	PlayHistoryDetail,
	PlayHistoryItem,
} from "@/feature/game/services/studentService";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";

interface PlayHistoryDetailModalProps {
	open: boolean;
	onClose: () => void;
	item: PlayHistoryItem | null;
	detail: PlayHistoryDetail | null;
	loading?: boolean;
}

const formatDuration = (duration: number) =>
	`${Math.floor(duration / 60)}m ${duration % 60}s`;

const getCurriculumLabel = (item: PlayHistoryItem | PlayHistoryDetail) => {
	const parts = [
		item.bookTitle ?? item.bookCode,
		typeof item.grade === "number" ? `Lớp ${item.grade}` : null,
		item.topicLetter ? `Chủ đề ${item.topicLetter}` : null,
		typeof item.part === "number" ? `Phần ${item.part}` : null,
	];

	return parts.filter(Boolean).join(" • ");
};

const outcomeLabel: Record<string, string> = {
	correct: "Đúng",
	wrong: "Sai",
	timeout: "Hết giờ",
};

const outcomeClassName: Record<string, string> = {
	correct: "bg-emerald-100 text-emerald-700",
	wrong: "bg-rose-100 text-rose-700",
	timeout: "bg-amber-100 text-amber-700",
};

export default function PlayHistoryDetailModal({
	open,
	onClose,
	item,
	detail,
	loading = false,
}: PlayHistoryDetailModalProps) {
	const resolved = detail ?? item;
	const questionResults = detail?.questionResults ?? [];
	const scoringModel = resolved?.scoringModel ?? "FINITE_SCORE";
	const isFiniteScore = scoringModel === "FINITE_SCORE";
	const isHighScore = scoringModel === "HIGH_SCORE";

	return (
		<AlertDialog
			open={open}
			onOpenChange={(nextOpen) => !nextOpen && onClose()}
		>
			<AlertDialogContent className="max-w-4xl">
				<AlertDialogHeader>
					<AlertDialogTitle>
						{resolved?.gameTitle ?? "Chi tiết lượt chơi"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{resolved
							? getCurriculumLabel(resolved) ||
								(resolved.questionSetTitle
									? `${resolved.questionSetTitle}${resolved.questionSetVersion ? ` • ${resolved.questionSetVersion}` : ""}`
									: "Theo dõi chi tiết theo từng câu hỏi.")
							: "Theo dõi chi tiết theo từng câu hỏi."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				{resolved ? (
					<div className="space-y-5">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<SummaryCard
								label={
									isFiniteScore
										? "Độ chính xác"
										: isHighScore
											? "Điểm thô"
											: "Trạng thái theo dõi"
								}
								value={
									isFiniteScore
										? `${resolved.accuracy ?? 0}%`
										: isHighScore
											? String(resolved.rawScore ?? 0)
											: resolved.completed
												? "Đã lưu"
												: "Bỏ dở"
								}
							/>
							<SummaryCard
								label={isFiniteScore ? "Đúng / Sai" : "Điểm xếp hạng"}
								value={
									isFiniteScore
										? `${resolved.correctCount ?? 0} / ${resolved.wrongCount ?? 0}`
										: String(resolved.leaderboardPoints ?? 0)
								}
							/>
							<SummaryCard
								label={isFiniteScore ? "Hết giờ" : "Kiểu tính điểm"}
								value={
									isFiniteScore
										? String(resolved.timeoutCount ?? 0)
										: scoringModel
								}
							/>
							<SummaryCard
								label="Thời gian"
								value={formatDuration(resolved.duration ?? 0)}
							/>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
							<div className="flex flex-wrap items-center gap-3">
								<span>
									Lần ghi nhận: {resolved.attemptType ?? "STANDARD_HTML"}
								</span>
								<span>Mô hình: {resolved.scoringModel ?? "FINITE_SCORE"}</span>
								<span>
									Trạng thái:{" "}
									<span
										className={`font-semibold ${
											resolved.completed ? "text-emerald-600" : "text-amber-600"
										}`}
									>
										{resolved.completed ? "Hoàn thành" : "Chưa hoàn thành"}
									</span>
								</span>
								{isFiniteScore ? (
									<>
										<span>Tổng câu: {resolved.totalCount ?? 0}</span>
										<span>Đã trả lời: {resolved.answeredCount ?? 0}</span>
									</>
								) : null}
								{resolved.exitReason && (
									<span>Lý do thoát: {resolved.exitReason}</span>
								)}
								<span>
									Ngày chơi:{" "}
									{new Date(resolved.playedAt).toLocaleString("vi-VN")}
								</span>
							</div>
						</div>

						<div className="max-h-[50vh] space-y-3 overflow-y-auto pr-2">
							{loading ? (
								<div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
									Đang tải chi tiết lượt chơi...
								</div>
							) : questionResults.length > 0 && isFiniteScore ? (
								questionResults.map((question) => (
									<div
										key={`${question.questionId}-${question.order}`}
										className="rounded-xl border border-slate-200 bg-white p-4"
									>
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div className="font-semibold text-slate-900">
												Câu {question.order}
											</div>
											<div
												className={`rounded-full px-3 py-1 text-xs font-semibold ${outcomeClassName[question.outcome] ?? "bg-slate-100 text-slate-700"}`}
											>
												{outcomeLabel[question.outcome] ?? question.outcome}
											</div>
										</div>
										<p className="mt-3 text-sm font-medium leading-6 text-slate-800">
											{question.prompt}
										</p>
										<div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
											<div>
												<span className="font-semibold text-slate-700">
													Bạn chọn:
												</span>{" "}
												{question.selectedAnswerText || "Không có"}
											</div>
											<div>
												<span className="font-semibold text-slate-700">
													Đáp án đúng:
												</span>{" "}
												{question.correctAnswerText || "Không có"}
											</div>
											<div>Loại câu: {question.type}</div>
											<div>
												Thời gian:{" "}
												{Math.round((question.durationMs ?? 0) / 100) / 10}s
											</div>
										</div>
									</div>
								))
							) : (
								<div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
									Lượt chơi này chưa có dữ liệu chi tiết từng câu.
								</div>
							)}
						</div>
					</div>
				) : null}

				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Đóng</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function SummaryCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4">
			<div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
				{label}
			</div>
			<div className="mt-2 text-xl font-bold text-slate-900">{value}</div>
		</div>
	);
}
