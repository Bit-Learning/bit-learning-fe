import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	Award,
	CheckCircle2,
	XCircle,
	EyeOff,
	LayoutGrid,
	BookOpen,
	RefreshCw,
	Home,
	Info,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useQuizSession } from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";

const PracticeResultContent: React.FC = () => {
	const navigate = useNavigate();
	const { sessionId } = useParams({
		from: "/_layout/quiz-sessions/$sessionId/result",
	});

	const { data: result, isLoading: sessionLoading } = useQuizSession(
		Number(sessionId),
	);
	const { data: examData, isLoading: examLoading } = useExam(
		result?.exam?.id || 0,
		{
			enabled: !!result?.exam?.id,
		},
	);

	const fullQuestionsMap = new Map(
		(examData?.examQuestions || []).map((eq) => [eq.question.id, eq.question]),
	);

	const getIsCorrect = (
		questionId: number,
		selectedIds?: number[],
	): boolean => {
		const question = fullQuestionsMap.get(questionId);
		if (!question?.options?.length || !selectedIds?.length) return false;
		const correctIds = new Set(
			question.options.filter((o) => o.isCorrect).map((o) => o.id),
		);
		const selectedSet = new Set(selectedIds);
		return (
			[...correctIds].every((id) => selectedSet.has(id)) &&
			[...selectedSet].every((id) => correctIds.has(id))
		);
	};

	const isEssay = (type: string) => type?.toUpperCase() === "ESSAY";

	if (sessionLoading || examLoading) {
		return (
			<div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-slate-600 dark:text-slate-400 font-medium">
						Đang tải kết quả...
					</p>
				</div>
			</div>
		);
	}

	if (!result) {
		return (
			<div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
				<p className="text-slate-500">Không tìm thấy kết quả.</p>
			</div>
		);
	}

	const correctAnswers = result.answers.filter((a) => {
		if (isEssay(a.question.questionType)) return false;
		return getIsCorrect(a.question.id, a.selectedOptionIds);
	}).length;

	const wrongAnswers = result.answers.filter((a) => {
		if (isEssay(a.question.questionType)) return false;
		const hasAnswer = (a.selectedOptionIds?.length ?? 0) > 0;
		return hasAnswer && !getIsCorrect(a.question.id, a.selectedOptionIds);
	}).length;

	const skippedAnswers = result.answers.filter((a) => {
		if (isEssay(a.question.questionType))
			return !!a.answerText?.trim() === false;
		return (a.selectedOptionIds?.length ?? 0) === 0;
	}).length;

	const mcqTotal = result.answers.filter(
		(a) => !isEssay(a.question.questionType),
	).length;
	const accuracy =
		mcqTotal > 0 ? Math.round((correctAnswers / mcqTotal) * 100) : 0;
	const score = (
		(correctAnswers / (result.exam.totalQuestions || 1)) *
		10
	).toFixed(1);

	const rank =
		Number(score) >= 9
			? "Xuất sắc"
			: Number(score) >= 8
				? "Giỏi"
				: Number(score) >= 6.5
					? "Khá"
					: Number(score) >= 5
						? "Trung bình"
						: "Yếu";

	const sortedAnswers = [...result.answers].sort(
		(a, b) => (a.questionNo ?? 9999) - (b.questionNo ?? 9999),
	);

	return (
		<div className="min-h-screen bg-white dark:bg-slate-900">
			<main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
				<div className="flex flex-col items-center justify-center text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 mb-8">
					<div className="mb-3 text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-widest text-sm">
						Kết quả luyện tập
					</div>
					<h1 className="text-7xl md:text-8xl font-black text-slate-900 dark:text-white mb-3">
						{score}{" "}
						<span className="text-3xl text-slate-400 font-medium">/ 10</span>
					</h1>
					<div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-base">
						<Award className="w-5 h-5" />
						{accuracy}% chính xác - {rank}
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
					<Card className="shadow-md border-2 border-slate-200 dark:border-slate-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
								<CheckCircle2 className="w-5 h-5" />
								<p className="text-sm font-semibold uppercase tracking-wider">
									Đúng
								</p>
							</div>
							<p className="text-4xl font-black text-slate-900 dark:text-slate-100">
								{correctAnswers}{" "}
								<span className="text-lg font-normal text-slate-500">câu</span>
							</p>
						</CardContent>
					</Card>

					<Card className="shadow-md border-2 border-slate-200 dark:border-slate-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
								<XCircle className="w-5 h-5" />
								<p className="text-sm font-semibold uppercase tracking-wider">
									Sai
								</p>
							</div>
							<p className="text-4xl font-black text-slate-900 dark:text-slate-100">
								{wrongAnswers}{" "}
								<span className="text-lg font-normal text-slate-500">câu</span>
							</p>
						</CardContent>
					</Card>

					<Card className="shadow-md border-2 border-slate-200 dark:border-slate-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
								<EyeOff className="w-5 h-5" />
								<p className="text-sm font-semibold uppercase tracking-wider">
									Bỏ qua
								</p>
							</div>
							<p className="text-4xl font-black text-slate-900 dark:text-slate-100">
								{skippedAnswers}{" "}
								<span className="text-lg font-normal text-slate-500">câu</span>
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="mb-10">
					<h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-100">
						<LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						Bảng rà soát đáp án
					</h2>
					<div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
						{sortedAnswers.map((answer, index) => {
							const essay = isEssay(answer.question.questionType);
							const hasAnswer = essay
								? !!answer.answerText?.trim()
								: (answer.selectedOptionIds?.length ?? 0) > 0;
							const correct =
								!essay &&
								getIsCorrect(answer.question.id, answer.selectedOptionIds);

							return (
								<div
									key={answer.id}
									className={cn(
										"flex aspect-square items-center justify-center rounded-lg font-bold shadow-sm text-sm transition-transform hover:scale-105",
										essay && hasAnswer && "bg-blue-500 text-white",
										essay && !hasAnswer && "bg-amber-400 text-white",
										!essay && correct && "bg-emerald-500 text-white",
										!essay && !correct && hasAnswer && "bg-red-500 text-white",
										!essay && !hasAnswer && "bg-amber-400 text-white",
									)}
								>
									{answer.questionNo ?? index + 1}
								</div>
							);
						})}
					</div>
					<div className="flex flex-wrap gap-4 mt-6">
						<div className="flex items-center gap-2 text-sm">
							<div className="w-5 h-5 rounded bg-emerald-500" />
							<span className="text-slate-600 dark:text-slate-300 font-medium">
								Đúng
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<div className="w-5 h-5 rounded bg-red-500" />
							<span className="text-slate-600 dark:text-slate-300 font-medium">
								Sai
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<div className="w-5 h-5 rounded bg-blue-500" />
							<span className="text-slate-600 dark:text-slate-300 font-medium">
								Tự luận (có trả lời)
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<div className="w-5 h-5 rounded bg-amber-400" />
							<span className="text-slate-600 dark:text-slate-300 font-medium">
								Bỏ qua
							</span>
						</div>
					</div>
				</div>

				<div className="mb-10">
					<h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-100">
						<BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						Chi tiết giải thích
					</h2>
					<div className="space-y-6">
						{sortedAnswers.map((answer) => {
							const fullQuestion = fullQuestionsMap.get(answer.question.id);
							const questionContent =
								fullQuestion?.content ?? answer.question.content;
							const options = fullQuestion?.options;

							const essay = isEssay(answer.question.questionType);
							const correctOption = options?.find((o) => o.isCorrect);
							const userOption = options?.find((o) =>
								answer.selectedOptionIds?.includes(o.id),
							);
							const correct =
								!essay &&
								getIsCorrect(answer.question.id, answer.selectedOptionIds);
							const hasAnswer = essay
								? !!answer.answerText?.trim()
								: (answer.selectedOptionIds?.length ?? 0) > 0;

							return (
								<Card
									key={answer.id}
									className="border-2 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden"
								>
									<CardContent className="p-6">
										<div className="flex items-start justify-between mb-4">
											<Badge
												className={cn(
													"text-white text-sm font-bold px-3 py-1",
													essay
														? "bg-blue-600"
														: correct
															? "bg-emerald-600"
															: hasAnswer
																? "bg-red-600"
																: "bg-amber-500",
												)}
											>
												Câu {answer.questionNo}
											</Badge>
											<span
												className={cn(
													"flex items-center gap-1.5 text-sm font-semibold",
													essay
														? "text-blue-600 dark:text-blue-400"
														: correct
															? "text-emerald-600 dark:text-emerald-400"
															: hasAnswer
																? "text-red-600 dark:text-red-400"
																: "text-amber-600 dark:text-amber-400",
												)}
											>
												{essay ? (
													"Tự luận"
												) : correct ? (
													<>
														<CheckCircle2 className="w-4 h-4" /> Chính xác
													</>
												) : hasAnswer ? (
													<>
														<XCircle className="w-4 h-4" /> Sai rồi
													</>
												) : (
													"Bỏ qua"
												)}
											</span>
										</div>

										<p className="text-lg font-semibold mb-4 leading-relaxed text-slate-900 dark:text-slate-100">
											{questionContent}
										</p>

										{!essay && options && (
											<div className="space-y-2 mb-6">
												{options.map((option) => {
													const isUserAnswer = userOption?.id === option.id;
													const isCorrectAnswer =
														correctOption?.id === option.id;
													return (
														<div
															key={option.id}
															className={cn(
																"p-4 rounded-xl border-2 flex justify-between items-center",
																isUserAnswer &&
																	!isCorrectAnswer &&
																	"border-red-500 bg-red-50 dark:bg-red-900/20",
																isCorrectAnswer &&
																	"border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
																!isUserAnswer &&
																	!isCorrectAnswer &&
																	"border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
															)}
														>
															<span
																className={cn(
																	"font-medium text-slate-700 dark:text-slate-300",
																	(isUserAnswer || isCorrectAnswer) &&
																		"font-bold text-slate-900 dark:text-slate-100",
																)}
															>
																{option.content}
															</span>
															{isCorrectAnswer && (
																<span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
																	Đáp án đúng
																</span>
															)}
															{isUserAnswer && !isCorrectAnswer && (
																<XCircle className="w-5 h-5 text-red-600" />
															)}
															{isCorrectAnswer && isUserAnswer && (
																<CheckCircle2 className="w-5 h-5 text-emerald-600" />
															)}
														</div>
													);
												})}
											</div>
										)}

										{essay && (
											<div className="mb-6 space-y-3">
												<div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
													<p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
														Câu trả lời của bạn:
													</p>
													{answer.answerText?.trim() ? (
														<p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
															{answer.answerText}
														</p>
													) : (
														<p className="text-slate-400 italic">
															Chưa trả lời
														</p>
													)}
												</div>
											</div>
										)}

										{fullQuestion?.canonicalAnswer && (
											<div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
												<p className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase mb-2 flex items-center gap-1.5">
													<Info className="w-4 h-4" />
													Lời giải chi tiết
												</p>
												<p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
													{fullQuestion.canonicalAnswer}
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 pb-10">
					<Button
						className="flex-1 flex items-center justify-center gap-2 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-lg"
						onClick={() =>
							navigate({
								to: "/exams/$examId",
								params: { examId: String(result.exam.id) },
							})
						}
					>
						<RefreshCw className="w-5 h-5" />
						Luyện tập lại
					</Button>
					<Button
						variant="outline"
						className="flex-1 flex items-center justify-center gap-2 h-14 border-2 border-slate-200 dark:border-slate-700"
						onClick={() => navigate({ to: "/exams" })}
					>
						<Home className="w-5 h-5" />
						Về trang chủ
					</Button>
				</div>
			</main>
		</div>
	);
};

export default PracticeResultContent;
