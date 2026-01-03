import { Button } from "@workspace/ui/components/Button";
import { CheckCircle, XCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useLectureQuiz } from "../queries/useLecture";

interface QuizPlayerProps {
	lectureId: number;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ lectureId }) => {
	const { data: quizData, isLoading } = useLectureQuiz(lectureId);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, number>
	>({});
	const [submitted, setSubmitted] = useState(false);
	const [score, setScore] = useState(0);

	const handleSubmit = () => {
		if (!quizData) return;

		let correctCount = 0;
		quizData.quizzes.forEach((quiz) => {
			const selectedAnswerId = selectedAnswers[quiz.id];
			const correctAnswer = quiz.answers.find((a) => a.isCorrect);
			if (selectedAnswerId === correctAnswer?.id) {
				correctCount++;
			}
		});

		const percentage = (correctCount / quizData.quizzes.length) * 100;
		setScore(percentage);
		setSubmitted(true);
	};

	const handleRetry = () => {
		setSelectedAnswers({});
		setSubmitted(false);
		setScore(0);
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center bg-gray-900">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
					<p className="mt-4 text-gray-400">Đang tải quiz...</p>
				</div>
			</div>
		);
	}

	if (!quizData) {
		return (
			<div className="flex h-full items-center justify-center bg-gray-900">
				<p className="text-gray-400">Không tìm thấy quiz</p>
			</div>
		);
	}

	const isPassed = score >= quizData.passPercent;

	return (
		<div className="h-full overflow-y-auto bg-gray-900 p-8">
			<div className="mx-auto max-w-3xl">
				<div className="mb-8 rounded-lg bg-gray-800 p-6">
					<h2 className="mb-4 text-2xl font-bold text-white">
						{quizData.lecture.title}
					</h2>
					<div className="flex gap-6 text-sm text-gray-400">
						<div className="flex items-center gap-2">
							<span>Điểm đạt:</span>
							<span className="font-semibold text-green-400">
								{quizData.passPercent}%
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span>Số lần thử:</span>
							<span className="font-semibold text-blue-400">
								{quizData.maxAttempts}
							</span>
						</div>
					</div>
				</div>

				{submitted && (
					<div
						className={`mb-8 rounded-lg p-6 ${isPassed ? "bg-green-600" : "bg-red-600"}`}
					>
						<div className="flex items-center gap-4">
							{isPassed ? (
								<CheckCircle className="h-8 w-8 text-white" />
							) : (
								<XCircle className="h-8 w-8 text-white" />
							)}
							<div className="flex-1 text-white">
								<h3 className="text-xl font-bold">
									{isPassed
										? "Chúc mừng! Bạn đã vượt qua bài quiz"
										: "Chưa đạt yêu cầu"}
								</h3>
								<p className="text-sm opacity-90">
									Điểm của bạn: {score.toFixed(1)}% / {quizData.passPercent}%
								</p>
							</div>
							{!isPassed && (
								<Button
									onPress={handleRetry}
									className="bg-white text-red-600 hover:bg-gray-100"
								>
									Thử lại
								</Button>
							)}
						</div>
					</div>
				)}

				<div className="space-y-6">
					{quizData.quizzes.map((quiz, index) => {
						const selectedAnswerId = selectedAnswers[quiz.id];
						const _correctAnswer = quiz.answers.find((a) => a.isCorrect);

						return (
							<div key={quiz.id} className="rounded-lg bg-gray-800 p-6">
								<h3 className="mb-4 text-lg font-semibold text-white">
									Câu {index + 1}: {quiz.questionText}
								</h3>

								<div className="space-y-3">
									{quiz.answers.map((answer) => {
										const isSelected = selectedAnswerId === answer.id;
										const isCorrect = answer.isCorrect;
										const showResult = submitted;

										let bgColor = "border-gray-700";
										if (showResult) {
											if (isCorrect) {
												bgColor = "border-green-500 bg-green-500/10";
											} else if (isSelected && !isCorrect) {
												bgColor = "border-red-500 bg-red-500/10";
											}
										} else if (isSelected) {
											bgColor = "border-blue-500 bg-blue-500/10";
										}

										return (
											<label
												key={answer.id}
												className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${bgColor} ${
													submitted ? "cursor-default" : "hover:border-gray-600"
												}`}
											>
												<input
													type="radio"
													name={`quiz-${quiz.id}`}
													checked={isSelected}
													onChange={() =>
														!submitted &&
														setSelectedAnswers((prev) => ({
															...prev,
															[quiz.id]: answer.id,
														}))
													}
													disabled={submitted}
													className="h-5 w-5 accent-blue-600"
												/>
												<span className="flex-1 text-white">
													{answer.answerText}
												</span>
												{showResult && isCorrect && (
													<CheckCircle className="h-5 w-5 text-green-500" />
												)}
												{showResult && isSelected && !isCorrect && (
													<XCircle className="h-5 w-5 text-red-500" />
												)}
											</label>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>

				{!submitted && (
					<Button
						onPress={handleSubmit}
						isDisabled={
							Object.keys(selectedAnswers).length !== quizData.quizzes.length
						}
						className="mt-8 w-full bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
					>
						Nộp bài ({Object.keys(selectedAnswers).length}/
						{quizData.quizzes.length})
					</Button>
				)}
			</div>
		</div>
	);
};

export default QuizPlayer;
