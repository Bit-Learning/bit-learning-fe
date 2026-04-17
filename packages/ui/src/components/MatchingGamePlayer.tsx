import { type ReactNode, useEffect, useRef, useState } from "react";

export type MatchingGameItemType = "text" | "image" | "audio";
export type MatchingGameLayoutType = "match" | "media-quiz";
export type MatchingGameSound =
	| "yay"
	| "xp-error"
	| "victory-mario"
	| "anime-wow";

export interface MatchingGameItem {
	type: MatchingGameItemType;
	value: string;
	alt?: string;
}

export interface MatchingGamePair {
	id: string;
	left: MatchingGameItem;
	right: MatchingGameItem;
	hint?: string;
}

export interface MatchingGameStageConfig {
	shuffle?: boolean;
	timeLimit?: number | null;
	maxMistakes?: number | null;
	showHints?: boolean;
	layoutType?: MatchingGameLayoutType;
}

export interface MatchingGameStage {
	id: string;
	title: string;
	description?: string;
	config?: MatchingGameStageConfig;
	pairs: MatchingGamePair[];
}

export interface MatchingGamePlayerData {
	meta: {
		gameId?: number;
		grade?: number;
		topicCode?: string;
		title: string;
		version?: string;
		language?: string;
		baseScoreMax?: number;
		difficultyMultiplier?: number;
		passingThreshold?: number;
	};
	stages: MatchingGameStage[];
}

export interface MatchingGameResultSummary {
	correct: number;
	total: number;
	time: number;
	title?: string;
	gameId?: number;
	grade?: number;
	topic?: string;
	mistakes: number;
	completedStages: number;
	stageCount: number;
}

interface MatchingGamePlayerProps {
	gameData: MatchingGamePlayerData;
	onExit: () => void;
	onComplete?: (summary: MatchingGameResultSummary) => void;
	onPlaySound?: (sound: MatchingGameSound) => void;
	headerActions?: ReactNode;
	footerNote?: ReactNode;
	exitLabel?: string;
}

function shuffle<T>(arr: T[]): T[] {
	return [...arr].sort(() => Math.random() - 0.5);
}

function renderItemContent(
	item: MatchingGameItem,
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
		return (
			<audio controls className={sizeClass}>
				<source src={item.value} />
				<track kind="captions" />
			</audio>
		);
	}

	return <span className={textClassName}>{item.value}</span>;
}

function buildResultSummary(params: {
	gameData: MatchingGamePlayerData;
	startTimeMs: number;
	completedPairCount: number;
	matchedPairIds: string[];
	totalMistakesCount: number;
	mistakesCount: number;
	completedStagesCount: number;
}): MatchingGameResultSummary {
	const {
		gameData,
		startTimeMs,
		completedPairCount,
		matchedPairIds,
		totalMistakesCount,
		mistakesCount,
		completedStagesCount,
	} = params;
	const elapsed = Math.round((Date.now() - startTimeMs) / 1000);
	const totalPairs = gameData.stages.reduce(
		(sum, stage) => sum + stage.pairs.length,
		0,
	);
	const totalCorrect = completedPairCount + matchedPairIds.length;

	return {
		correct: totalCorrect,
		total: totalPairs,
		time: elapsed,
		title: gameData.meta.title,
		gameId: gameData.meta.gameId,
		grade: gameData.meta.grade,
		topic: gameData.meta.topicCode,
		mistakes: totalMistakesCount + mistakesCount,
		completedStages: completedStagesCount + 1,
		stageCount: gameData.stages.length,
	};
}

