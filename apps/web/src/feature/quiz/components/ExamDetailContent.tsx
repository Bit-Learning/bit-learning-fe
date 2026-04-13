import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	ChevronRight,
	Timer,
	Lock,
	PlayCircle,
	HelpCircle,
	Clock,
	BookOpen,
	Star,
	FileText,
	CheckCircle2,
	Eye,
	Rocket,
	KeyRound,
	AlertCircle,
	Tag,
} from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import {
	useMyQuizAttempts,
	useMyQuizSessions,
	useStartQuizAttempt,
	useResumeQuizAttempt,
	useStartQuizSession,
} from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";
import { toast } from "@/shared/components/Sonner";
import { QuizSessionType } from "../types/quiz.type";

const SectionDivider = ({ label }: { label: string }) => (
	<div className="flex items-center gap-4 mb-6">
		<div className="h-px flex-1 bg-slate-200" />
		<h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
			{label}
		</h2>
		<div className="h-px w-8 bg-slate-200" />
	</div>
);

const ExamDetailContent: React.FC = () => {
	const navigate = useNavigate();
	const { examId } = useParams({ from: "/_layout/exams/$examId" });
	const [resumingAttemptId, setResumingAttemptId] = useState<number | null>(
		null,
	);
	const [enrollKeyInput, setEnrollKeyInput] = useState("");
	const [enrollKeyError, setEnrollKeyError] = useState("");

	const { data: exam, isLoading: examLoading } = useExam(Number(examId), {
		enabled: !!examId,
	});

	const isPracticeType = exam?.type === "PRACTICE";

	const { data: allAttemptsResponse } = useMyQuizAttempts({
		page: 0,
		size: 100,
	});
	const { data: allSessionsResponse } = useMyQuizSessions({
		page: 0,
		size: 100,
	});

	const startAttemptMutation = useStartQuizAttempt();
	const resumeAttemptMutation = useResumeQuizAttempt();
	const startSessionMutation = useStartQuizSession();

	const attempts = !isPracticeType
		? Array.isArray(allAttemptsResponse)
			? allAttemptsResponse.filter((a) => a.exam.id === Number(examId))
			: []
		: [];

	const sessions = isPracticeType
		? Array.isArray(allSessionsResponse)
			? allSessionsResponse.filter((s) => s.exam.id === Number(examId))
			: []
		: [];

	const canStartExam = exam?.isPublished;
	const hasHistory = attempts.length > 0 || sessions.length > 0;
	const requiresEnrollKey = exam?.type === "EXAM";

	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	const formatDuration = (start: string, end?: string) => {
		if (!end) return "Đang làm";
		const diffMs = new Date(end).getTime() - new Date(start).getTime();
		const minutes = Math.floor(diffMs / 60000);
		const seconds = Math.floor((diffMs % 60000) / 1000);
		return `${minutes} phút ${seconds} giây`;
	};

	const handleStartExam = async () => {
		if (!canStartExam) return;
		if (requiresEnrollKey && !enrollKeyInput.trim()) {
			setEnrollKeyError("Vui lòng nhập mật khẩu để vào thi");
			return;
		}
		setEnrollKeyError("");
		try {
			const response = await startAttemptMutation.mutateAsync({
				examId: Number(examId),
				enrollKey: requiresEnrollKey ? enrollKeyInput.trim() : undefined,
			});
			toast.success({
				title: "Bắt đầu làm bài thi",
				description: "Chúc bạn làm bài tốt!",
			});
			navigate({
				to: "/quiz-attempts/$attemptId",
				params: { attemptId: String(response.data.data!.id) },
			});
		} catch (error: any) {
			const msg = error?.response?.data?.message;
			if (
				msg?.toLowerCase().includes("enroll") ||
				msg?.toLowerCase().includes("key") ||
				msg?.toLowerCase().includes("password")
			) {
				setEnrollKeyError("Mật khẩu không đúng. Vui lòng thử lại.");
			} else {
				toast.error({
					title: "Lỗi",
					description: "Không thể bắt đầu bài thi. Vui lòng thử lại.",
				});
			}
		}
	};

	const handleResumeAttempt = async (attemptId: number) => {
		setResumingAttemptId(attemptId);
		try {
			const storedToken =
				localStorage.getItem(`quiz_device_token_${examId}`) ?? undefined;
			await resumeAttemptMutation.mutateAsync({
				examId: Number(examId),
				deviceToken: storedToken,
			});
			navigate({
				to: "/quiz-attempts/$attemptId",
				params: { attemptId: String(attemptId) },
			});
		} catch {
			toast.error({ title: "Lỗi", description: "Không thể tiếp tục bài thi." });
		} finally {
			setResumingAttemptId(null);
		}
	};

	const handleStartPractice = async () => {
		if (!exam) return;
		try {
			const response = await startSessionMutation.mutateAsync({
				examId: Number(examId),
				type: "PRACTICE" as QuizSessionType,
			});
			toast.success({
				title: "Bắt đầu luyện tập",
				description: "Bạn có thể học tập thoải mái!",
			});
			navigate({
				to: "/quiz-sessions/$sessionId",
				params: { sessionId: String(response.data.data!.id) },
			});
		} catch {
			toast.error({
				title: "Lỗi",
				description: "Không thể bắt đầu phiên luyện tập.",
			});
		}
	};

	if (examLoading) {
		return (
			<div className="min-h-screen bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Skeleton className="h-8 w-64 mb-8" />
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 space-y-6">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-64 w-full" />
						</div>
						<Skeleton className="h-96 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (!exam) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="max-w-md text-center p-12">
					<FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
					<h3 className="text-xl font-bold mb-2 text-slate-800">
						Không tìm thấy đề thi
					</h3>
					<p className="text-slate-500 mb-6">
						Đề thi này không tồn tại hoặc đã bị xóa.
					</p>
					<button
						onClick={() => navigate({ to: "/exams" })}
						className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
					>
						Quay lại danh sách
					</button>
				</div>
			</div>
		);
	}

	const isPractice = exam.type === "PRACTICE";
	const accentColor = isPractice ? "text-orange-500" : "text-blue-600";

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<nav className="text-md text-gray-500 flex items-center">
						<span
							onClick={() => navigate({ to: "/" })}
							className="hover:text-blue-600 cursor-pointer"
						>
							Trang chủ
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span
							onClick={() => navigate({ to: "/exams" })}
							className="hover:text-blue-600 cursor-pointer"
						>
							Danh sách đề thi
						</span>{" "}
						<span className="mx-2 text-gray-400">/</span>
						<span className="text-blue-600 font-medium">{exam.name}</span>
					</nav>
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<header className="mb-10">
					<div className="flex flex-wrap items-baseline gap-4 mb-2">
						<h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
							{exam.name}
						</h1>
						<span
							className={cn(
								"px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
								isPractice
									? "bg-orange-100 text-orange-600"
									: "bg-blue-100 text-blue-700",
							)}
						>
							{isPractice ? "Luyện tập" : "Kỳ thi"}
						</span>
					</div>
					<div className="flex items-center gap-2 text-slate-400 text-sm font-mono font-semibold tracking-widest uppercase">
						<span>#</span>
						<span>{exam.code}</span>
					</div>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					<div className="lg:col-span-2 space-y-12">
						<section>
							<SectionDivider label="Thông tin chung" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[
									{
										icon: <BookOpen className="w-5 h-5" />,
										label: "Môn học",
										value: exam.subject?.name ?? "—",
									},
									{
										icon: <Tag className="w-5 h-5" />,
										label: "Loại hình",
										value: isPractice ? "Luyện tập" : "Kỳ thi chính thức",
									},
									{
										icon: <HelpCircle className="w-5 h-5" />,
										label: "Số câu hỏi",
										value: `${exam.examQuestions?.length || 0} câu`,
									},
									{
										icon: <Star className="w-5 h-5" />,
										label: "Tổng điểm",
										value: `${exam.totalScore ?? 10} điểm`,
									},
								].map((item) => (
									<div
										key={item.label}
										className="p-5 rounded-xl bg-white border border-slate-200 flex items-start gap-4 shadow-sm hover:-translate-y-0.5 transition-transform"
									>
										<span
											className={cn(
												"p-2.5 rounded-lg bg-slate-50 shrink-0",
												accentColor,
											)}
										>
											{item.icon}
										</span>
										<div>
											<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
												{item.label}
											</p>
											<p className="font-bold text-slate-800">{item.value}</p>
										</div>
									</div>
								))}
							</div>
						</section>

						<section>
							<SectionDivider label="Lịch sử làm bài" />
							{hasHistory ? (
								<div className="space-y-3">
									{attempts.map((attempt, index) => {
										const isSubmitted = attempt.status === "SUBMITTED";
										const isDoing = attempt.status === "DOING";
										const isResuming = resumingAttemptId === attempt.id;
										return (
											<div
												key={`attempt-${attempt.id}`}
												className="p-5 rounded-xl bg-white border border-slate-200 border-l-4 border-l-blue-500 shadow-sm"
											>
												<div className="flex items-center justify-between gap-4 flex-wrap">
													<div className="flex items-center gap-4">
														<div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center font-black text-blue-600 border border-blue-200 shrink-0">
															#{index + 1}
														</div>
														<div>
															<div className="flex items-center gap-2 mb-1 flex-wrap">
																<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
																	Chế độ thi
																</span>
																{isSubmitted ? (
																	<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
																		<CheckCircle2 className="w-3 h-3" /> Đã nộp
																	</span>
																) : (
																	<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 flex items-center gap-1">
																		<Clock className="w-3 h-3" /> Đang làm
																	</span>
																)}
															</div>
															<p className="font-semibold text-slate-800 text-sm">
																{formatDate(
																	attempt.submittedAt || attempt.startTime,
																)}
															</p>
															<p className="text-xs text-slate-400 mt-0.5">
																{formatDuration(
																	attempt.startTime,
																	attempt.submittedAt,
																)}
															</p>
														</div>
													</div>
													<div className="flex items-center gap-3">
														{isSubmitted && attempt.score !== undefined && (
															<div className="text-right">
																<p className="text-[10px] text-slate-400 uppercase tracking-wider">
																	Điểm số
																</p>
																<p className="text-2xl font-black text-blue-600">
																	{attempt.score.toFixed(1)}
																	<span className="text-sm text-slate-400 ml-1">
																		/{exam?.totalScore}
																	</span>
																</p>
															</div>
														)}
														{isDoing && (
															<button
																disabled={isResuming}
																onClick={() => handleResumeAttempt(attempt.id)}
																className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
															>
																{isResuming ? (
																	<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
																) : (
																	<PlayCircle className="w-4 h-4" />
																)}
																{isResuming ? "Đang tải..." : "Tiếp tục"}
															</button>
														)}
														{isSubmitted && (
															<button
																onClick={() =>
																	navigate({
																		to: "/quiz-attempts/$attemptId/result",
																		params: { attemptId: String(attempt.id) },
																	})
																}
																className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
															>
																<Eye className="w-4 h-4" /> Xem kết quả
															</button>
														)}
													</div>
												</div>
											</div>
										);
									})}

									{sessions.map((session, index) => {
										const isSubmitted = session.status === "SUBMITTED";
										const isExpired = session.status === "EXPIRED";
										const isDoing = session.status === "DOING";
										return (
											<div
												key={`session-${session.id}`}
												className="p-5 rounded-xl bg-white border border-slate-200 border-l-4 border-l-orange-400 shadow-sm"
											>
												<div className="flex items-center justify-between gap-4 flex-wrap">
													<div className="flex items-center gap-4">
														<div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center font-black text-orange-500 border border-orange-200 shrink-0">
															L{index + 1}
														</div>
														<div>
															<div className="flex items-center gap-2 mb-1 flex-wrap">
																<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
																	Luyện tập
																</span>
																{isSubmitted ? (
																	<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
																		<CheckCircle2 className="w-3 h-3" /> Hoàn
																		thành
																	</span>
																) : isExpired ? (
																	<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
																		Hết hạn
																	</span>
																) : (
																	<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 flex items-center gap-1">
																		<Clock className="w-3 h-3" /> Đang làm
																	</span>
																)}
															</div>
															<p className="font-semibold text-slate-800 text-sm">
																{formatDate(session.startTime)}
															</p>
															<p className="text-xs text-slate-400 mt-0.5">
																Câu {session.currentIndex + 1} /{" "}
																{exam?.examQuestions?.length || 0}
															</p>
														</div>
													</div>
													<div className="flex items-center gap-2">
														{isDoing && (
															<button
																onClick={() =>
																	navigate({
																		to: "/quiz-sessions/$sessionId",
																		params: { sessionId: String(session.id) },
																	})
																}
																className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
															>
																<PlayCircle className="w-4 h-4" /> Tiếp tục
															</button>
														)}
														{isSubmitted && (
															<button
																onClick={() =>
																	navigate({
																		to: "/quiz-sessions/$sessionId/result",
																		params: { sessionId: String(session.id) },
																	})
																}
																className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
															>
																<Eye className="w-4 h-4" /> Xem kết quả
															</button>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="py-14 text-center bg-white border border-slate-200 rounded-xl">
									<div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<Clock className="w-7 h-7 text-slate-400" />
									</div>
									<p className="font-semibold text-slate-600">
										Bạn chưa có lịch sử làm bài
									</p>
									<p className="text-sm text-slate-400 mt-1">
										Hãy bắt đầu làm bài ngay!
									</p>
								</div>
							)}
						</section>
					</div>

					<aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
						<div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
							<div className={cn("px-6 py-5")}>
								<h3 className="font-bold text-lg flex items-center gap-2 text-black">
									{isPractice ? "Bắt đầu luyện tập" : "Tham gia thi"}
								</h3>
							</div>

							<div className="p-6 space-y-4">
								<div className="space-y-2.5 pb-4 border-b border-slate-100">
									{[
										{
											icon: <HelpCircle className="w-4 h-4" />,
											label: "Số câu hỏi",
											value: `${exam.examQuestions?.length || 0} câu`,
										},
										{
											icon: <Timer className="w-4 h-4" />,
											label: "Thời gian",
											value: isPractice
												? "Không giới hạn"
												: `${exam.durationInMinutes} phút`,
										},
									].map((item) => (
										<div
											key={item.label}
											className="flex justify-between items-center text-sm"
										>
											<span className="flex items-center gap-2 text-slate-500">
												<span className={accentColor}>{item.icon}</span>
												{item.label}
											</span>
											<span className="font-bold text-slate-800">
												{item.value}
											</span>
										</div>
									))}
								</div>

								{canStartExam ? (
									<div className="space-y-3">
										{requiresEnrollKey && (
											<div>
												<label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
													<KeyRound className="w-3.5 h-3.5" /> Mật khẩu vào thi{" "}
													<span className="text-red-500">*</span>
												</label>
												<input
													type="password"
													placeholder="Nhập mật khẩu..."
													value={enrollKeyInput}
													onChange={(e) => {
														setEnrollKeyInput(e.target.value);
														if (enrollKeyError) setEnrollKeyError("");
													}}
													className={cn(
														"w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all",
														enrollKeyError
															? "border-red-400 focus:ring-2 focus:ring-red-400/30"
															: "border-slate-200 focus:ring-2 focus:ring-blue-500/30",
													)}
												/>
												{enrollKeyError && (
													<p className="text-xs text-red-500 mt-1 flex items-center gap-1">
														<AlertCircle className="w-3 h-3" /> {enrollKeyError}
													</p>
												)}
											</div>
										)}

										{isPractice ? (
											<button
												onClick={handleStartPractice}
												disabled={startSessionMutation.isPending}
												className="cursor-pointer w-full h-12 flex items-center justify-center gap-2 rounded-md font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60"
											>
												{startSessionMutation.isPending ? (
													<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
												) : (
													<></>
												)}
												{startSessionMutation.isPending
													? "Đang khởi tạo..."
													: "Bắt đầu luyện tập"}
											</button>
										) : (
											<>
												<button
													onClick={handleStartExam}
													disabled={
														startAttemptMutation.isPending ||
														(requiresEnrollKey && !enrollKeyInput.trim())
													}
													className="cursor-pointer w-full h-12 flex items-center justify-center gap-2 rounded-md font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
												>
													{startAttemptMutation.isPending ? (
														<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
													) : (
														<></>
													)}
													{startAttemptMutation.isPending
														? "Đang khởi tạo..."
														: "Bắt đầu thi"}
												</button>
												<p className="text-xs text-center text-slate-400">
													Có giới hạn thời gian và không thể tạm dừng
												</p>
											</>
										)}
									</div>
								) : (
									<div className="text-center space-y-3 py-2">
										<div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
											<Lock className="w-7 h-7 text-amber-500" />
										</div>
										<p className="font-semibold text-slate-800">
											Đề thi chưa mở
										</p>
										<p className="text-sm text-slate-400">
											Vui lòng chờ giáo viên mở đề
										</p>
									</div>
								)}
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
};

export default ExamDetailContent;
