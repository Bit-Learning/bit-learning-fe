import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import type { Game } from "../services/gameService";
import gameService from "../services/gameService";
import { toast } from "@/shared/components/Sonner";
import { getAccessToken } from "@/shared/lib/cookies";

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

type IncomingGameMessage = {
	source?: string;
	type?: string;
	rawScore?: unknown;
	maxRawScore?: unknown;
	duration?: unknown;
	completed?: unknown;
	metrics?: Record<string, unknown> | null;
	attemptType?: unknown;
	score?: unknown;
};

const BRIDGE_SOURCE = "BIT_LEARNING_GAME";
const LOG_PREFIX = "[GamePlayPage]";

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
	const gameOriginRef = useRef<string | null>(null);

	const logInfo = useCallback((message: string, details?: unknown) => {
		if (details !== undefined) {
			console.info(LOG_PREFIX, message, details);
			return;
		}
		console.info(LOG_PREFIX, message);
	}, []);

	const logWarn = useCallback((message: string, details?: unknown) => {
		if (details !== undefined) {
			console.warn(LOG_PREFIX, message, details);
			return;
		}
		console.warn(LOG_PREFIX, message);
	}, []);

	useEffect(() => {
		loadGame();
		startTimeRef.current = Date.now();
		trackedRef.current = false;
		latestProgressRef.current = null;
		setTracked(false);
	}, [id]);

	useEffect(() => {
		if (!game?.playUrl) {
			gameOriginRef.current = null;
			return;
		}

		try {
			gameOriginRef.current = new URL(
				game.playUrl,
				window.location.href,
			).origin;
			logInfo("Resolved game origin", {
				playUrl: game.playUrl,
				origin: gameOriginRef.current,
			});
		} catch (error) {
			console.warn("Failed to resolve game origin", error);
			gameOriginRef.current = null;
		}
	}, [game?.playUrl, logInfo]);

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
			const accessToken = getAccessToken();
			if (!accessToken) {
				logWarn("trackResult skipped because access token is missing");
				return;
			}
			if (trackedRef.current) {
				logInfo("trackResult skipped because result was already tracked");
				return;
			}
			trackedRef.current = true;
			setTracked(true);
			const elapsed =
				("duration" in payload ? payload.duration : undefined) ??
				Math.round((Date.now() - startTimeRef.current) / 1000);
			logInfo("Submitting game result", {
				gameId: id,
				elapsed,
				payload,
			});
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
				logInfo("Game result saved successfully", {
					gameId: id,
					elapsed,
				});
				toast.success({
					title: "Kết quả đã được ghi nhận",
					description: `Thời gian: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
				});
			} catch (e) {
				console.error("Tracking error", e);
				logWarn("Game result submit failed", e);
				trackedRef.current = false;
				setTracked(false);
			}
		},
		[id, logInfo, logWarn],
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
			const accessToken = getAccessToken();
			if (!accessToken) {
				logWarn(
					"submitPartialAttempt skipped because access token is missing",
					{
						reason,
					},
				);
				return false;
			}
			if (trackedRef.current) {
				logInfo(
					"submitPartialAttempt skipped because result was already tracked",
					{
						reason,
					},
				);
				return false;
			}

			const progress = latestProgressRef.current;
			const totalCount =
				typeof progress?.resultMetrics?.totalCount === "number"
					? progress.resultMetrics.totalCount
					: (progress?.maxRawScore ?? 0);

			if (!progress || totalCount <= 0) {
				logWarn("submitPartialAttempt skipped because progress is empty", {
					reason,
					totalCount,
					hasProgress: !!progress,
				});
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

			const apiBaseUrl = new URL(
				import.meta.env.VITE_API_BASE_URL ?? "/api/",
				window.location.href,
			);
			const url = new URL(`games/${id}/attempts`, apiBaseUrl).toString();
			const body = JSON.stringify(payload);
			trackedRef.current = true;
			setTracked(true);
			logInfo("Submitting partial attempt", {
				gameId: id,
				reason,
				url,
				payload,
			});

			if (
				navigator.sendBeacon &&
				new URL(url).origin === window.location.origin
			) {
				const success = navigator.sendBeacon(
					url,
					new Blob([body], { type: "application/json" }),
				);
				if (success) {
					logInfo("Partial attempt sent via sendBeacon", {
						gameId: id,
						reason,
					});
					return true;
				}
				logWarn("sendBeacon returned false, falling back to fetch", {
					gameId: id,
					reason,
				});
			}

			void fetch(url, {
				method: "POST",
				body,
				headers: {
					"Content-Type": "application/json",
					...(accessToken
						? {
								Authorization: `Bearer ${accessToken}`,
							}
						: {}),
				},
				credentials: "include",
				keepalive: true,
			})
				.then((response) => {
					logInfo("Partial attempt fetch completed", {
						gameId: id,
						reason,
						status: response.status,
						ok: response.ok,
					});
				})
				.catch((error) => {
					logWarn("Partial attempt fetch failed", {
						gameId: id,
						reason,
						error,
					});
					trackedRef.current = false;
					setTracked(false);
				});
			return true;
		},
		[id, logInfo, logWarn],
	);

	const parseIncomingMessage = useCallback(
		(rawData: unknown): IncomingGameMessage | null => {
			if (!rawData) return null;
			if (typeof rawData === "string") {
				try {
					const parsed = JSON.parse(rawData);
					return parsed && typeof parsed === "object"
						? (parsed as IncomingGameMessage)
						: null;
				} catch {
					return null;
				}
			}
			return typeof rawData === "object"
				? (rawData as IncomingGameMessage)
				: null;
		},
		[],
	);

	const isMessageFromCurrentGame = useCallback(
		(event: MessageEvent, data: IncomingGameMessage | null) => {
			if (!data?.type) return false;

			const hasKnownType =
				data.type === "GAME_PROGRESS" ||
				data.type === "GAME_RESULT" ||
				data.type === "GAME_OVER";
			if (!hasKnownType) {
				return false;
			}

			const iframeWindow = gameContainerRef.current?.contentWindow;
			if (iframeWindow && event.source === iframeWindow) {
				return true;
			}

			if (data.source === BRIDGE_SOURCE) {
				const gameOrigin = gameOriginRef.current;
				if (!gameOrigin || event.origin === gameOrigin) {
					return true;
				}
			}

			return false;
		},
		[],
	);

	const notifyGameHostReady = useCallback(() => {
		const iframeWindow = gameContainerRef.current?.contentWindow;
		if (!iframeWindow) return;

		try {
			logInfo("Sending BITLEARNING_HOST_READY to iframe");
			iframeWindow.postMessage({ type: "BITLEARNING_HOST_READY" }, "*");
		} catch (error) {
			console.warn("Failed to notify iframe host readiness", error);
		}
	}, [logInfo]);

	// Listen for postMessage from the game iframe
	// Games should send: { type: "GAME_OVER", score: number, duration?: number }
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const data = parseIncomingMessage(event.data);
			logInfo("window.message received", {
				origin: event.origin,
				sourceMatchesIframe:
					event.source === gameContainerRef.current?.contentWindow,
				type: data?.type,
				source: data?.source,
			});
			if (!isMessageFromCurrentGame(event, data)) {
				logInfo(
					"Ignored window.message because it does not match current game",
				);
				return;
			}

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
				logInfo("Stored latest GAME_PROGRESS payload", payload);
				return;
			}

			if (data && data.type === "GAME_RESULT") {
				logInfo("Received GAME_RESULT payload", data);
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
				logInfo("Received legacy GAME_OVER payload", data);
				trackResult({
					score: data.score,
					duration:
						typeof data.duration === "number" ? data.duration : undefined,
				});
			}
		};
		window.addEventListener("message", handleMessage);
		logInfo("Registered window.message listener for game tracking");
		return () => window.removeEventListener("message", handleMessage);
	}, [
		buildAttemptPayload,
		isMessageFromCurrentGame,
		logInfo,
		parseIncomingMessage,
		trackResult,
	]);

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
			logInfo("Loaded game metadata", {
				gameId: gameData.id,
				title: gameData.title,
				playUrl: gameData.playUrl,
			});
		} catch (e) {
			console.error("Failed to load game", e);
			logWarn("Failed to load game metadata", e);
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		logInfo("Back button clicked, attempting partial submit");
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

	let gameUrl = game.playUrl;
	try {
		const gameUrlObject = new URL(game.playUrl, window.location.href);
		gameUrlObject.searchParams.set("gameId", String(game.id));
		if (username) {
			gameUrlObject.searchParams.set("userId", username);
		}
		gameUrl = gameUrlObject.toString();
	} catch (error) {
		console.warn("Failed to append tracking params to game URL", error);
	}

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
					onLoad={notifyGameHostReady}
				/>
			</div>
		</div>
	);
}
