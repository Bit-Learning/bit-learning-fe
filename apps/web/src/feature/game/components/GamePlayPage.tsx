import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import type { Game } from "../services/gameService";
import gameService from "../services/gameService";
import { toast } from "@/shared/components/Sonner";

interface GamePlayPageProps {
	id: number;
}

interface AttemptPayload {
	rawScore?: number;
	maxRawScore?: number;
	duration?: number;
	completed?: boolean;
	resultMetrics?: Record<string, unknown>;
	attemptType?: string;
}

interface LegacyPayload {
	score: number;
	duration?: number;
}

export default function GamePlayPage({ id }: GamePlayPageProps) {
	const navigate = useNavigate();
	const auth = useSelector((state: RootState) => state.auth);
	const username = auth.userInfo?.username ?? null;

	const [game, setGame] = useState<Game | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [tracked, setTracked] = useState(false);
	const gameContainerRef = useRef<HTMLIFrameElement>(null);
	const startTimeRef = useRef<number>(Date.now());
	const trackedRef = useRef(false);
	const latestProgressRef = useRef<AttemptPayload | null>(null);

	useEffect(() => {
		loadGame();
		startTimeRef.current = Date.now();
	}, [id]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	const trackResult = useCallback(
		async (payload: AttemptPayload | LegacyPayload) => {
			if (!username || trackedRef.current) return;
			trackedRef.current = true;
			setTracked(true);
			const elapsed =
				("duration" in payload ? payload.duration : undefined) ??
				Math.round((Date.now() - startTimeRef.current) / 1000);
			try {
				if ("score" in payload) {
					await gameService.submitAttempt(id, {
						attemptType: "LEGACY_STANDARD",
						rawScore: payload.score,
						maxRawScore: 100,
						duration: elapsed,
						completed: payload.score > 0,
					});
				} else {
					await gameService.submitAttempt(id, {
						attemptType: payload.attemptType ?? "STANDARD_HTML",
						rawScore: payload.rawScore ?? 0,
						maxRawScore: payload.maxRawScore ?? 100,
						duration: elapsed,
						completed: payload.completed ?? true,
						resultMetrics: payload.resultMetrics,
					});
				}
				latestProgressRef.current = null;
				toast.success({
					title: "Kết quả đã được ghi nhận",
					description: `Thời gian: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
				});
			} catch (e) {
				console.error("Tracking error", e);
				trackedRef.current = false;
				setTracked(false);
			}
		},
		[id, username],
	);

	const buildAttemptPayload = useCallback(
		(data: {
			rawScore?: number;
			maxRawScore?: number;
			duration?: number;
			completed?: boolean;
			metrics?: Record<string, unknown>;
			attemptType?: string;
		}): AttemptPayload => ({
			rawScore: data.rawScore ?? 0,
			maxRawScore: data.maxRawScore ?? 0,
			duration: data.duration,
			completed: data.completed,
			resultMetrics: data.metrics,
			attemptType: data.attemptType ?? "STANDARD_HTML",
		}),
		[],
	);

	const submitPartialAttempt = useCallback(
		(reason: "BACK" | "BEFORE_UNLOAD" | "PAGE_HIDE") => {
			if (!username || trackedRef.current) return false;

			const progress = latestProgressRef.current;
			const totalCount =
				typeof progress?.resultMetrics?.totalCount === "number"
					? progress.resultMetrics.totalCount
					: (progress?.maxRawScore ?? 0);

			if (!progress || totalCount <= 0) {
				return false;
			}

			const payload = {
				attemptType: progress.attemptType ?? "STANDARD_HTML",
				rawScore: progress.rawScore ?? 0,
				maxRawScore: Math.max(
					progress.maxRawScore ?? totalCount,
					totalCount,
					1,
				),
				duration:
					progress.duration ??
					Math.round((Date.now() - startTimeRef.current) / 1000),
				completed: false,
				resultMetrics: {
					...(progress.resultMetrics ?? {}),
					attemptState: "PARTIAL",
					exitReason: reason,
				},
			};

			const url = `/api/games/${id}/attempts`;
			const body = JSON.stringify(payload);
			trackedRef.current = true;
			setTracked(true);

			if (navigator.sendBeacon) {
				const success = navigator.sendBeacon(
					url,
					new Blob([body], { type: "application/json" }),
				);
				if (success) {
					return true;
				}
			}

			void fetch(url, {
				method: "POST",
				body,
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				keepalive: true,
			});
			return true;
		},
		[id, username],
	);

	// Listen for postMessage from the game iframe
	// Games should send: { type: "GAME_OVER", score: number, duration?: number }
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.source !== gameContainerRef.current?.contentWindow) {
				return;
			}

			const data = event.data;
			if (data && data.type === "GAME_PROGRESS") {
				const payload = buildAttemptPayload({
					rawScore:
						typeof data.rawScore === "number" ? data.rawScore : undefined,
					maxRawScore:
						typeof data.maxRawScore === "number" ? data.maxRawScore : undefined,
					duration:
						typeof data.duration === "number" ? data.duration : undefined,
					completed: false,
					metrics:
						typeof data.metrics === "object" && data.metrics !== null
							? data.metrics
							: undefined,
					attemptType:
						typeof data.attemptType === "string"
							? data.attemptType
							: "STANDARD_HTML",
				});

				latestProgressRef.current = payload;
				return;
			}

			if (data && data.type === "GAME_RESULT") {
				trackResult(
					buildAttemptPayload({
						rawScore:
							typeof data.rawScore === "number" ? data.rawScore : undefined,
						maxRawScore:
							typeof data.maxRawScore === "number"
								? data.maxRawScore
								: undefined,
						duration:
							typeof data.duration === "number" ? data.duration : undefined,
						completed: data.completed !== false,
						metrics:
							typeof data.metrics === "object" && data.metrics !== null
								? data.metrics
								: undefined,
						attemptType:
							typeof data.attemptType === "string"
								? data.attemptType
								: "STANDARD_HTML",
					}),
				);
			}
			if (data && data.type === "GAME_OVER" && typeof data.score === "number") {
				trackResult({ score: data.score, duration: data.duration });
			}
		};
		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [buildAttemptPayload, trackResult]);

	// Track partial attempts on page leave. We only persist once the iframe has sent usable progress.
	useEffect(() => {
		const handleBeforeUnload = () => {
			submitPartialAttempt("BEFORE_UNLOAD");
		};
		const handlePageHide = () => {
			submitPartialAttempt("PAGE_HIDE");
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		window.addEventListener("pagehide", handlePageHide);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("pagehide", handlePageHide);
		};
	}, [submitPartialAttempt]);

	const loadGame = async () => {
		try {
			setLoading(true);
			const gameData = await gameService.getGameById(id);
			setGame(gameData);
		} catch (e) {
			console.error("Failed to load game", e);
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		submitPartialAttempt("BACK");
		navigate({ to: "/games/$id", params: { id: String(id) } });
	};

	const toggleFullscreen = () => {
		if (!gameContainerRef.current) return;
		if (!document.fullscreenElement) {
			gameContainerRef.current.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	};

	if (loading) {
		return (
			<div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
				<div className="text-white text-2xl">Loading game...</div>
			</div>
		);
	}

	if (!game) {
		return (
			<div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
				<div className="text-center text-white">
					<div className="text-6xl mb-6">🎮</div>
					<p className="text-2xl font-bold text-gray-400 mb-2">
						Game not found
					</p>
					<button
						onClick={() => navigate({ to: "/games" })}
						className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors"
					>
						← Back to Games
					</button>
				</div>
			</div>
		);
	}

	const gameUrl = `${game.playUrl}?gameId=${game.id}&userId=${encodeURIComponent(username || "")}`;

	return (
		<div className="fixed inset-0 z-50 bg-black flex flex-col">
			<div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
				<div className="flex items-center gap-4">
					<button
						onClick={handleBack}
						className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
					>
						← Back
					</button>
					<h2 className="font-bold text-lg">{game.title}</h2>
					{!username && (
						<span className="text-yellow-500 text-sm">
							⚠️ Not logged in - game progress won't be tracked
						</span>
					)}
					{tracked && (
						<span className="text-emerald-400 text-sm">
							✅ Kết quả đã ghi nhận
						</span>
					)}
				</div>
				<button
					onClick={toggleFullscreen}
					className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors"
				>
					{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
				</button>
			</div>
			<div className="flex-1 relative">
				<iframe
					ref={gameContainerRef}
					src={gameUrl}
					className="w-full h-full border-none"
					title="Game Play"
				/>
			</div>
		</div>
	);
}
