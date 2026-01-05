import { useNavigate } from "@tanstack/react-router";
import { Clock, Trophy } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCheckAnswer, useGameDetail, useSubmitGame } from "../hooks/useGame";
import type { QuestionLog } from "../types";
import { shuffleArray } from "../utils/arrayUtils";

type GameState = "loading" | "ready" | "playing" | "result";

interface Props {
	id: string;
}

export const GamePlayPage: React.FC<Props> = ({ id }) => {
	console.log("=== GamePlayPage RENDER ===", { id });
	const navigate = useNavigate();
	const gameId = Number.parseInt(id || "0");

	const { data: game, isLoading } = useGameDetail(gameId);
	const checkAnswer = useCheckAnswer();
	const submitGame = useSubmitGame();

	const [gameState, setGameState] = useState<GameState>("loading");
	console.log("Current gameState:", gameState);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [timeLeft, setTimeLeft] = useState(0);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [answerResult, setAnswerResult] = useState<{
		correct: boolean;
		points: number;
		correctOptionId: string;
	} | null>(null);
	const [score, setScore] = useState(0);
	const [history, setHistory] = useState<QuestionLog[]>([]);
	const [questionStartTime, setQuestionStartTime] = useState(Date.now());

	const handleStart = () => {
		setGameState("playing");
		setQuestionStartTime(Date.now());
		setTimeLeft(game!.settings.timePerQuestion);
	};

	const finishGame = useCallback(
		async (finalHistory: QuestionLog[]) => {
			if (!game) return;

			console.log("=== FINISHING GAME ===");
			console.log("Final history:", finalHistory);
			console.log("History length:", finalHistory.length);

			const totalTime = finalHistory.reduce(
				(sum, log) => sum + log.timeSpent,
				0,
			);
			const correctAnswers = finalHistory.filter((log) => log.correct).length;
			const accuracy = (correctAnswers / finalHistory.length) * 100;

			await submitGame.mutateAsync({
				gameId,
				request: {
					score,
					accuracy,
					totalTime: Math.round(totalTime),
					history: finalHistory,
				},
			});

			setGameState("result");
		},
		[game, score, submitGame, gameId],
	);

	const moveToNextQuestion = useCallback(
		(currentHistory?: QuestionLog[]) => {
			if (!game) return;

			if (currentQuestionIndex < game.questions.length - 1) {
				setCurrentQuestionIndex((prev) => prev + 1);
				setSelectedOption(null);
				setAnswerResult(null);
				setTimeLeft(game.settings.timePerQuestion);
				setQuestionStartTime(Date.now());
			} else {
				finishGame(currentHistory || history);
			}
		},
		[game, currentQuestionIndex, history, finishGame],
	);

	const handleTimeout = useCallback(() => {
		if (!selectedOption && game && game.questions[currentQuestionIndex]) {
			// Auto-submit as incorrect
			const timeSpent = (Date.now() - questionStartTime) / 1000;
			const log: QuestionLog = {
				questionId: game.questions[currentQuestionIndex]!.id,
				selectedOptionId: "",
				correct: false,
				timeSpent,
			};
			setHistory((prev) => [...prev, log]);

			setTimeout(() => {
				moveToNextQuestion();
			}, 1000);
		}
	}, [
		selectedOption,
		game,
		currentQuestionIndex,
		questionStartTime,
		moveToNextQuestion,
	]);

	useEffect(() => {
		if (game && gameState === "loading") {
			setGameState("ready");
			setTimeLeft(game.settings.timePerQuestion);
		}
	}, [game, gameState]);

	useEffect(() => {
		if (gameState === "playing" && timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						handleTimeout();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [gameState, timeLeft, handleTimeout]);

	const handleSelectOption = async (optionId: string) => {
		if (answerResult || !game) return;

		setSelectedOption(optionId);

		console.log("=== SUBMITTING ANSWER ===");
		console.log("Selected option ID:", optionId);
		console.log("Question:", game.questions[currentQuestionIndex]);

		// Submit answer to server
		const result = await checkAnswer.mutateAsync({
			gameId,
			request: {
				questionId: game.questions[currentQuestionIndex]!.id,
				selectedOptionId: optionId,
				timeLeft: timeLeft,
			},
		});

		console.log("=== SERVER RESPONSE ===", result);
		console.log("correct:", result.correct);
		console.log("correctOptionId:", result.correctOptionId);
		console.log("points:", result.points);

		setAnswerResult(result);
		setScore((prev) => prev + result.points);

		// Save to history
		const timeSpent = (Date.now() - questionStartTime) / 1000;
		const log: QuestionLog = {
			questionId: game.questions[currentQuestionIndex]!.id,
			selectedOptionId: optionId,
			correct: result.correct,
			timeSpent,
		};
		const updatedHistory = [...history, log];
		setHistory(updatedHistory);

		// Auto move to next after 2 seconds
		setTimeout(() => {
			moveToNextQuestion(updatedHistory);
		}, 2000);
	};

	const currentQuestion = game ? game.questions[currentQuestionIndex] : null;
	const progress = game
		? ((currentQuestionIndex + 1) / game.questions.length) * 100
		: 0;

	// Xử lý xáo trộn đáp án với useMemo để tránh re-shuffle khi render lại
	const displayOptions = useMemo(() => {
		if (!currentQuestion) return [];
		// Ưu tiên config riêng của câu hỏi, nếu không có thì lấy config chung
		const shouldShuffle =
			currentQuestion.shuffle !== undefined
				? currentQuestion.shuffle
				: game?.settings.shuffleOptions !== false; // Default true

		if (!shouldShuffle) {
			return currentQuestion.options;
		}

		return shuffleArray(currentQuestion.options);
	}, [currentQuestion, game?.settings.shuffleOptions]);

	if (isLoading || !game) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
				<div className="h-16 w-16 animate-spin rounded-full border-b-4 border-white" />
			</div>
		);
	}

	if (!currentQuestion) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<p>Question not found</p>
			</div>
		);
	}

	// Ready Screen
	if (gameState === "ready") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
				<div className="w-full max-w-2xl rounded-3xl bg-white p-12 text-center shadow-2xl">
					<div className="mb-6 text-6xl">🎯</div>
					<h1 className="mb-4 text-4xl font-bold text-gray-900">
						{game.title}
					</h1>
					<p className="mb-8 text-xl text-gray-600">{game.description}</p>

					<div className="mb-8 grid grid-cols-3 gap-4">
						<div className="rounded-xl bg-indigo-50 p-4">
							<div className="text-3xl font-bold text-indigo-600">
								{game.questions.length}
							</div>
							<div className="text-sm text-gray-600">Questions</div>
						</div>
						<div className="rounded-xl bg-purple-50 p-4">
							<div className="text-3xl font-bold text-purple-600">
								{game.settings.timePerQuestion}s
							</div>
							<div className="text-sm text-gray-600">Per Question</div>
						</div>
						<div className="rounded-xl bg-pink-50 p-4">
							<div className="text-3xl font-bold text-pink-600">
								{game.settings.pointsBase}
							</div>
							<div className="text-sm text-gray-600">Base Points</div>
						</div>
					</div>

					<button
						onClick={handleStart}
						className="transform rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-4 text-xl font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						Start Game 🚀
					</button>
				</div>
			</div>
		);
	}

	// Result Screen
	if (gameState === "result") {
		const correctAnswers = history.filter((log) => log.correct).length;
		const accuracy = (correctAnswers / history.length) * 100;

		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
				<div className="w-full max-w-2xl rounded-3xl bg-white p-12 text-center shadow-2xl">
					<div className="mb-6 text-6xl">🎉</div>
					<h1 className="mb-4 text-4xl font-bold text-gray-900">
						Game Complete!
					</h1>

					<div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
						<div className="mb-2 text-6xl font-bold">{score}</div>
						<div className="text-xl">Total Score</div>
					</div>

					<div className="mb-8 grid grid-cols-2 gap-4">
						<div className="rounded-xl bg-green-50 p-4">
							<div className="text-3xl font-bold text-green-600">
								{correctAnswers}/{game.questions.length}
							</div>
							<div className="text-sm text-gray-600">Correct Answers</div>
						</div>
						<div className="rounded-xl bg-blue-50 p-4">
							<div className="text-3xl font-bold text-blue-600">
								{accuracy.toFixed(1)}%
							</div>
							<div className="text-sm text-gray-600">Accuracy</div>
						</div>
					</div>

					<div className="flex justify-center gap-4">
						<button
							onClick={() => window.location.reload()}
							className="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white transition-colors hover:bg-indigo-700"
						>
							Play Again
						</button>
						<button
							onClick={() => navigate({ to: "/games" })}
							className="rounded-full bg-gray-200 px-8 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-300"
						>
							Back to Games
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Playing Screen
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
			{/* Header */}
			<div className="mx-auto mb-6 max-w-4xl">
				<div className="rounded-2xl bg-white p-4 shadow-lg">
					<div className="mb-2 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<Trophy className="text-yellow-500" size={20} />
								<span className="font-bold text-gray-900">{score}</span>
							</div>
							<div className="text-sm text-gray-600">
								Question {currentQuestionIndex + 1} / {game.questions.length}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="text-gray-600" size={20} />
							<span
								className={`text-2xl font-bold ${timeLeft <= 5 ? "animate-pulse text-red-500" : "text-gray-900"}`}
							>
								{timeLeft}s
							</span>
						</div>
					</div>
					{/* Progress Bar */}
					<div className="h-2 w-full rounded-full bg-gray-200">
						<div
							className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Question */}
			<div className="mx-auto max-w-4xl">
				<div className="mb-6 rounded-3xl bg-white p-8 shadow-2xl">
					<h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
						{currentQuestion.text}
					</h2>

					{/* Options */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{displayOptions.map((option) => {
							const isSelected = selectedOption === option.id;
							const isCorrect = answerResult?.correctOptionId === option.id;
							const isWrong = isSelected && !answerResult?.correct;

							let bgColor = "bg-gray-50 hover:bg-gray-100";
							let borderColor = "border-gray-200";
							let textColor = "text-gray-900";

							if (answerResult) {
								if (isCorrect) {
									bgColor = "bg-green-100 border-green-500";
									borderColor = "border-green-500";
									textColor = "text-green-900";
								} else if (isWrong) {
									bgColor = "bg-red-100 border-red-500";
									borderColor = "border-red-500";
									textColor = "text-red-900";
								}
							} else if (isSelected) {
								bgColor = "bg-indigo-100 border-indigo-500";
								borderColor = "border-indigo-500";
							}

							return (
								<button
									type="button"
									key={option.id}
									onClick={() => handleSelectOption(option.id)}
									disabled={!!answerResult}
									className={`${bgColor} ${textColor} border-2 ${borderColor} transform rounded-2xl p-6 text-left text-lg font-semibold transition-all duration-200 hover:scale-105 disabled:transform-none disabled:cursor-not-allowed`}
								>
									<div className="flex items-center justify-between">
										<span>{option.text}</span>
										{answerResult && isCorrect && (
											<span className="text-2xl">✅</span>
										)}
										{answerResult && isWrong && (
											<span className="text-2xl">❌</span>
										)}
									</div>
								</button>
							);
						})}
					</div>

					{/* Answer Result */}
					{answerResult && (
						<div
							className={`mt-6 rounded-xl p-4 text-center ${answerResult.correct ? "bg-green-50" : "bg-red-50"}`}
						>
							<div className="mb-2 text-2xl font-bold">
								{answerResult.correct ? "🎉 Correct!" : "😔 Incorrect"}
							</div>
							{answerResult.correct && (
								<div className="text-lg text-green-700">
									+{answerResult.points} points
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
