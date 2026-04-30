import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Blocks,
	Lightbulb,
	Play,
	RotateCcw,
	Trash2,
	X,
} from "lucide-react";
import { GameBoard } from "../components/GameBoard";
import { KidsBlocklyWorkspace } from "../components/KidsBlocklyWorkspace";
import { RewardDialog } from "../components/RewardDialog";
import tomSadAsset from "../asset/tom_sad.png";
import { kidsBlocklyLevels } from "../data/levels";
import { runProgram } from "../engine/run-program";
import type {
	CharacterState,
	KidsBlocklyLevel,
	KidsBlocklyProgress,
	ProgramBlock,
	RunResult,
} from "../types";

const storageKey = "kids-blockly-progress-v1";

function getFirstLevel(): KidsBlocklyLevel {
	const level = kidsBlocklyLevels[0];
	if (!level) {
		throw new Error("Kids Blockly requires at least one level.");
	}
	return level;
}

const firstLevel = getFirstLevel();

interface BlocklyInfoDialogProps {
	open: boolean;
	title: string;
	description: string;
	tone?: "hint" | "warning";
	imageSrc?: string;
	imageAlt?: string;
	onClose: () => void;
}

function BlocklyInfoDialog({
	open,
	title,
	description,
	tone = "hint",
	imageSrc,
	imageAlt,
	onClose,
}: BlocklyInfoDialogProps) {
	const isWarning = tone === "warning";

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
				>
					<motion.div
						initial={{ scale: 0.92, y: 14 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.94, y: 10 }}
						className={cn(
							"w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.24)]",
							imageSrc && "text-center",
						)}
					>
						<div
							className={cn(
								"flex items-start justify-between gap-4",
								imageSrc && "justify-center",
							)}
						>
							{imageSrc ? (
								<div className="relative mx-auto h-32 w-32">
									<img
										src={imageSrc}
										alt={imageAlt ?? ""}
										className="h-full w-full object-contain drop-shadow-lg"
										draggable={false}
									/>
								</div>
							) : (
								<div
									className={cn(
										"flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
										isWarning
											? "bg-amber-100 text-amber-700"
											: "bg-sky-100 text-sky-700",
									)}
								>
									{isWarning ? (
										<AlertTriangle className="h-6 w-6" />
									) : (
										<Lightbulb className="h-6 w-6" />
									)}
								</div>
							)}
							<button
								type="button"
								onClick={onClose}
								className={cn(
									"flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900",
									imageSrc && "absolute right-5 top-5",
								)}
								aria-label="Đóng"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<h3 className="mt-4 text-2xl font-black text-slate-900">{title}</h3>
						<p className="mt-3 text-base leading-7 text-slate-600">
							{description}
						</p>
						<div
							className={cn(
								"mt-6 flex justify-end",
								imageSrc && "justify-center",
							)}
						>
							<Button
								onPress={onClose}
								className={cn(
									"cursor-pointer rounded-2xl px-5 py-3 text-white",
									isWarning
										? "bg-amber-500 hover:bg-amber-600"
										: "bg-sky-500 hover:bg-sky-600",
								)}
							>
								Đã hiểu
							</Button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
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
	const [showHint, setShowHint] = useState(false);
	const [showStatus, setShowStatus] = useState(false);
	const [lastStars, setLastStars] = useState(0);
	const [workspaceResetSignal, setWorkspaceResetSignal] = useState(0);
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
	const totalStars = useMemo(
		() =>
			Object.values(progress.starsByLevel).reduce(
				(sum, value) => sum + value,
				0,
			),
		[progress.starsByLevel],
	);
	const nextLevel = kidsBlocklyLevels[levelIndex + 1];

	useEffect(() => {
		setCharacter(level.start);
		setProgram([]);
		setRunResult(null);
		setShowReward(false);
		setShowHint(false);
		setShowStatus(false);
		setActiveBlockId(null);
		setWorkspaceResetSignal((value) => value + 1);
	}, [level.start]);

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

	const handleProgramChange = useCallback((nextProgram: ProgramBlock[]) => {
		setProgram(nextProgram);
		setRunResult(null);
		setShowStatus(false);
	}, []);

	const resetProgram = useCallback(() => {
		clearPlayback();
		setProgram([]);
		setRunResult(null);
		setCharacter(level.start);
		setActiveBlockId(null);
		setShowReward(false);
		setShowStatus(false);
		setIsRunning(false);
		setWorkspaceResetSignal((value) => value + 1);
	}, [clearPlayback, level.start]);

	const replayCurrent = useCallback(() => {
		clearPlayback();
		setRunResult(null);
		setCharacter(level.start);
		setActiveBlockId(null);
		setShowReward(false);
		setShowStatus(false);
		setIsRunning(false);
	}, [clearPlayback, level.start]);

	const unlockNextLevel = useCallback((currentLevelId: string) => {
		const currentIndex = kidsBlocklyLevels.findIndex(
			(item) => item.id === currentLevelId,
		);
		const nextLevelToUnlock = kidsBlocklyLevels[currentIndex + 1];
		if (!nextLevelToUnlock) return;

		setProgress((prev) => {
			if (prev.unlockedLevelIds.includes(nextLevelToUnlock.id)) return prev;
			return {
				...prev,
				unlockedLevelIds: [...prev.unlockedLevelIds, nextLevelToUnlock.id],
			};
		});
	}, []);

	const handleRun = useCallback(() => {
		clearPlayback();
		setCharacter(level.start);
		setRunResult(null);
		setActiveBlockId(null);
		setShowReward(false);
		setShowStatus(false);

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
					} else {
						window.setTimeout(() => setShowStatus(true), 240);
					}
				}
			}, index * 500);

			playbackTimeouts.current.push(timeoutId);
		});
	}, [clearPlayback, level, program, unlockNextLevel]);

	const goNext = useCallback(() => {
		setShowReward(false);
		if (nextLevel) {
			setSelectedLevelId(nextLevel.id);
		}
	}, [nextLevel]);

	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,#f7fffb_0%,#eef8ff_48%,#f8fafc_100%)]">
			<div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-5 lg:px-6">
				<header className="flex flex-col gap-3 rounded-[22px] border border-white/80 bg-white/85 px-5 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.07)] backdrop-blur-md md:flex-row md:items-center md:justify-between">
					<div className="min-w-0">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
							Kids Visual Coding
						</p>
						<h1 className="mt-1 truncate text-2xl font-black text-slate-900 md:text-3xl">
							Kéo khối lệnh để đưa nhân vật tới đích
						</h1>
					</div>
					<div className="grid grid-cols-3 gap-2 text-center">
						<div className="rounded-2xl bg-emerald-50 px-4 py-2">
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
								Màn
							</p>
							<p className="text-xl font-black text-slate-900">
								{levelIndex + 1}
							</p>
						</div>
						<div className="rounded-2xl bg-sky-50 px-4 py-2">
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
								Đã mở
							</p>
							<p className="text-xl font-black text-slate-900">
								{progress.unlockedLevelIds.length}
							</p>
						</div>
						<div className="rounded-2xl bg-amber-50 px-4 py-2">
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600">
								Sao
							</p>
							<p className="text-xl font-black text-slate-900">{totalStars}</p>
						</div>
					</div>
				</header>

				<main className="grid flex-1 items-stretch gap-4 lg:min-h-[620px] lg:grid-cols-[minmax(420px,0.92fr)_minmax(540px,1.08fr)]">
					<section className="relative min-h-[520px]">
						<GameBoard
							level={level}
							character={character}
							isRunning={isRunning}
						/>
						<RewardDialog
							open={showReward}
							stars={lastStars}
							message={runResult?.message ?? ""}
							onNext={goNext}
							onReplay={replayCurrent}
							hasNextLevel={!!nextLevel}
						/>
					</section>

					<section className="flex min-h-[620px] flex-col rounded-[24px] border border-sky-100 bg-white/90 p-4 shadow-[0_20px_44px_rgba(14,165,233,0.12)] backdrop-blur-sm">
						<div className="mb-3 flex items-center justify-between gap-3">
							<div className="min-w-0">
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
									Sân lập trình
								</p>
								<h2 className="mt-1 truncate text-xl font-bold text-slate-900">
									Kéo khối vào dưới cờ bắt đầu
								</h2>
							</div>
							<div className="flex shrink-0 items-center gap-2 rounded-2xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
								<Blocks className="h-4 w-4" />
								{program.length} bước
							</div>
						</div>

						<KidsBlocklyWorkspace
							allowedBlocks={level.allowedBlocks}
							isRunning={isRunning}
							activeBlockId={activeBlockId}
							resetSignal={workspaceResetSignal}
							className="flex-1"
							onProgramChange={handleProgramChange}
						/>
					</section>
				</main>

				<footer className="grid gap-4 rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-[0_16px_38px_rgba(15,23,42,0.07)] backdrop-blur-md xl:grid-cols-[0.75fr_1.25fr]">
					<div className="flex flex-col justify-between gap-3">
						<div className="flex flex-wrap gap-3">
							<Button
								onPress={() => setShowHint(true)}
								isDisabled={isRunning}
								className="cursor-pointer rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sky-700 hover:bg-sky-100"
							>
								<Lightbulb className="mr-2 h-4 w-4" />
								Gợi ý
							</Button>
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
								<Trash2 className="mr-2 h-4 w-4" />
								Xóa hết
							</Button>
						</div>
						<p className="text-sm leading-6 text-slate-500">
							Kéo các khối lệnh, nối vào cờ bắt đầu rồi bấm Chạy. Kết quả sẽ tự
							hiện sau khi nhân vật di chuyển xong.
						</p>
					</div>

					<div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
						{kidsBlocklyLevels.map((item, index) => {
							const unlocked =
								progress.unlockedLevelIds.includes(item.id) || index === 0;
							const stars = progress.starsByLevel[item.id] ?? 0;
							const selected = item.id === level.id;

							return (
								<button
									key={item.id}
									type="button"
									disabled={!unlocked || isRunning}
									onClick={() => setSelectedLevelId(item.id)}
									className={cn(
										"min-h-16 rounded-2xl border px-3 py-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45",
										selected
											? "border-emerald-300 bg-emerald-50 shadow-[0_10px_20px_rgba(16,185,129,0.12)]"
											: "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50",
									)}
								>
									<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
										Màn {index + 1}
									</p>
									<p className="truncate text-sm font-bold text-slate-900">
										{item.title}
									</p>
									<p className="text-xs text-amber-500">
										{Array.from({ length: 3 })
											.map((_, starIndex) => (starIndex < stars ? "★" : "☆"))
											.join(" ")}
									</p>
								</button>
							);
						})}
					</div>
				</footer>
			</div>

			<BlocklyInfoDialog
				open={showHint}
				title="Gợi ý"
				description={level.hint}
				onClose={() => setShowHint(false)}
			/>
			<BlocklyInfoDialog
				open={showStatus && !!runResult}
				title="Thử lại nhé"
				description={runResult?.message ?? ""}
				tone="warning"
				imageSrc={tomSadAsset}
				imageAlt="Tom buồn"
				onClose={() => setShowStatus(false)}
			/>
		</div>
	);
}
