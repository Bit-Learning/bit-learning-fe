import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import MatchingGamePlayer, {
	type MatchingGamePlayerData,
} from "@workspace/ui/components/MatchingGamePlayer";
import type { MatchingGameFullDto } from "../api/admin-matching-game.api";
import { useMatchingGameDetail } from "../queries/useAdminMatchingGame";

type MatchingGamePreviewPageProps = {
	gameId?: number;
	grade?: number;
	topicCode?: string;
};

const getErrorMessage = (error: unknown) => {
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof error.response === "object" &&
		error.response !== null &&
		"data" in error.response &&
		typeof error.response.data === "object" &&
		error.response.data !== null &&
		"message" in error.response.data &&
		typeof error.response.data.message === "string"
	) {
		return error.response.data.message;
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return "Không thể tải preview matching game.";
};

const toPlayerData = (dto: MatchingGameFullDto): MatchingGamePlayerData => ({
	meta: {
		gameId: dto.meta.gameId,
		grade: dto.meta.grade,
		topicCode: dto.meta.topicCode,
		title: dto.meta.title,
		version: dto.meta.version,
		language: dto.meta.language,
		baseScoreMax: dto.meta.baseScoreMax,
		difficultyMultiplier: dto.meta.difficultyMultiplier,
		passingThreshold: dto.meta.passingThreshold,
	},
	stages: dto.stages.map((stage, stageIndex) => ({
		id: stage.id || `stage-${stageIndex + 1}`,
		title: stage.title,
		description: stage.description,
		config: {
			shuffle: stage.config?.shuffle,
			timeLimit: stage.config?.timeLimit,
			maxMistakes: stage.config?.maxMistakes,
			showHints: stage.config?.showHints,
			layoutType:
				stage.config?.layoutType === "media-quiz" ? "media-quiz" : "match",
		},
		pairs: stage.pairs.map((pair, pairIndex) => ({
			id: pair.id || `pair-${stageIndex + 1}-${pairIndex + 1}`,
			left: {
				type: pair.left.type,
				value: pair.left.value,
				alt: pair.left.alt,
			},
			right: {
				type: pair.right.type,
				value: pair.right.value,
				alt: pair.right.alt,
			},
			hint: pair.hint,
		})),
	})),
});

export function MatchingGamePreviewPage({
	gameId,
	grade,
	topicCode,
}: MatchingGamePreviewPageProps) {
	const navigate = useNavigate();
	const canLoad =
		gameId !== undefined || (grade !== undefined && Boolean(topicCode));
	const { data, isLoading, error } = useMatchingGameDetail(
		{
			gameId,
			grade,
			topicCode,
		},
		canLoad,
	);

	const backToEditor = () =>
		navigate({
			to: "/apps/games/matching",
			search: {
				gameId,
				grade,
				topic: topicCode,
			},
		});

	const playerData = useMemo(() => (data ? toPlayerData(data) : null), [data]);

	if (!canLoad) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-6">
				<div className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
					<h1 className="text-2xl font-bold tracking-tight">
						Thiếu thông tin preview
					</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						Cần có `gameId` hoặc cặp `grade/topic` để mở matching game.
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/apps/games" })}
						className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
					>
						Quay lại danh sách game
					</button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
				<Loader2 className="h-5 w-5 animate-spin" />
				Đang tải preview matching game...
			</div>
		);
	}

	if (error || !playerData) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-6">
				<div className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
					<h1 className="text-2xl font-bold tracking-tight">
						Không thể mở preview
					</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						{getErrorMessage(error)}
					</p>
					<button
						type="button"
						onClick={backToEditor}
						className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
					>
						Quay lại editor
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="-m-6">
			<MatchingGamePlayer
				gameData={playerData}
				onExit={backToEditor}
				headerActions={
					<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
						Preview nội bộ
					</span>
				}
				footerNote="Preview nội bộ dành cho quản trị viên"
				exitLabel="Quay lại editor"
			/>
		</div>
	);
}
