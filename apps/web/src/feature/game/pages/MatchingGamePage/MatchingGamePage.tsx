import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import {
	CURRICULUM_DATA,
	GAME_DATA,
	Item,
	TopicCode,
} from "@/feature/game/data";
import { useAudio } from "@/feature/game/contexts/AudioProvider";
import { AudioToggle } from "@/feature/game/components/AudioToggle";
import { ThemeToggle } from "@/feature/game/components/ThemeToggle";
import matchingGameService from "@/feature/game/services/matchingGameService";
import gameService from "@/feature/game/services/gameService";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import { Route } from "@/routes/matching/game";

function shuffle<T>(arr: T[]): T[] {
	return [...arr].sort(() => Math.random() - 0.5);
}

function renderItemContent(
	item: Item,
	textClassName: string,
	variant: "normal" | "large" = "normal",
) {
	if (item.type === "image") {
		const sizeClass = variant === "large" ? "max-h-64 w-full" : "max-h-16";
		return (
			<img
				src={item.value}
				alt={item.alt ?? ""}
				className={`${sizeClass} object-contain rounded-lg`}
			/>
		);
	}

	if (item.type === "audio") {
		const sizeClass = variant === "large" ? "w-full" : "w-full max-w-xs";
		return <audio controls src={item.value} className={sizeClass} />;
	}

	return <span className={textClassName}>{item.value}</span>;
}

