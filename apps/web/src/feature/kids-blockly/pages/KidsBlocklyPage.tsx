import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
import { Play, RotateCcw, Sparkles, Lightbulb, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { kidsBlocklyLevels } from "../data/levels";
import { runProgram } from "../engine/run-program";
import { GameBoard } from "../components/GameBoard";
import { RewardDialog } from "../components/RewardDialog";
import type {
	BlockType,
	CharacterState,
	KidsBlocklyLevel,
	KidsBlocklyProgress,
	ProgramBlock,
	RunResult,
} from "../types";

const blockMeta: Record<BlockType, { label: string; icon: string; color: string; help: string }> = {
	move: {
		label: "Đi thẳng",
		icon: "⬆️",
		color: "from-emerald-400 to-teal-500",
		help: "Nhân vật tiến lên 1 ô.",
	},
	left: {
		label: "Rẽ trái",
		icon: "↪️",
		color: "from-orange-400 to-amber-500",
		help: "Nhân vật quay sang trái.",
	},
	right: {
		label: "Rẽ phải",
		icon: "↩️",
		color: "from-sky-400 to-blue-500",
		help: "Nhân vật quay sang phải.",
	},
};

const storageKey = "kids-blockly-progress-v1";

function createBlock(type: BlockType): ProgramBlock {
	return {
		id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		type,
	};
}

function getStars(level: KidsBlocklyLevel, blockCount: number): number {
	if (blockCount <= level.par) return 3;
	if (blockCount <= level.par + 2) return 2;
	return 1;
}

function loadProgress(): KidsBlocklyProgress {
	if (typeof window === "undefined") {
		return { unlockedLevelIds: [kidsBlocklyLevels[0].id], starsByLevel: {} };
	}

	try {
		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return { unlockedLevelIds: [kidsBlocklyLevels[0].id], starsByLevel: {} };
		const parsed = JSON.parse(raw) as KidsBlocklyProgress;
		return {
			unlockedLevelIds: parsed.unlockedLevelIds?.length ? parsed.unlockedLevelIds : [kidsBlocklyLevels[0].id],
			starsByLevel: parsed.starsByLevel ?? {},
		};
	} catch {
		return { unlockedLevelIds: [kidsBlocklyLevels[0].id], starsByLevel: {} };
	}
}

export default function KidsBlocklyPage() {
	const [progress, setProgress] = useState<KidsBlocklyProgress>(() => loadProgress());
	const [selectedLevelId, setSelectedLevelId] = useState(kidsBlocklyLevels[0].id);
	const [program, setProgram] = useState<ProgramBlock[]>([]);
	const [character, setCharacter] = useState<CharacterState>(kidsBlocklyLevels[0].start);
	const [runResult, setRunResult] = useState<RunResult | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
	const [showReward, setShowReward] = useState(false);
	const [lastStars, setLastStars] = useState(0);
	const playbackTimeouts = useRef<number[]>([]);

	const level = useMemo(
		() => kidsBlocklyLevels.find((item) => item.id === selectedLevelId) ?? kidsBlocklyLevels[0],
		[selectedLevelId],
	);
	const levelIndex = useMemo(() => kidsBlocklyLevels.findIndex((item) => item.id === selectedLevelId), [selectedLevelId]);

	useEffect(() => {
		setCharacter(level.start);
		setProgram([]);
		setRunResult(null);
		setShowReward(false);
	}, [level.id]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(storageKey, JSON.stringify(progress));
		}
	}, [progress]);

	const clearPlayback = useCallback(() => {
		for (const timeoutId of playbackTimeouts.current) {
			window.clearTimeout(timeoutId);
		}
		playbackTimeouts.current = [];
	}, []);

	useEffect(() => clearPlayback, [clearPlayback]);

	const addBlock = useCallback(
		(type: BlockType) => {
			if (isRunning) return;
			setProgram((prev) => [...prev, createBlock(type)]);
		},
		[isRunning],
	);

	const moveBlock = useCallback(
		(index: number, direction: "up" | "down") => {
			if (isRunning) return;
			setProgram((prev) => {
				const next = [...prev];
				const swapIndex = direction === "up" ? index - 1 : index + 1;
				if (swapIndex < 0 || swapIndex >= next.length) return prev;
				[next[index], next[swapIndex]] = [next[swapIndex], next[index]];
				return next;
			});
		},
		[isRunning],
	);

	const removeBlock = useCallback(
		(id: string) => {
			if (isRunning) return;
			setProgram((prev) => prev.filter((block) => block.id !== id));
		},
		[isRunning],
	);

	const resetProgram = useCallback(() => {
		clearPlayback();
		setProgram([]);
		setRunResult(null);
		setCharacter(level.start);
		setActiveBlockId(null);
		setShowReward(false);
		setIsRunning(false);
	}, [clearPlayback, level.start]);

	const replayCurrent = useCallback(() => {
		clearPlayback();
		setRunResult(null);
		setCharacter(level.start);
		setActiveBlockId(null);
		setShowReward(false);
		setIsRunning(false);
	}, [clearPlayback, level.start]);

	const unlockNextLevel = useCallback(
		(currentLevelId: string) => {
			const currentIndex = kidsBlocklyLevels.findIndex((item) => item.id === currentLevelId);
			const nextLevel = kidsBlocklyLevels[currentIndex + 1];
			if (!nextLevel) return;

			setProgress((prev) => {
				if (prev.unlockedLevelIds.includes(nextLevel.id)) return prev;
				return {
					...prev,
					unlockedLevelIds: [...prev.unlockedLevelIds, nextLevel.id],
				};
			});
		},
		[],
	);

	const handleRun = useCallback(() => {
		clearPlayback();
		setCharacter(level.start);
		setRunResult(null);
		setActiveBlockId(null);
		setShowReward(false);

		const result = runProgram(level, program);
		setRunResult(result);

		if (result.steps.length === 0) return;

		setIsRunning(true);
		result.steps.forEach((step, index) => {
			const timeoutId = window.setTimeout(() => {
				setCharacter(step.state);
				setActiveBlockId(step.blockId);

				const isLast = index === result.steps.length - 1;
				if (isLast) {
					setIsRunning(false);
					if (result.status === "success") {
						const stars = getStars(level, program.length);
						setLastStars(stars);
						setProgress((prev) => ({
							unlockedLevelIds: prev.unlockedLevelIds,
							starsByLevel: {
								...prev.starsByLevel,
								[level.id]: Math.max(prev.starsByLevel[level.id] ?? 0, stars),
							},
						}));
						unlockNextLevel(level.id);
						window.setTimeout(() => setShowReward(true), 240);
					}
				}
			}, index * 500);

			playbackTimeouts.current.push(timeoutId);
		});
	}, [clearPlayback, level, program, unlockNextLevel]);

	const nextLevel = kidsBlocklyLevels[levelIndex + 1];

	const goNext = useCallback(() => {
		setShowReward(false);
		if (nextLevel) {
			setSelectedLevelId(nextLevel.id);
		}
	}, [nextLevel]);

	return (
		<div className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fffb_0%,#ecfeff_44%,#f8fafc_100%)]">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(110,231,183,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_32%)]" />
			<div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col gap-6 rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-md lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Kids Visual Coding</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
							Kéo thả khối lệnh để đưa nhân vật tới đích
						</h1>
						<p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
							Học tư duy tuần tự bằng trò chơi trực quan, ít khối lệnh, phản hồi nhanh và dễ dùng cho trẻ nhỏ.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<div className="rounded-[24px] bg-emerald-50 px-4 py-4">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Màn đã mở</p>
							<p className="mt-2 text-3xl font-black text-slate-900">{progress.unlockedLevelIds.length}</p>
						</div>
						<div className="rounded-[24px] bg-sky-50 px-4 py-4">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Tổng sao</p>
							<p className="mt-2 text-3xl font-black text-slate-900">
								{Object.values(progress.starsByLevel).reduce((sum, value) => sum + value, 0)}
							</p>
						</div>
						<div className="rounded-[24px] bg-amber-50 px-4 py-4 col-span-2 sm:col-span-1">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Mục tiêu</p>
							<p className="mt-2 text-lg font-bold text-slate-900">Đi đúng đường, dùng ít khối</p>
						</div>
					</div>
				</div>

				<div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
					{kidsBlocklyLevels.map((item, index) => {
						const unlocked = progress.unlockedLevelIds.includes(item.id) || index === 0;
						const stars = progress.starsByLevel[item.id] ?? 0;
						const selected = item.id === level.id;

						return (
							<button
								key={item.id}
								type="button"
								disabled={!unlocked}
								onClick={() => setSelectedLevelId(item.id)}
								className={cn(
									"rounded-[24px] border px-4 py-4 text-left transition-all",
									selected
										? "border-emerald-300 bg-emerald-50 shadow-[0_16px_30px_rgba(16,185,129,0.14)]"
										: "border-white bg-white/85 hover:-translate-y-0.5 hover:shadow-md",
									!unlocked && "cursor-not-allowed opacity-50",
								)}
							>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Màn {index + 1}</p>
								<p className="mt-2 text-lg font-bold text-slate-900">{item.title}</p>
								<p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
								<p className="mt-3 text-sm">{Array.from({ length: 3 }).map((_, starIndex) => (starIndex < stars ? "⭐" : "☆")).join(" ")}</p>
							</button>
						);
					})}
				</div>

				<div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
					<div className="relative">
						<GameBoard level={level} character={character} isRunning={isRunning} />
						<RewardDialog
							open={showReward}
							stars={lastStars}
							message={runResult?.message ?? ""}
							onNext={goNext}
							onReplay={replayCurrent}
							hasNextLevel={!!nextLevel}
						/>
					</div>

					<div className="space-y-6">
						<div className="rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Gợi ý</p>
									<p className="mt-2 text-sm leading-6 text-slate-700">{level.hint}</p>
								</div>
								<div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
									<Lightbulb className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div className="rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
							<div className="mb-4 flex items-center justify-between">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Hộp khối lệnh</p>
									<h3 className="mt-1 text-xl font-bold text-slate-900">Chạm để thêm khối</h3>
								</div>
								<Sparkles className="h-5 w-5 text-emerald-500" />
							</div>
							<div className="grid gap-3 sm:grid-cols-2">
								{level.allowedBlocks.map((type) => (
									<button
										key={type}
										type="button"
										onClick={() => addBlock(type)}
										disabled={isRunning}
										className={cn(
											"rounded-[22px] bg-gradient-to-br p-[1px] text-left transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
											blockMeta[type].color,
										)}
									>
										<div className="rounded-[21px] bg-white px-4 py-4">
											<div className="flex items-center gap-3">
												<div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white", blockMeta[type].color)}>
													{blockMeta[type].icon}
												</div>
												<div>
													<p className="font-bold text-slate-900">{blockMeta[type].label}</p>
													<p className="text-sm text-slate-500">{blockMeta[type].help}</p>
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
						</div>

						<div className="rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
							<div className="mb-4 flex items-center justify-between">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Chương trình</p>
									<h3 className="mt-1 text-xl font-bold text-slate-900">Sắp xếp các bước đi</h3>
								</div>
								<div className="rounded-2xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
									Par: {level.par}
								</div>
							</div>

							<div className="space-y-3">
								<div className="rounded-[22px] border border-dashed border-sky-200 bg-sky-50 px-4 py-4">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-2xl text-white">🚩</div>
										<div>
											<p className="font-bold text-slate-900">Bắt đầu</p>
											<p className="text-sm text-slate-500">Đây là điểm bắt đầu của chương trình.</p>
										</div>
									</div>
								</div>

								{program.length === 0 && (
									<div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
										Chưa có khối lệnh nào. Hãy thêm vài khối ở phía trên.
									</div>
								)}

								{program.map((block, index) => (
									<motion.div
										key={block.id}
										layout
										className={cn(
											"rounded-[22px] bg-gradient-to-br p-[1px]",
											blockMeta[block.type].color,
											activeBlockId === block.id && "shadow-[0_0_0_4px_rgba(16,185,129,0.18)]",
										)}
									>
										<div className="flex items-center gap-3 rounded-[21px] bg-white px-4 py-4">
											<div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white", blockMeta[block.type].color)}>
												{blockMeta[block.type].icon}
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-bold text-slate-900">{blockMeta[block.type].label}</p>
												<p className="text-sm text-slate-500">Bước {index + 1}</p>
											</div>
											<div className="flex items-center gap-1">
												<button
													type="button"
													onClick={() => moveBlock(index, "up")}
													className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
													disabled={index === 0 || isRunning}
												>
													<ChevronUp className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={() => moveBlock(index, "down")}
													className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
													disabled={index === program.length - 1 || isRunning}
												>
													<ChevronDown className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={() => removeBlock(block.id)}
													className="rounded-xl p-2 text-rose-500 transition-colors hover:bg-rose-50"
													disabled={isRunning}
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</div>
									</motion.div>
								))}
							</div>

							<div className="mt-5 flex flex-wrap gap-3">
								<Button
									onPress={handleRun}
									isDisabled={isRunning || program.length === 0}
									className="cursor-pointer rounded-2xl bg-emerald-500 px-5 py-3 text-white hover:bg-emerald-600 disabled:bg-slate-300"
								>
									<Play className="mr-2 h-4 w-4" />
									Chạy
								</Button>
								<Button
									onPress={replayCurrent}
									isDisabled={isRunning}
									className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700 hover:bg-slate-50"
								>
									<RotateCcw className="mr-2 h-4 w-4" />
									Chạy lại
								</Button>
								<Button
									onPress={resetProgram}
									isDisabled={isRunning}
									className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700 hover:bg-slate-50"
								>
									Xóa hết
								</Button>
							</div>

							{runResult && (
								<div
									className={cn(
										"mt-5 rounded-[22px] border px-4 py-4 text-sm leading-6",
										runResult.status === "success"
											? "border-emerald-200 bg-emerald-50 text-emerald-800"
											: "border-amber-200 bg-amber-50 text-amber-800",
									)}
								>
									{runResult.message}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
