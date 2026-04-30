import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
import { Blocks, Lightbulb, Play, RotateCcw } from "lucide-react";
import { characterOptions } from "../data/characters";
import { kidsBlocklyLevels } from "../data/levels";
import { runProgram } from "../engine/run-program";
import { GameBoard } from "../components/GameBoard";
import { KidsBlocklyWorkspace } from "../components/KidsBlocklyWorkspace";
import { RewardDialog } from "../components/RewardDialog";
import type {
	CharacterState,
	KidsBlocklyLevel,
	KidsBlocklyProgress,
	ProgramBlock,
	RunResult,
} from "../types";

const storageKey = "kids-blockly-progress-v1";
const characterStorageKey = "kids-blockly-character-v1";

function getFirstLevel(): KidsBlocklyLevel {
	const level = kidsBlocklyLevels[0];
	if (!level) {
		throw new Error("Kids Blockly requires at least one level.");
	}
	return level;
}

const firstLevel = getFirstLevel();
const firstCharacter = characterOptions[0];

function getInitialCharacterId(): string {
	if (typeof window === "undefined") return firstCharacter.id;

	const savedCharacterId = window.localStorage.getItem(characterStorageKey);
	return characterOptions.some((option) => option.id === savedCharacterId)
		? (savedCharacterId ?? firstCharacter.id)
		: firstCharacter.id;
}

function getStars(level: KidsBlocklyLevel, blockCount: number): number {
	if (blockCount <= level.par) return 3;
	if (blockCount <= level.par + 2) return 2;
	return 1;
}

function loadProgress(): KidsBlocklyProgress {
	if (typeof window === "undefined") {
		return { unlockedLevelIds: [firstLevel.id], starsByLevel: {} };
	}

	try {
		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return { unlockedLevelIds: [firstLevel.id], starsByLevel: {} };
		const parsed = JSON.parse(raw) as KidsBlocklyProgress;
		return {
			unlockedLevelIds: parsed.unlockedLevelIds?.length
				? parsed.unlockedLevelIds
				: [firstLevel.id],
			starsByLevel: parsed.starsByLevel ?? {},
		};
	} catch {
		return { unlockedLevelIds: [firstLevel.id], starsByLevel: {} };
	}
}