export default function GamePage() {
	const navigate = useNavigate();
	const { playSound, stopSound } = useAudio();
	const { grade = 3, topic = "A" } = Route.useSearch();
	const auth = useSelector((state: RootState) => state.auth);
	const username = auth.userInfo?.username ?? null;

	const [gameData, setGameData] = useState(() => GAME_DATA);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const startTimeRef = useRef<number>(Date.now());
	const trackedRef = useRef(false);

	useEffect(() => {
		let isMounted = true;
		setLoading(true);
		setError(null);

		matchingGameService
			.getGameByCurriculum(grade, topic)
			.then((data) => {
				if (!isMounted) return;
				setGameData(data);
			})
			.catch(() => {
				// Fallback to local mock data if backend is not ready
				if (!isMounted) return;
				const gradeData = CURRICULUM_DATA.grades.find((g) => g.id === grade);
				const topicData = gradeData?.topics.find((t) => t.code === topic);
				setGameData(topicData?.gameData ?? GAME_DATA);
				setError("Không tải được dữ liệu từ máy chủ. Đang dùng dữ liệu mẫu.");
			})
			.finally(() => {
				if (!isMounted) return;
				setLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [grade, topic]);

	const [stageIndex, setStageIndex] = useState(0);
	const [completedPairCount, setCompletedPairCount] = useState(0);
	const [completedStagesCount, setCompletedStagesCount] = useState(0);
	const [totalMistakesCount, setTotalMistakesCount] = useState(0);

	// Track matching game result to backend
	const trackMatchingResult = (correctCount: number, totalCount: number) => {
		if (trackedRef.current || !gameData.meta.gameId) return;
		trackedRef.current = true;
		const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
		gameService
			.submitAttempt(gameData.meta.gameId, {
				attemptType: "MATCHING",
				rawScore: correctCount,
				maxRawScore: totalCount,
				duration: elapsed,
				completed: true,
				resultMetrics: {
					correctCount,
					totalCount,
					mistakes: totalMistakesCount + mistakesCount,
					completedStages: completedStagesCount + 1,
					stageCount: gameData.stages.length,
				},
			})
			.catch(() => {
				trackedRef.current = false;
			});
	};
	// Pause background music while in the game route
	useEffect(() => {
		stopSound("game-background-music");
		return () => {
			playSound("game-background-music", { loop: true });
		};
	}, [playSound, stopSound]);
	const currentStage = (gameData.stages[stageIndex] ?? gameData.stages[0])!;
	const rightIds = currentStage.pairs.map((p) => p.id);
	const [shuffledRightIds, setShuffledRightIds] = useState<string[]>(() =>
		currentStage.config?.shuffle ? shuffle(rightIds) : rightIds,
	);

	useEffect(() => {
		const ids = currentStage.pairs.map((p) => p.id);
		const next = currentStage.config?.shuffle ? shuffle(ids) : ids;
		setShuffledRightIds(next);
	}, [currentStage]);
	const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
	const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
	const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
	const [wrongPair, setWrongPair] = useState<{
		leftId: string;
		rightId: string;
	} | null>(null);
	const [showModal, setShowModal] = useState(false);
	// const [showHint, setShowHint] = useState<boolean>(() => currentStage.config?.showHints ?? true)
	const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);
	const [mistakesCount, setMistakesCount] = useState(0);
	const [limitMistakes, setLimitMistakes] = useState(true);
	const [isGameOver, setIsGameOver] = useState(false);

	const isLastStage = stageIndex >= gameData.stages.length - 1;

	const goToDashboard = () => {
		const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
		const totalPairs = gameData.stages.reduce(
			(sum, s) => sum + s.pairs.length,
			0,
		);
		const totalCorrect = completedPairCount + matchedPairIds.length;
		trackMatchingResult(totalCorrect, totalPairs);
		navigate({
			to: "/matching/dashboard",
			search: {
				correct: totalCorrect,
				total: totalPairs,
				time: elapsed,
				title: gameData.meta.title,
			},
		});
	};

	const isPairMatched = (pairId: string) => matchedPairIds.includes(pairId);

	const handleLeftClick = (pairId: string) => {
		if (isPairMatched(pairId)) return;
		setSelectedLeftId(pairId);
		setWrongPair(null);
	};

	const handleRightClick = (pairId: string) => {
		const layoutType = currentStage.config?.layoutType ?? "match";
		const isMediaQuiz = layoutType === "media-quiz";
		const stageMaxMistakes = currentStage.config?.maxMistakes;
		const canLimitByConfig =
			typeof stageMaxMistakes === "number" && stageMaxMistakes > 0;
		const isLimitedModeLocal = limitMistakes && canLimitByConfig;

		if (isMediaQuiz) {
			const questionPair = currentStage.pairs[0]!;
			if (isGameOver || matchedPairIds.includes(questionPair.id)) return;

			setSelectedRightId(pairId);
			const correct = pairId === questionPair.id;

			if (correct) {
				playSound("yay");
				setLastMatchedId(pairId);
				const newMatched = [questionPair.id];
				setMatchedPairIds(newMatched);
				setTimeout(() => {
					setLastMatchedId(null);
					setSelectedRightId(null);
				}, 800);
				setTimeout(() => setShowModal(true), 400);
			} else {
				playSound("xp-error");
				setWrongPair({ leftId: questionPair.id, rightId: pairId });
				if (isLimitedModeLocal && stageMaxMistakes && stageMaxMistakes > 0) {
					const newMistakes = mistakesCount + 1;
					setMistakesCount(newMistakes);
					if (newMistakes >= stageMaxMistakes) {
						setTimeout(() => {
							setIsGameOver(true);
							setSelectedRightId(null);
						}, 800);
					}
				}
				setTimeout(() => {
					setWrongPair(null);
					setSelectedRightId(null);
				}, 800);
			}
			return;
		}

		if (isPairMatched(pairId) || !selectedLeftId || isGameOver) return;
		setSelectedRightId(pairId);

		const correct = selectedLeftId === pairId;
		if (correct) {
			playSound("yay");
			setLastMatchedId(pairId);
			const newMatched = [...matchedPairIds, pairId];
			setMatchedPairIds(newMatched);
			setSelectedLeftId(null);
			setSelectedRightId(null);
			setTimeout(() => setLastMatchedId(null), 800);
			if (newMatched.length === currentStage.pairs.length) {
				playSound("victory-mario");
				setTimeout(() => setShowModal(true), 400);
			}
		} else {
			playSound("xp-error");
			setWrongPair({ leftId: selectedLeftId, rightId: pairId });
			if (isLimitedMode && stageMaxMistakes && stageMaxMistakes > 0) {
				const newMistakes = mistakesCount + 1;
				setMistakesCount(newMistakes);
				if (newMistakes >= stageMaxMistakes) {
					setTimeout(() => {
						setIsGameOver(true);
						setSelectedLeftId(null);
						setSelectedRightId(null);
					}, 800);
				}
			}
			setTimeout(() => {
				setWrongPair(null);
				setSelectedLeftId(null);
				setSelectedRightId(null);
			}, 800);
		}
	};

	const handleReset = () => {
		setMatchedPairIds([]);
		setSelectedLeftId(null);
		setSelectedRightId(null);
		setWrongPair(null);
		setShowModal(false);
		setLastMatchedId(null);
		setMistakesCount(0);
		setIsGameOver(false);
	};

	// Reset to the first stage and clear state when the underlying game data changes
	useEffect(() => {
		setStageIndex(0);
		trackedRef.current = false;
		startTimeRef.current = Date.now();
		setCompletedPairCount(0);
		setCompletedStagesCount(0);
		setTotalMistakesCount(0);
		setMatchedPairIds([]);
		setSelectedLeftId(null);
		setSelectedRightId(null);
		setWrongPair(null);
		setShowModal(false);
		setLastMatchedId(null);
		setMistakesCount(0);
		setIsGameOver(false);
	}, [gameData]);

	const handleRestartAll = () => {
		setStageIndex(0);
		setCompletedPairCount(0);
		setCompletedStagesCount(0);
		setTotalMistakesCount(0);
		setMatchedPairIds([]);
		setSelectedLeftId(null);
		setSelectedRightId(null);
		setWrongPair(null);
		setShowModal(false);
		setLastMatchedId(null);
		setMistakesCount(0);
		setIsGameOver(false);
	};

	const handleNextStage = () => {
		playSound("anime-wow");
		if (isLastStage) return;
		setCompletedPairCount((prev) => prev + matchedPairIds.length);
		setCompletedStagesCount((prev) => prev + 1);
		setTotalMistakesCount((prev) => prev + mistakesCount);
		const nextIndex = Math.min(stageIndex + 1, gameData.stages.length - 1);
		setStageIndex(nextIndex);
		setMatchedPairIds([]);
		setSelectedLeftId(null);
		setSelectedRightId(null);
		setWrongPair(null);
		setShowModal(false);
		setLastMatchedId(null);
		setMistakesCount(0);
		setIsGameOver(false);
	};

	const layoutType = currentStage.config?.layoutType ?? "match";
	const isMediaQuiz = layoutType === "media-quiz";
	const mediaQuestionPair = isMediaQuiz ? currentStage.pairs[0] : null;

	const matchedCount = isMediaQuiz
		? mediaQuestionPair && matchedPairIds.includes(mediaQuestionPair.id)
			? 1
			: 0
		: matchedPairIds.length;
	const totalCount = isMediaQuiz ? 1 : currentStage.pairs.length;
	const progressPct = Math.round((matchedCount / totalCount) * 100);
	const stageMaxMistakes = currentStage.config?.maxMistakes;
	const canLimitByConfig =
		typeof stageMaxMistakes === "number" && stageMaxMistakes > 0;
	const isLimitedMode = limitMistakes && canLimitByConfig;
	const heartsLeft =
		isLimitedMode && stageMaxMistakes
			? Math.max(0, stageMaxMistakes - mistakesCount)
			: null;

	if (loading) {
		return <Loader />;
	}

	// const nextHintPair = currentStage.pairs.find((p) => !matchedPairIds.includes(p.id))
	// const hintText = nextHintPair?.hint

	return (
		<div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
			<PageMeta
				title={gameData.meta.title}
				description="Trải nghiệm trò chơi ghép cặp giúp học sinh rèn luyện kiến thức và phản xạ trên Bit Learning."
			/>
			{/* Header */}
			<header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
				<div className="flex items-center gap-3">
					<div
						className="bg-primary/10 p-2 rounded-lg text-primary cursor-pointer"
						onClick={() => navigate({ to: "/matching/path" })}
					>
						<span className="material-symbols-outlined text-2xl">school</span>
					</div>
					<h1 className="text-xl font-bold tracking-tight">
						{gameData.meta.title}
					</h1>
				</div>
				<div className="hidden md:flex flex-col items-center gap-1 w-1/3">
					<div className="flex justify-between w-full px-1">
						<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
							Tiến độ: {matchedCount}/{totalCount}
						</span>
						<span className="text-xs font-semibold text-primary">
							{progressPct}%
						</span>
					</div>
					<div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
						<div
							className="bg-primary h-full rounded-full transition-all duration-500"
							style={{ width: `${progressPct}%` }}
						></div>
					</div>
				</div>
				{isLimitedMode && (
					<div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-500">
						{/* <span className="uppercase tracking-wider">Lượt sai:</span> */}
						<div className="flex items-center gap-0.5">
							{Array.from({ length: stageMaxMistakes ?? 0 }).map((_, idx) => {
								const filled = heartsLeft !== null && idx < heartsLeft;
								return (
									<span
										key={idx}
										className={`material-symbols-outlined text-sm ${
											filled
												? "text-rose-500"
												: "text-slate-300 dark:text-slate-600"
										}`}
									>
										{filled ? "favorite" : "favorite_border"}
									</span>
								);
							})}
						</div>
					</div>
				)}
				<div className="flex items-center gap-4">
					<AudioToggle />
					<ThemeToggle />
					{/* <button
            onClick={() => setLimitMistakes((prev) => !prev)}
            className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg font-medium text-sm"
          >
            <span className="material-symbols-outlined text-sm">
              {isLimitedMode ? 'favorite' : 'favorite_border'}
            </span>
            {isLimitedMode ? 'Giới hạn sai: bật' : 'Giới hạn sai: tắt'}
          </button> */}
				</div>
			</header>

			{/* Main Game Area */}
			<main className="flex-1 flex flex-col items-center justify-center p-6 max-w-6xl mx-auto w-full">
				<div className="text-center mb-20">
					<h2 className="text-2xl md:text-3xl font-bold mb-2">
						Hãy ghép thuật ngữ với định nghĩa đúng!
					</h2>
					<p className="text-slate-500 dark:text-slate-400">
						Chọn một ô ở cột bên trái và một ô ở cột bên phải.
					</p>
				</div>
				{isMediaQuiz && mediaQuestionPair ? (
					<div className="w-full max-w-3xl flex flex-col gap-10">
						{/* Media question row */}
						<div className="flex flex-col items-center gap-4">
							<div className="flex items-center gap-2 mb-2 px-2 w-full">
								<span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
									CÂU HỎI
								</span>
								<span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
									Hình ảnh / Âm thanh
								</span>
							</div>
							<div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-center shadow-sm">
								{renderItemContent(
									mediaQuestionPair.left,
									"text-2xl font-bold",
									"large",
								)}
							</div>
						</div>

						{/* Answer row */}
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-2 mb-2 px-2">
								<span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
									CÂU TRẢ LỜI
								</span>
								<span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
									Chọn đáp án đúng nhất
								</span>
							</div>
							{shuffledRightIds.map((answerId) => {
								const pair = currentStage.pairs.find((p) => p.id === answerId);
								if (!pair) return null;
								const isMatched = isPairMatched(pair.id);
								const isSelected = selectedRightId === pair.id;
								const isWrong = wrongPair?.rightId === pair.id;
								const isJustMatched = isMatched && lastMatchedId === pair.id;

								const questionId = mediaQuestionPair.id;
								const hasAnswered = matchedPairIds.includes(questionId);

								return (
									<button
										key={pair.id}
										onClick={() => handleRightClick(pair.id)}
										disabled={isGameOver || hasAnswered}
										className={`match-card flex items-center gap-4 p-6 rounded-xl shadow-sm text-left transition-all
                      ${isMatched ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 opacity-60 cursor-default" : ""}
                      ${isSelected && !isMatched ? "bg-white dark:bg-slate-900 border-2 border-primary ring-4 ring-primary/10" : ""}
                      ${isWrong ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-400" : ""}
                      ${!isMatched && !isSelected && !isWrong ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50" : ""}
                      ${isJustMatched ? "animate-pulse ring-4 ring-green-300 dark:ring-green-700 scale-[1.02] opacity-100" : ""}
                    `}
									>
										<div className="flex-1">
											{renderItemContent(
												pair.right,
												`text-lg font-medium ${isMatched ? "line-through text-green-700 dark:text-green-400" : ""}`,
											)}
										</div>
										{isMatched && (
											<span
												className={`material-symbols-outlined text-green-500 ${
													isJustMatched ? "animate-bounce" : ""
												}`}
											>
												verified
											</span>
										)}
									</button>
								);
							})}
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full">
						{/* Column A: Terms */}
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-2 mb-2 px-2">
								<span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
									CỘT A
								</span>
								<span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
									Thuật ngữ / Thiết bị
								</span>
							</div>
							{currentStage.pairs.map((pair) => {
								const isMatched = isPairMatched(pair.id);
								const isSelected = selectedLeftId === pair.id;
								const isWrong = wrongPair?.leftId === pair.id;
								const isJustMatched = isMatched && lastMatchedId === pair.id;

								return (
									<button
										key={pair.id}
										onClick={() => handleLeftClick(pair.id)}
										disabled={isMatched || isGameOver}
										className={`match-card flex items-center gap-4 p-6 rounded-xl shadow-sm text-left transition-all
                      ${isMatched ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 opacity-60 cursor-default" : ""}
                      ${isSelected && !isMatched ? "bg-white dark:bg-slate-900 border-2 border-primary ring-4 ring-primary/10" : ""}
                      ${isWrong ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-400" : ""}
                      ${!isMatched && !isSelected && !isWrong ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50" : ""}
                      ${isJustMatched ? "animate-pulse ring-4 ring-green-300 dark:ring-green-700 scale-[1.02] opacity-100" : ""}
                    `}
									>
										{renderItemContent(
											pair.left,
											`text-xl font-bold ${isMatched ? "line-through text-green-700 dark:text-green-400" : ""}`,
										)}
									</button>
								);
							})}
						</div>

						{/* Column B: Definitions */}
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-2 mb-2 px-2">
								<span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
									CỘT B
								</span>
								<span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
									Định nghĩa / Chức năng
								</span>
							</div>
							{shuffledRightIds.map((pairId) => {
								const pair = currentStage.pairs.find((p) => p.id === pairId);
								if (!pair) return null;
								const isMatched = isPairMatched(pair.id);
								const isSelected = selectedRightId === pair.id;
								const isWrong = wrongPair?.rightId === pair.id;
								const isJustMatched = isMatched && lastMatchedId === pair.id;

								return (
									<button
										key={pair.id}
										onClick={() => handleRightClick(pair.id)}
										disabled={isMatched || !selectedLeftId || isGameOver}
										className={`match-card flex items-center gap-4 p-6 rounded-xl shadow-sm text-left transition-all
                      ${isMatched ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 opacity-60 cursor-default" : ""}
                      ${isSelected && !isMatched ? "bg-white dark:bg-slate-900 border-2 border-primary ring-4 ring-primary/10" : ""}
                      ${isWrong ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-400" : ""}
                      ${!isMatched && !isSelected && !isWrong ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50" : ""}
                      ${!selectedLeftId && !isMatched ? "opacity-60" : ""}
                      ${isJustMatched ? "animate-pulse ring-4 ring-green-300 dark:ring-green-700 scale-[1.02] opacity-100" : ""}
                    `}
									>
										<div className="flex-1">
											{renderItemContent(
												pair.right,
												`text-lg font-medium ${isMatched ? "line-through text-green-700 dark:text-green-400" : ""}`,
											)}
										</div>
										{isMatched && (
											<span
												className={`material-symbols-outlined text-green-500 ${
													isJustMatched ? "animate-bounce" : ""
												}`}
											>
												verified
											</span>
										)}
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* Hint */}
				{/* {showHint && (
          <div className="mt-12 w-full max-w-2xl bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="size-16 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-3xl">lightbulb</span>
            </div>
            <div>
              <h3 className="text-lg font-bold">Gợi ý cho bạn</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {hintText ||
                  'Thiết bị nhập là các thiết bị dùng để đưa thông tin vào máy tính. Hãy tìm một thiết bị có thể điều khiển con trỏ trên màn hình!'}
              </p>
            </div>
          </div>
        )} */}
			</main>

			{/* Footer */}
			<footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center">
				<div className="flex items-center gap-2 text-slate-500">
					<span className="material-symbols-outlined">info</span>
					<span className="text-sm font-medium">
						Phần học dành cho học sinh Lớp 3-5
					</span>
				</div>
				<div className="flex gap-3">
					<button
						onClick={handleReset}
						className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
					>
						Làm lại
					</button>
					<button
						onClick={goToDashboard}
						className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2"
					>
						Kiểm tra kết quả
						<span className="material-symbols-outlined text-lg">
							arrow_forward
						</span>
					</button>
				</div>
			</footer>

			{/* Success Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
					<div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
						<div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mx-auto mb-6">
							<span className="material-symbols-outlined text-5xl">
								celebration
							</span>
						</div>
						<h2 className="text-3xl font-bold mb-2">Chúc mừng!</h2>
						<p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
							{isLastStage
								? "Bạn đã hoàn thành tất cả màn chơi cho chủ đề này."
								: "Bạn đã hoàn thành màn chơi này, hãy tiếp tục màn tiếp theo nhé."}
						</p>
						<div className="flex flex-col gap-3">
							<button
								onClick={isLastStage ? handleRestartAll : handleNextStage}
								className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-primary/90 transition-colors"
							>
								{isLastStage ? "Chơi lại từ đầu" : "Tiếp tục màn tiếp theo"}
							</button>
							{isLastStage && (
								<button
									onClick={goToDashboard}
									className="w-full bg-slate-100 dark:bg-slate-800 font-bold py-4 rounded-xl text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
								>
									Xem kết quả
								</button>
							)}
						</div>
					</div>
				</div>
			)}
			{/* Game Over Modal (when out of hearts) */}
			{isGameOver && !showModal && (
				<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
					<div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
						<div className="size-20 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center mx-auto mb-6">
							<span className="material-symbols-outlined text-5xl">
								heart_broken
							</span>
						</div>
						<h2 className="text-3xl font-bold mb-2">Hết lượt rồi!</h2>
						<p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
							Bạn đã dùng hết số trái tim cho vòng chơi này. Hãy thử lại nhé.
						</p>
						<div className="flex flex-col gap-3">
							<button
								onClick={handleReset}
								className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-primary/90 transition-colors"
							>
								Chơi lại
							</button>
							<button
								onClick={goToDashboard}
								className="w-full bg-slate-100 dark:bg-slate-800 font-bold py-4 rounded-xl text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
							>
								Quay lại bảng điều khiển
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
