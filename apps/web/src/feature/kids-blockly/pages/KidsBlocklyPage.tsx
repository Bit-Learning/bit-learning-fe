import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Blocks, BookOpen, Lightbulb, Loader2, Play, Trophy, Trash2, X } from "lucide-react";
import { useBlocklyTour } from "../components/BlocklyTour";
import "../styles/blockly-tour.css";
import backgroundMusicAsset from "../asset/background_music.mp3";
import clickSoundAsset from "../asset/click.mp3";
import errorSoundAsset from "../asset/error.mp3";
import footstepSoundAsset from "../asset/footstep.mp3";
import popSoundAsset from "../asset/pop.mp3";
import tomSadAsset from "../asset/tom_sad.png";
import yaySoundAsset from "../asset/yay.mp3";
import { GameBoard } from "../components/GameBoard";
import { KidsBlocklyWorkspace } from "../components/KidsBlocklyWorkspace";
import { RewardDialog } from "../components/RewardDialog";
import { useKidsBlocklyBootstrap, useSubmitKidsBlocklyRun } from "../queries/useKidsBlockly";
import type { CharacterState, KidsBlocklyProgressResponse, ProgramBlock, RunResult } from "../types/kid-blockly.types";

const emptyProgress: KidsBlocklyProgressResponse = {
  unlockedLevelIds: [],
  starsByLevel: {},
  completedLevelIds: [],
  totalStars: 0,
};

function playAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}

function stopAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Không thể kết nối Kids Blockly. Vui lòng thử lại.";
}

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
            <div className={cn("flex items-start justify-between gap-4", imageSrc && "justify-center")}>
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
                    isWarning ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700",
                  )}
                >
                  {isWarning ? <AlertTriangle className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
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
            <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
            <div className={cn("mt-6 flex justify-end", imageSrc && "justify-center")}>
              <Button
                onPress={onClose}
                className={cn(
                  "cursor-pointer rounded-2xl px-5 py-3 text-white",
                  isWarning ? "bg-amber-500 hover:bg-amber-600" : "bg-sky-500 hover:bg-sky-600",
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

export default function KidsBlocklyPage() {
  const bootstrapQuery = useKidsBlocklyBootstrap();
  const submitRun = useSubmitKidsBlocklyRun();

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [program, setProgram] = useState<ProgramBlock[]>([]);
  const [character, setCharacter] = useState<CharacterState | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [progress, setProgress] = useState<KidsBlocklyProgressResponse>(emptyProgress);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [lastStars, setLastStars] = useState(0);
  const [workspaceResetSignal, setWorkspaceResetSignal] = useState(0);
  const playbackTimeouts = useRef<number[]>([]);
  const navigate = useNavigate();
  const { startTour } = useBlocklyTour();
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const popSoundRef = useRef<HTMLAudioElement | null>(null);
  const footstepSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  const yaySoundRef = useRef<HTMLAudioElement | null>(null);

  const levels = bootstrapQuery.data?.levels ?? [];
  const level = useMemo(
    () => levels.find((item) => item.id === selectedLevelId) ?? levels[0] ?? null,
    [levels, selectedLevelId],
  );
  const levelIndex = useMemo(() => levels.findIndex((item) => item.id === level?.id), [levels, level?.id]);
  const nextLevel = levelIndex >= 0 ? levels[levelIndex + 1] : undefined;

  useEffect(() => {
    if (!bootstrapQuery.data) return;

    const nextProgress = bootstrapQuery.data.progress;
    const nextLevels = bootstrapQuery.data.levels;
    const preferredLevelId =
      nextProgress.lastPlayedLevelId && nextProgress.unlockedLevelIds.includes(nextProgress.lastPlayedLevelId)
        ? nextProgress.lastPlayedLevelId
        : (nextProgress.unlockedLevelIds[0] ?? nextLevels[0]?.id);

    setProgress(nextProgress);
    setSelectedLevelId((current) => {
      if (current && nextLevels.some((item) => item.id === current)) {
        return current;
      }
      return preferredLevelId ?? null;
    });
  }, [bootstrapQuery.data]);

  useEffect(() => {
    if (!level) return;

    setCharacter(level.start);
    setProgram([]);
    setRunResult(null);
    setShowReward(false);
    setShowHint(false);
    setShowStatus(false);
    setActiveBlockId(null);
    setWorkspaceResetSignal((value) => value + 1);
  }, [level]);

  useEffect(() => {
    const backgroundMusic = new Audio(backgroundMusicAsset);
    const clickSound = new Audio(clickSoundAsset);
    const popSound = new Audio(popSoundAsset);
    const footstepSound = new Audio(footstepSoundAsset);
    const errorSound = new Audio(errorSoundAsset);
    const yaySound = new Audio(yaySoundAsset);

    backgroundMusic.loop = true;
    backgroundMusic.autoplay = true;
    backgroundMusic.preload = "auto";
    footstepSound.loop = true;
    footstepSound.preload = "auto";
    backgroundMusic.volume = 0.1;
    clickSound.volume = 0.55;
    popSound.volume = 0.55;
    footstepSound.volume = 0.8;
    errorSound.volume = 0.9;
    yaySound.volume = 0.75;

    backgroundMusicRef.current = backgroundMusic;
    clickSoundRef.current = clickSound;
    popSoundRef.current = popSound;
    footstepSoundRef.current = footstepSound;
    errorSoundRef.current = errorSound;
    yaySoundRef.current = yaySound;

    const startBackgroundMusic = () => {
      void backgroundMusic.play().catch(() => undefined);
    };

    startBackgroundMusic();
    backgroundMusic.addEventListener("canplaythrough", startBackgroundMusic, {
      once: true,
    });
    document.addEventListener("visibilitychange", startBackgroundMusic);
    window.addEventListener("pointerdown", startBackgroundMusic, {
      once: true,
    });
    window.addEventListener("keydown", startBackgroundMusic, { once: true });

    return () => {
      backgroundMusic.pause();
      stopAudio(footstepSound);
      backgroundMusic.removeEventListener("canplaythrough", startBackgroundMusic);
      document.removeEventListener("visibilitychange", startBackgroundMusic);
      window.removeEventListener("pointerdown", startBackgroundMusic);
      window.removeEventListener("keydown", startBackgroundMusic);
      backgroundMusicRef.current = null;
      clickSoundRef.current = null;
      popSoundRef.current = null;
      footstepSoundRef.current = null;
      errorSoundRef.current = null;
      yaySoundRef.current = null;
    };
  }, []);

  const clearPlayback = useCallback(() => {
    for (const timeoutId of playbackTimeouts.current) {
      window.clearTimeout(timeoutId);
    }
    playbackTimeouts.current = [];
    stopAudio(footstepSoundRef.current);
  }, []);

  useEffect(() => clearPlayback, [clearPlayback]);

  const animateResult = useCallback((result: RunResult, nextProgress: KidsBlocklyProgressResponse) => {
    setRunResult(result);
    setProgress(nextProgress);

    if (result.steps.length === 0) {
      playAudio(errorSoundRef.current);
      setShowStatus(true);
      return;
    }

    setIsRunning(true);
    playAudio(footstepSoundRef.current);
    result.steps.forEach((step, index) => {
      const timeoutId = window.setTimeout(() => {
        setCharacter(step.state);
        setActiveBlockId(step.blockId);

        const isLast = index === result.steps.length - 1;
        if (!isLast) return;

        stopAudio(footstepSoundRef.current);
        setIsRunning(false);

        if (result.status === "success") {
          setLastStars(result.stars);
          window.setTimeout(() => {
            playAudio(yaySoundRef.current);
            setShowReward(true);
          }, 240);
          return;
        }

        window.setTimeout(() => {
          playAudio(errorSoundRef.current);
          setShowStatus(true);
        }, 240);
      }, index * 500);

      playbackTimeouts.current.push(timeoutId);
    });
  }, []);

  const handleProgramChange = useCallback((nextProgram: ProgramBlock[]) => {
    setProgram(nextProgram);
    setRunResult(null);
    setShowStatus(false);
  }, []);

  const handleBlockClick = useCallback(() => {
    playAudio(clickSoundRef.current);
  }, []);

  const handleBlockDrop = useCallback(() => {
    playAudio(popSoundRef.current);
  }, []);

  const resetProgram = useCallback(() => {
    if (!level) return;
    clearPlayback();
    setProgram([]);
    setRunResult(null);
    setCharacter(level.start);
    setActiveBlockId(null);
    setShowReward(false);
    setShowStatus(false);
    setIsRunning(false);
    setWorkspaceResetSignal((value) => value + 1);
  }, [clearPlayback, level]);

  const handleRun = useCallback(async () => {
    if (!level) return;

    clearPlayback();
    setCharacter(level.start);
    setRunResult(null);
    setActiveBlockId(null);
    setShowReward(false);
    setShowStatus(false);

    try {
      const response = await submitRun.mutateAsync({
        levelId: level.id,
        request: {
          program,
          clientRunId: `${level.id}-${Date.now()}`,
        },
      });
      animateResult(response.result, response.progress);
    } catch (error) {
      const fallbackResult: RunResult = {
        status: "incomplete",
        finalState: level.start,
        steps: [],
        message: getErrorMessage(error),
        stars: 0,
        isNewBest: false,
      };
      setRunResult(fallbackResult);
      playAudio(errorSoundRef.current);
      setShowStatus(true);
    }
  }, [animateResult, clearPlayback, level, program, submitRun]);

  const goNext = useCallback(() => {
    setShowReward(false);
    if (nextLevel) {
      setSelectedLevelId(nextLevel.id);
    }
  }, [nextLevel]);

  const busy = isRunning || submitRun.isPending;

  if (bootstrapQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7fffb_0%,#eef8ff_48%,#f8fafc_100%)] p-6">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          Đang tải Kids Blockly...
        </div>
      </div>
    );
  }

  if (bootstrapQuery.isError || !level || !character) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7fffb_0%,#eef8ff_48%,#f8fafc_100%)] p-6">
        <div className="max-w-md rounded-[28px] bg-white p-6 text-center shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">Không tải được Kids Blockly</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{getErrorMessage(bootstrapQuery.error)}</p>
          <Button
            onPress={() => bootstrapQuery.refetch()}
            className="mt-5 cursor-pointer rounded-2xl bg-emerald-500 px-5 py-3 text-white hover:bg-emerald-600"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fffb_0%,#eef8ff_48%,#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-400 flex-col gap-4 px-4 py-4 sm:px-5 lg:px-6">
        <header className="flex flex-col gap-3 rounded-[22px] border border-white/80 bg-white/85 px-5 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.07)] backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Kids Visual Coding</p>
            <h1 className="mt-1 truncate text-2xl font-black text-slate-900 md:text-3xl">
              Kéo khối lệnh để đưa nhân vật tới đích
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-emerald-50 px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">Màn</p>
                <p className="text-xl font-black text-slate-900">{levelIndex + 1}</p>
              </div>
              <div className="rounded-2xl bg-sky-50 px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">Đã mở</p>
                <p className="text-xl font-black text-slate-900">{progress.unlockedLevelIds.length}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600">Sao</p>
                <p className="text-xl font-black text-slate-900">{progress.totalStars}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void navigate({ to: "/kids-blockly/leaderboard" })}
              className="cursor-pointer flex shrink-0 items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <Trophy className="h-4 w-4" />
              Bảng xếp hạng
            </button>
            <button
              type="button"
              onClick={() => void startTour()}
              className="flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <BookOpen className="h-4 w-4" />
              Hướng dẫn
            </button>
          </div>
        </header>

        <main className="grid flex-1 items-stretch gap-4 lg:min-h-180 lg:grid-cols-[minmax(420px,0.92fr)_minmax(540px,1.08fr)]">
          <section className="relative min-h-130 flex flex-col gap-3" data-tour="gameboard">
            <GameBoard level={level} character={character} isRunning={busy} onHint={() => setShowHint(true)} />

            <RewardDialog
              open={showReward}
              stars={lastStars}
              message={runResult?.message ?? ""}
              onNext={goNext}
              onReplay={resetProgram}
              hasNextLevel={!!nextLevel}
            />
          </section>

          <section className="flex min-h-155 flex-col rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-[0_20px_44px_rgba(14,165,233,0.12)] backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Sân lập trình</p>
                <h2 className="mt-1 truncate text-xl font-bold text-slate-900">Kéo khối vào dưới cờ bắt đầu</h2>
              </div>
              <div
                data-tour="step-count"
                className="flex shrink-0 items-center gap-2 rounded-2xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700"
              >
                <Blocks className="h-4 w-4" />
                {program.length} bước
              </div>
            </div>

            <KidsBlocklyWorkspace
              allowedBlocks={level.allowedBlocks}
              isRunning={busy}
              activeBlockId={activeBlockId}
              resetSignal={workspaceResetSignal}
              className="flex-1"
              data-tour="workspace"
              onBlockClick={handleBlockClick}
              onBlockDrop={handleBlockDrop}
              onProgramChange={handleProgramChange}
            />

            <div className="mt-2 flex flex-wrap justify-center items-center gap-2">
              <Button
                data-tour="run-btn"
                onPress={handleRun}
                isDisabled={busy || program.length === 0}
                className="cursor-pointer rounded-2xl text-md bg-emerald-500 p-5 text-white hover:bg-emerald-700 disabled:bg-slate-400"
              >
                {submitRun.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Chạy
              </Button>
              <Button
                data-tour="clear-btn"
                onPress={resetProgram}
                isDisabled={busy}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-md text-slate-700 hover:bg-slate-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa hết
              </Button>
            </div>
          </section>
        </main>

        <footer className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_38px_rgba(15,23,42,0.07)] backdrop-blur-md">
          <div data-tour="level-grid" className="grid gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
            {levels.map((item, index) => {
              const unlocked = progress.unlockedLevelIds.includes(item.id) || index === 0;
              const stars = progress.starsByLevel[item.id] ?? 0;
              const selected = item.id === level.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!unlocked || busy}
                  onClick={() => setSelectedLevelId(item.id)}
                  className={cn(
                    "cursor-pointer min-h-16 rounded-2xl border px-3 py-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45",
                    selected
                      ? "border-emerald-300 bg-emerald-50 shadow-[0_10px_20px_rgba(16,185,129,0.12)]"
                      : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50",
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Màn {index + 1}
                  </p>
                  <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
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

      <BlocklyInfoDialog open={showHint} title="Gợi ý" description={level.hint} onClose={() => setShowHint(false)} />
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