export default function MatchingGamePlayer({
	gameData,
	onExit,
	onComplete,
	onPlaySound,
	headerActions,
	footerNote = "Phần học dành cho học sinh Lớp 3-5",
	exitLabel = "Thoát preview",
}: MatchingGamePlayerProps) {
	const startTimeRef = useRef<number>(Date.now());
	const [stageIndex, setStageIndex] = useState(0);
	const [completedPairCount, setCompletedPairCount] = useState(0);
	const [completedStagesCount, setCompletedStagesCount] = useState(0);
	const [totalMistakesCount, setTotalMistakesCount] = useState(0);
	const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
	const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
	const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
	const [wrongPair, setWrongPair] = useState<{
		leftId: string;
		rightId: string;
	} | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);
	const [mistakesCount, setMistakesCount] = useState(0);
	const [isGameOver, setIsGameOver] = useState(false);
	const [resultSummary, setResultSummary] =
		useState<MatchingGameResultSummary | null>(null);
	const currentStage =
		gameData.stages[stageIndex] ?? gameData.stages[0] ?? null;
	const rightIds = currentStage?.pairs.map((pair) => pair.id) ?? [];
	const [shuffledRightIds, setShuffledRightIds] = useState<string[]>(() =>
		currentStage?.config?.shuffle ? shuffle(rightIds) : rightIds,
	);

	useEffect(() => {
		if (!currentStage) {
			setShuffledRightIds([]);
			return;
		}

		const ids = currentStage.pairs.map((pair) => pair.id);
		setShuffledRightIds(currentStage.config?.shuffle ? shuffle(ids) : ids);
	}, [currentStage]);

	const gameIdentity = [
		gameData.meta.gameId ?? "unknown",
		gameData.stages.map((stage) => stage.id).join(","),
	].join(":");

	useEffect(() => {
		void gameIdentity;
		startTimeRef.current = Date.now();
		setStageIndex(0);
		setCompletedPairCount(0);
		setCompletedStagesCount(0);
		setTotalMistakesCount(0);
		setSelectedLeftId(null);
		setSelectedRightId(null);
		setMatchedPairIds([]);
		setWrongPair(null);
		setShowModal(false);
		setLastMatchedId(null);
		setMistakesCount(0);
		setIsGameOver(false);
		setResultSummary(null);
	}, [gameIdentity]);

	const isLastStage = stageIndex >= gameData.stages.length - 1;
	const layoutType = currentStage?.config?.layoutType ?? "match";
	const isMediaQuiz = layoutType === "media-quiz";
	const mediaQuestionPair =
		isMediaQuiz && currentStage ? (currentStage.pairs[0] ?? null) : null;
	const matchedCount = isMediaQuiz
		? mediaQuestionPair && matchedPairIds.includes(mediaQuestionPair.id)
			? 1
			: 0
		: matchedPairIds.length;
	const totalCount = isMediaQuiz ? 1 : (currentStage?.pairs.length ?? 0);
	const progressPct =
		totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;
	const stageMaxMistakes = currentStage?.config?.maxMistakes;
	const canLimitByConfig =
		typeof stageMaxMistakes === "number" && stageMaxMistakes > 0;
	const isLimitedMode = canLimitByConfig;
	const heartsLeft =
		isLimitedMode && stageMaxMistakes
			? Math.max(0, stageMaxMistakes - mistakesCount)
			: null;
	const heartSlots = Array.from(
		{ length: stageMaxMistakes ?? 0 },
		(_, heartNumber) => heartNumber + 1,
	);

	const isPairMatched = (pairId: string) => matchedPairIds.includes(pairId);

	const resetCurrentStage = () => {
		setMatchedPairIds([]);
		setSelectedLeftId(null);
		setSelectedRightId(null);
		setWrongPair(null);
		setShowModal(false);
		setLastMatchedId(null);
		setMistakesCount(0);
		setIsGameOver(false);
	};

	const handleRestartAll = () => {
		startTimeRef.current = Date.now();
		setStageIndex(0);
		setCompletedPairCount(0);
		setCompletedStagesCount(0);
		setTotalMistakesCount(0);
		setResultSummary(null);
		resetCurrentStage();
	};

	const handleViewResults = () => {
		const summary = buildResultSummary({
			gameData,
			startTimeMs: startTimeRef.current,
			completedPairCount,
			matchedPairIds,
			totalMistakesCount,
			mistakesCount,
			completedStagesCount,
		});

		if (onComplete) {
			onComplete(summary);
			return;
		}

		setResultSummary(summary);
	};

	const handleLeftClick = (pairId: string) => {
		if (isPairMatched(pairId)) return;
		setSelectedLeftId(pairId);
		setWrongPair(null);
	};

	const handleRightClick = (pairId: string) => {
		if (!currentStage) return;

		const isMediaQuizStage =
			(currentStage.config?.layoutType ?? "match") === "media-quiz";
		const currentStageMaxMistakes = currentStage.config?.maxMistakes;
		const canLimitCurrentStage =
			typeof currentStageMaxMistakes === "number" &&
			currentStageMaxMistakes > 0;

		if (isMediaQuizStage) {
			const questionPair = currentStage.pairs[0];
			if (!questionPair) return;
			if (isGameOver || matchedPairIds.includes(questionPair.id)) return;

			setSelectedRightId(pairId);
			const correct = pairId === questionPair.id;

			if (correct) {
				onPlaySound?.("yay");
				setLastMatchedId(pairId);
				setMatchedPairIds([questionPair.id]);
				setTimeout(() => {
					setLastMatchedId(null);
					setSelectedRightId(null);
				}, 800);
				setTimeout(() => setShowModal(true), 400);
			} else {
				onPlaySound?.("xp-error");
				setWrongPair({ leftId: questionPair.id, rightId: pairId });
				if (canLimitCurrentStage && currentStageMaxMistakes) {
					const nextMistakes = mistakesCount + 1;
					setMistakesCount(nextMistakes);
					if (nextMistakes >= currentStageMaxMistakes) {
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
			onPlaySound?.("yay");
			setLastMatchedId(pairId);
			const nextMatched = [...matchedPairIds, pairId];
			setMatchedPairIds(nextMatched);
			setSelectedLeftId(null);
			setSelectedRightId(null);
			setTimeout(() => setLastMatchedId(null), 800);
			if (nextMatched.length === currentStage.pairs.length) {
				onPlaySound?.("victory-mario");
				setTimeout(() => setShowModal(true), 400);
			}
		} else {
			onPlaySound?.("xp-error");
			setWrongPair({ leftId: selectedLeftId, rightId: pairId });
			if (
				isLimitedMode &&
				currentStageMaxMistakes &&
				currentStageMaxMistakes > 0
			) {
				const nextMistakes = mistakesCount + 1;
				setMistakesCount(nextMistakes);
				if (nextMistakes >= currentStageMaxMistakes) {
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

	const handleNextStage = () => {
		if (isLastStage) return;
		onPlaySound?.("anime-wow");
		setCompletedPairCount((prev) => prev + matchedPairIds.length);
		setCompletedStagesCount((prev) => prev + 1);
		setTotalMistakesCount((prev) => prev + mistakesCount);
		setStageIndex((prev) => Math.min(prev + 1, gameData.stages.length - 1));
		resetCurrentStage();
	};

	if (!currentStage) {
		return (
			<div className="bg-slate-50 text-slate-900 dark:bg-slate-950 min-h-screen">
				<div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
					<div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
						<h1 className="text-2xl font-bold tracking-tight">
							Matching game chưa có dữ liệu
						</h1>
						<p className="mt-3 text-sm text-slate-600">
							Game này chưa có stage nào được cấu hình.
						</p>
						<div className="mt-6 flex justify-center">
							<button
								type="button"
								onClick={onExit}
								className="rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
							>
								{exitLabel}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (resultSummary) {
		const minutes = Math.floor(resultSummary.time / 60);
		const seconds = resultSummary.time % 60;
		const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		const isPerfect =
			resultSummary.correct === resultSummary.total && resultSummary.total > 0;
		const pct =
			resultSummary.total > 0
				? Math.round((resultSummary.correct / resultSummary.total) * 100)
				: 0;
		const feedback = isPerfect
			? "Bạn làm rất tốt, hãy tiếp tục phát huy nhé."
			: pct >= 70
				? "Khá tốt. Hãy thử lại để đạt điểm tuyệt đối nhé."
				: pct > 0
					? "Cố gắng thêm nhé, bạn sẽ làm tốt hơn."
					: "Hãy bắt đầu chơi để xem kết quả của bạn.";

		return (
			<div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
				<div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
					<header className="flex items-center justify-between border-b border-primary/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 lg:px-20 sticky top-0 z-50">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
								<span className="material-symbols-outlined text-2xl">
									computer
								</span>
							</div>
							<h2 className="text-xl font-bold tracking-tight text-primary">
								Bit Learning
							</h2>
						</div>
						<div className="flex items-center gap-4">{headerActions}</div>
					</header>

					<main className="flex flex-1 items-center justify-center p-4 lg:p-10">
						<div className="w-full max-w-2xl">
							<div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 p-8 lg:p-12 text-center border border-primary/10">
								<div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5" />
								<div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-primary/5" />

								<div className="mb-8">
									<div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 mb-6">
										<span className="material-symbols-outlined text-6xl">
											emoji_events
										</span>
									</div>
									<h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
										{isPerfect
											? "Chúc mừng bạn đã hoàn thành!"
											: "Kết quả của bạn"}
									</h1>
									<p className="text-lg text-slate-500 dark:text-slate-400">
										{resultSummary.title}
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
									<div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 p-6 border border-primary/10">
										<span className="material-symbols-outlined text-primary mb-2 text-3xl">
											task_alt
										</span>
										<p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
											Số câu đúng
										</p>
										<p className="text-4xl font-bold text-primary">
											{resultSummary.correct}/{resultSummary.total}
										</p>
									</div>
									<div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 p-6 border border-primary/10">
										<span className="material-symbols-outlined text-primary mb-2 text-3xl">
											timer
										</span>
										<p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
											Thời gian
										</p>
										<p className="text-4xl font-bold text-primary">
											{timeDisplay}
										</p>
									</div>
									<div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 p-6 border border-primary/10">
										<span className="material-symbols-outlined text-primary mb-2 text-3xl">
											percent
										</span>
										<p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
											Tỷ lệ đúng
										</p>
										<p className="text-4xl font-bold text-primary">{pct}%</p>
									</div>
								</div>

								<div
									className={`rounded-lg p-4 mb-10 border ${isPerfect ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30" : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30"}`}
								>
									<p
										className={`font-medium text-lg ${isPerfect ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}
									>
										"{feedback}"
									</p>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<button
										type="button"
										onClick={handleRestartAll}
										className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-8 py-4 text-primary font-bold text-lg hover:bg-primary/5 transition-all active:scale-95 sm:min-w-[180px]"
									>
										<span className="material-symbols-outlined">replay</span>
										Làm lại
									</button>
									<button
										type="button"
										onClick={onExit}
										className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-white font-bold text-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 sm:min-w-[180px]"
									>
										<span className="material-symbols-outlined">
											arrow_back
										</span>
										{exitLabel}
									</button>
								</div>
							</div>
						</div>
					</main>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
			<header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="bg-primary/10 p-2 rounded-lg text-primary cursor-pointer"
						onClick={onExit}
					>
						<span className="material-symbols-outlined text-2xl">school</span>
					</button>
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
						/>
					</div>
				</div>
				{isLimitedMode && (
					<div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-500">
						<div className="flex items-center gap-0.5">
							{heartSlots.map((heartNumber) => {
								const filled = heartsLeft !== null && heartNumber <= heartsLeft;
								return (
									<span
										key={heartNumber}
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
				<div className="flex items-center gap-4">{headerActions}</div>
			</header>

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
										type="button"
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
										type="button"
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
										type="button"
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
			</main>

			<footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center">
				<div className="flex items-center gap-2 text-slate-500">
					<span className="material-symbols-outlined">info</span>
					<span className="text-sm font-medium">{footerNote}</span>
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={resetCurrentStage}
						className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
					>
						Làm lại
					</button>
					<button
						type="button"
						onClick={handleViewResults}
						className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2"
					>
						Kiểm tra kết quả
						<span className="material-symbols-outlined text-lg">
							arrow_forward
						</span>
					</button>
				</div>
			</footer>

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
								type="button"
								onClick={isLastStage ? handleRestartAll : handleNextStage}
								className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-primary/90 transition-colors"
							>
								{isLastStage ? "Chơi lại từ đầu" : "Tiếp tục màn tiếp theo"}
							</button>
							{isLastStage && (
								<button
									type="button"
									onClick={handleViewResults}
									className="w-full bg-slate-100 dark:bg-slate-800 font-bold py-4 rounded-xl text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
								>
									Xem kết quả
								</button>
							)}
						</div>
					</div>
				</div>
			)}

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
								type="button"
								onClick={resetCurrentStage}
								className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-primary/90 transition-colors"
							>
								Chơi lại
							</button>
							<button
								type="button"
								onClick={handleViewResults}
								className="w-full bg-slate-100 dark:bg-slate-800 font-bold py-4 rounded-xl text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
							>
								Kiểm tra kết quả
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