export default function KidsBlocklyPage() {
	const [progress, setProgress] = useState<KidsBlocklyProgress>(() =>
		loadProgress(),
	);
	const [selectedLevelId, setSelectedLevelId] = useState(firstLevel.id);
	const [program, setProgram] = useState<ProgramBlock[]>([]);
	const [character, setCharacter] = useState<CharacterState>(firstLevel.start);
	const [runResult, setRunResult] = useState<RunResult | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
	const [showReward, setShowReward] = useState(false);
	const [lastStars, setLastStars] = useState(0);
	const [workspaceResetSignal, setWorkspaceResetSignal] = useState(0);
	const [selectedCharacterId, setSelectedCharacterId] = useState(() =>
		getInitialCharacterId(),
	);
	const playbackTimeouts = useRef<number[]>([]);

	const level = useMemo(
		() =>
			kidsBlocklyLevels.find((item) => item.id === selectedLevelId) ??
			firstLevel,
		[selectedLevelId],
	);
	const levelIndex = useMemo(
		() => kidsBlocklyLevels.findIndex((item) => item.id === selectedLevelId),
		[selectedLevelId],
	);
	const selectedCharacter = useMemo(
		() =>
			characterOptions.find((option) => option.id === selectedCharacterId) ??
			firstCharacter,
		[selectedCharacterId],
	);

	useEffect(() => {
		setCharacter(level.start);
		setProgram([]);
		setRunResult(null);
		setShowReward(false);
		setActiveBlockId(null);
		setWorkspaceResetSignal((value) => value + 1);
	}, [level.start]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(storageKey, JSON.stringify(progress));
		}
	}, [progress]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(characterStorageKey, selectedCharacterId);
		}
	}, [selectedCharacterId]);

	const clearPlayback = useCallback(() => {
		for (const timeoutId of playbackTimeouts.current) {
			window.clearTimeout(timeoutId);
		}
		playbackTimeouts.current = [];
	}, []);

	useEffect(() => clearPlayback, [clearPlayback]);

	const handleProgramChange = useCallback((nextProgram: ProgramBlock[]) => {
		setProgram(nextProgram);
		setRunResult(null);
	}, []);

	const resetProgram = useCallback(() => {
		clearPlayback();
		setProgram([]);
		setRunResult(null);
		setCharacter(level.start);
		setActiveBlockId(null);
		setShowReward(false);
		setIsRunning(false);
		setWorkspaceResetSignal((value) => value + 1);
	}, [clearPlayback, level.start]);

	const replayCurrent = useCallback(() => {
		clearPlayback();
		setRunResult(null);
		setCharacter(level.start);
		setActiveBlockId(null);
		setShowReward(false);
		setIsRunning(false);
	}, [clearPlayback, level.start]);

	const unlockNextLevel = useCallback((currentLevelId: string) => {
		const currentIndex = kidsBlocklyLevels.findIndex(
			(item) => item.id === currentLevelId,
		);
		const nextLevel = kidsBlocklyLevels[currentIndex + 1];
		if (!nextLevel) return;

		setProgress((prev) => {
			if (prev.unlockedLevelIds.includes(nextLevel.id)) return prev;
			return {
				...prev,
				unlockedLevelIds: [...prev.unlockedLevelIds, nextLevel.id],
			};
		});
	}, []);

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
						<p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
							Kids Visual Coding
						</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
							Kéo thả khối lệnh để đưa nhân vật tới đích
						</h1>
						<p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
							Học tư duy tuần tự bằng trò chơi trực quan, ít khối lệnh, phản hồi
							nhanh và dễ dùng cho trẻ nhỏ.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<div className="rounded-[24px] bg-emerald-50 px-4 py-4">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
								Màn đã mở
							</p>
							<p className="mt-2 text-3xl font-black text-slate-900">
								{progress.unlockedLevelIds.length}
							</p>
						</div>
						<div className="rounded-[24px] bg-sky-50 px-4 py-4">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
								Tổng sao
							</p>
							<p className="mt-2 text-3xl font-black text-slate-900">
								{Object.values(progress.starsByLevel).reduce(
									(sum, value) => sum + value,
									0,
								)}
							</p>
						</div>
						<div className="rounded-[24px] bg-amber-50 px-4 py-4 col-span-2 sm:col-span-1">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
								Mục tiêu
							</p>
							<p className="mt-2 text-lg font-bold text-slate-900">
								Đi đúng đường, dùng ít khối
							</p>
						</div>
					</div>
				</div>

				<div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
					{kidsBlocklyLevels.map((item, index) => {
						const unlocked =
							progress.unlockedLevelIds.includes(item.id) || index === 0;
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
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
									Màn {index + 1}
								</p>
								<p className="mt-2 text-lg font-bold text-slate-900">
									{item.title}
								</p>
								<p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
								<p className="mt-3 text-sm">
									{Array.from({ length: 3 })
										.map((_, starIndex) => (starIndex < stars ? "⭐" : "☆"))
										.join(" ")}
								</p>
							</button>
						);
					})}
				</div>

				<div className="grid gap-6 xl:grid-cols-[0.92fr_1.28fr]">
					<div className="relative">
						<GameBoard
							level={level}
							character={character}
							isRunning={isRunning}
							characterOption={selectedCharacter}
						/>
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
						<div className="rounded-[30px] border border-white bg-white/90 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
										Gợi ý
									</p>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										{level.hint}
									</p>
								</div>
								<div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
									<Lightbulb className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div className="rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
							<div className="mb-5">
								<div className="mb-3 flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
											Nhân vật
										</p>
										<h3 className="mt-1 text-lg font-bold text-slate-900">
											Chọn bạn đồng hành
										</h3>
									</div>
								</div>
								<div className="grid gap-3 sm:grid-cols-3">
									{characterOptions.map((option) => {
										const selected = selectedCharacterId === option.id;

										return (
											<button
												key={option.id}
												type="button"
												onClick={() => setSelectedCharacterId(option.id)}
												disabled={isRunning}
												className={cn(
													"flex items-center gap-3 rounded-[20px] border bg-white px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60",
													selected
														? "border-rose-300 bg-rose-50 shadow-[0_12px_24px_rgba(244,63,94,0.12)]"
														: "border-slate-200 hover:border-rose-200 hover:bg-rose-50/50",
												)}
											>
												<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-sm">
													<img
														src={option.src}
														alt={option.alt}
														className="h-full w-full object-contain"
														draggable={false}
													/>
												</span>
												<span className="min-w-0">
													<span className="block truncate font-bold text-slate-900">
														{option.name}
													</span>
												</span>
											</button>
										);
									})}
								</div>
							</div>

							<div className="mb-4 flex items-center justify-between">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
										Blockly workspace
									</p>
									<h3 className="mt-1 text-xl font-bold text-slate-900">
										Kéo khối vào dưới Bắt đầu
									</h3>
								</div>
								<div className="flex items-center gap-2 rounded-2xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
									<Blocks className="h-4 w-4" />
									{program.length} bước
								</div>
							</div>

							<KidsBlocklyWorkspace
								allowedBlocks={level.allowedBlocks}
								isRunning={isRunning}
								activeBlockId={activeBlockId}
								resetSignal={workspaceResetSignal}
								onProgramChange={handleProgramChange}
							/>

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
