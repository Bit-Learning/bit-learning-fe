import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	CheckCircle2,
	XCircle,
	BookOpen,
	ChevronUp,
	ChevronDown,
	Flag,
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
	const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
		new Set(),
	);

	const {
		data: result,
		isPending: sessionPending,
		isError: sessionError,
		refetch,
	} = useQuizSession(Number(sessionId), {
		staleTime: 0,
		refetchOnMount: true,
	});
	const { data: examData, isPending: examPending } = useExam(
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

	const sessionLoading = sessionPending;
	const examLoading = examPending && !!result?.exam?.id;

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

	if (sessionError || !result) {
		return (
			<div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
				<p className="text-slate-500">
					{sessionError
						? "Không thể tải kết quả. Vui lòng thử lại."
						: "Không tìm thấy kết quả."}
				</p>
				{sessionError && (
					<button
						type="button"
						onClick={() => refetch()}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
					>
						Thử lại
					</button>
				)}
			</div>
		);
	}

	const hasAnswered = (answer: (typeof result.answers)[number]): boolean => {
		if (isEssay(answer.question.questionType))
			return !!answer.answerText?.trim();
		return (answer.selectedOptionIds?.length ?? 0) > 0;
	};
	const totalQuestions = result.exam.totalQuestions;

	const correctAnswers = result.answers.filter((a) => {
		if (isEssay(a.question.questionType)) return false;
		return getIsCorrect(a.question.id, a.selectedOptionIds);
	}).length;

	const wrongAnswers = result.answers.filter((a) => {
		if (isEssay(a.question.questionType)) return false;
		const hasAnswer = (a.selectedOptionIds?.length ?? 0) > 0;
		return hasAnswer && !getIsCorrect(a.question.id, a.selectedOptionIds);
	}).length;

	const sortedAnswers = [...result.answers].sort(
		(a, b) => (a.questionNo ?? 9999) - (b.questionNo ?? 9999),
	);
	const isMCQ = (type: string) => type?.toUpperCase() === "MCQ";
	const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

	const toggleQuestion = (questionId: number) => {
		setExpandedQuestions((prev) => {
			const next = new Set(prev);
			next.has(questionId) ? next.delete(questionId) : next.add(questionId);
			return next;
		});
	};

	return (
		<div className="min-h-screen bg-white dark:bg-slate-900">
			<main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
				<Card className={cn("mb-6 border rounded-md shadow-sm py-0")}>
					<CardContent className="p-6 space-y-6">
						<div className="text-center">
							<h1 className="text-xl font-semibold">Kết quả luyện tập</h1>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div className="border rounded-md p-4 text-center">
								<div className="font-bold">{totalQuestions}</div>
								<div className="text-xs text-slate-500">Câu hỏi</div>
							</div>

							<div className="border rounded-md p-4 text-center">
								<div className="font-bold text-emerald-600">
									{correctAnswers}
								</div>
								<div className="text-xs text-slate-500">Đúng</div>
							</div>

							<div className="border rounded-md p-4 text-center">
								<div className="font-bold text-red-600">{wrongAnswers}</div>
								<div className="text-xs text-slate-500">Sai</div>
							</div>
						</div>

						<div className="flex gap-3">
							<Button
								className="flex-1 text-md p-5"
								onClick={() => navigate({ to: "/exams" })}
							>
								Về danh sách
							</Button>

							<Button
								variant="outline"
								className="flex-1 text-md p-5"
								onClick={() =>
									navigate({
										to: "/exams/$examId",
										params: { examId: String(result.exam.id) },
									})
								}
							>
								Làm lại
							</Button>
						</div>
					</CardContent>
				</Card>

				<div className="mb-10">
					<h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-100">
						<BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						Chi tiết giải thích
					</h2>
					<div className="space-y-6">
						{sortedAnswers.map((answer) => {
							const fullQuestion = fullQuestionsMap.get(answer.question.id);
							const isExpanded = expandedQuestions.has(answer.question.id);
							const answered = hasAnswered(answer);
							const isCorrect = answered && answer.correct;
							const isMarkedQ = answer.marked;
							return (
								<div
									key={answer.question.id}
									className={cn(
										"border-2 rounded-xl transition-all",
										!answered &&
											"border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10",
										answered &&
											isCorrect &&
											"border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10",
										answered &&
											!isCorrect &&
											"border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10",
									)}
								>
									<button
										onClick={() => toggleQuestion(answer.question.id)}
										className="cursor-pointer w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-t-xl"
									>
										<div className="flex items-center gap-3 min-w-0 flex-1">
											<div className="relative">
												<div
													className={cn(
														"w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
														!answered && "bg-amber-500 text-white",
														answered &&
															isCorrect &&
															"bg-emerald-500 text-white",
														answered && !isCorrect && "bg-red-500 text-white",
													)}
												>
													{answer.questionNo}
												</div>

												{isMarkedQ && (
													<Flag className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-500 fill-amber-500 drop-shadow-lg" />
												)}
											</div>

											<span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left truncate">
												{answer.question.content}
											</span>

											<div className="shrink-0">
												{!answered && (
													<Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700">
														Chưa trả lời
													</Badge>
												)}
											</div>
										</div>

										{isExpanded ? (
											<ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
										) : (
											<ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
										)}
									</button>

									{isExpanded && (
										<div className="p-4 pt-4 border-t border-slate-200 dark:border-slate-700">
											{isMCQ(answer.question.questionType) &&
												fullQuestion?.options && (
													<div className="space-y-2">
														{fullQuestion.options.map((option, optIndex) => {
															const isSelected =
																answer.selectedOptionIds?.includes(option.id);
															const isCorrectOption = option.isCorrect;

															return (
																<div
																	key={option.id}
																	className={cn(
																		"flex items-center gap-3 p-3 rounded-lg border-2",
																		isCorrectOption &&
																			"border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20",
																		!isCorrectOption &&
																			isSelected &&
																			"border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20",
																		!isCorrectOption &&
																			!isSelected &&
																			"border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
																	)}
																>
																	<div
																		className={cn(
																			"w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
																			isCorrectOption &&
																				"bg-emerald-500 text-white",
																			!isCorrectOption &&
																				isSelected &&
																				"bg-red-500 text-white",
																			!isCorrectOption &&
																				!isSelected &&
																				"bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
																		)}
																	>
																		{getOptionLabel(optIndex)}
																	</div>
																	<span
																		className={cn(
																			"flex-1",
																			isCorrectOption &&
																				"font-semibold text-emerald-900 dark:text-emerald-300",
																			!isCorrectOption &&
																				isSelected &&
																				"text-red-900 dark:text-red-300",
																			!isCorrectOption &&
																				!isSelected &&
																				"text-slate-600 dark:text-slate-400",
																		)}
																	>
																		{option.content}
																	</span>
																	{isCorrectOption && (
																		<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
																	)}
																	{!isCorrectOption && isSelected && (
																		<XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
																	)}
																</div>
															);
														})}
													</div>
												)}

											{isEssay(answer.question.questionType) && (
												<div className="space-y-3">
													<div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
														<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
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
													{fullQuestion?.canonicalAnswer && (
														<div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
															<p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
																Đáp án tham khảo:
															</p>
															<p className="text-emerald-900 dark:text-emerald-100 whitespace-pre-wrap">
																{fullQuestion.canonicalAnswer}
															</p>
														</div>
													)}
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</main>
		</div>
	);
};

export default PracticeResultContent;
