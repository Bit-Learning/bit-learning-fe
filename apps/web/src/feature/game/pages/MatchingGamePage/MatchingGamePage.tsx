import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GAME_DATA, type GameData, type TopicCode } from "@/feature/game/data";
import { AudioToggle } from "@/feature/game/components/AudioToggle";
import { ThemeToggle } from "@/feature/game/components/ThemeToggle";
import { useAudio } from "@/feature/game/contexts/AudioProvider";
import gameService from "@/feature/game/services/gameService";
import matchingGameService from "@/feature/game/services/matchingGameService";
import { Route } from "@/routes/matching/game";
import PageMeta from "@/shared/components/seo/page-meta";
import MatchingGamePlayer, {
	type MatchingGameResultSummary,
} from "@/feature/game/components/MatchingGamePlayer";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const getMatchingGameLoadErrorMessage = ({
	error,
	gameId,
}: {
	error: unknown;
	gameId?: number;
}) => {
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof error.response === "object" &&
		error.response !== null
	) {
		const response = error.response as {
			status?: number;
			data?: { message?: string };
		};

		if (response.status === 403) {
			return "Matching game này chưa được xuất bản hoặc bạn không có quyền xem.";
		}

		if (response.status === 404) {
			return gameId !== undefined
				? "Matching game này chưa được xuất bản hoặc không còn tồn tại."
				: "Không tìm thấy matching game cho lớp và chủ đề này.";
		}

		if (typeof response.data?.message === "string") {
			return response.data.message;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return "Không thể tải matching game này.";
};

export default function MatchingGamePage() {
	const navigate = useNavigate();
	const { playSound, stopSound } = useAudio();
	const { gameId, grade, topic } = Route.useSearch();
	const [gameData, setGameData] = useState<GameData>(GAME_DATA);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (gameId === undefined && (grade === undefined || topic === undefined)) {
			setLoading(false);
			setError("Liên kết matching game không hợp lệ.");
			return;
		}

		let isMounted = true;
		setLoading(true);
		setError(null);

		matchingGameService
			.getGame({ gameId, grade, topic })
			.then((data) => {
				if (!isMounted) return;
				setGameData(data);
			})
			.catch((requestError: unknown) => {
				if (!isMounted) return;
				setError(
					getMatchingGameLoadErrorMessage({
						error: requestError,
						gameId,
					}),
				);
			})
			.finally(() => {
				if (!isMounted) return;
				setLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [gameId, grade, topic]);

	useEffect(() => {
		stopSound("game-background-music");
		return () => {
			playSound("game-background-music", { loop: true });
		};
	}, [playSound, stopSound]);

	const handleComplete = (summary: MatchingGameResultSummary) => {
		const resolvedGrade = summary.grade ?? grade;
		const resolvedTopic = (summary.topic as TopicCode | undefined) ?? topic;

		if (summary.gameId) {
			void gameService.submitAttempt(summary.gameId, {
				attemptType: "MATCHING",
				rawScore: summary.correct,
				maxRawScore: summary.total,
				duration: summary.time,
				completed: true,
				resultMetrics: {
					correctCount: summary.correct,
					totalCount: summary.total,
					mistakes: summary.mistakes,
					completedStages: summary.completedStages,
					stageCount: summary.stageCount,
					grade: resolvedGrade,
					topicLetter: resolvedTopic,
					topicName: resolvedTopic ? `Chủ đề ${resolvedTopic}` : null,
				},
			});
		}

		navigate({
			to: "/matching/dashboard",
			search: {
				correct: summary.correct,
				total: summary.total,
				time: summary.time,
				title: summary.title,
				gameId: summary.gameId ?? gameId,
				grade: resolvedGrade,
				topic: resolvedTopic,
			},
		});
	};

	if (loading) {
		return <Loader />;
	}

	if (error) {
		return (
			<div className="bg-background-light text-slate-900 min-h-screen">
				<PageMeta title="Không thể mở matching game" description={error} />
				<div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
					<div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
							<span className="material-symbols-outlined text-3xl">
								warning
							</span>
						</div>
						<h1 className="text-2xl font-bold tracking-tight">
							Không thể mở matching game
						</h1>
						<p className="mt-3 text-sm text-slate-600">{error}</p>
						<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
							<button
								type="button"
								onClick={() => navigate({ to: "/matching/path" })}
								className="rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
							>
								Quay lại chọn bài học
							</button>
							<button
								type="button"
								onClick={() => window.history.back()}
								className="rounded-xl border border-slate-200 px-6 py-3 font-bold transition-colors hover:bg-slate-50"
							>
								Quay lại trang trước
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<PageMeta
				title={gameData.meta.title}
				description="Trải nghiệm trò chơi ghép cặp giúp học sinh rèn luyện kiến thức và phản xạ trên Bit Learning."
			/>
			<MatchingGamePlayer
				gameData={gameData}
				onExit={() => navigate({ to: "/matching/path" })}
				onComplete={handleComplete}
				onPlaySound={playSound}
				headerActions={
					<>
						<AudioToggle />
						<ThemeToggle />
					</>
				}
				exitLabel="Quay lại chọn bài học"
			/>
		</>
	);
}
