import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "../services/gameService";
import gameService from "../services/gameService";
import { toast } from "@/shared/components/Sonner";
import { getAccessToken } from "@/shared/lib/cookies";

interface AttemptPayload {
	rawScore?: number;
	maxRawScore?: number;
	duration?: number;
	completed?: boolean;
	resultMetrics?: Record<string, unknown>;
	attemptType?: string;
	scoringModel?: "FINITE_SCORE" | "HIGH_SCORE" | "NO_SCORE";
	attemptState?: "PARTIAL" | "COMPLETED";
	metricsVersion?: number;
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
	scoringModel?: unknown;
	attemptState?: unknown;
	metricsVersion?: unknown;
	score?: unknown;
};

interface TrackedGameFrameProps {
	game: Game;
	username: string | null;
	variant?: "embedded" | "page";
	onBack?: () => void;
	className?: string;
	iframeClassName?: string;
}

const BRIDGE_SOURCE = "BIT_LEARNING_GAME";

export default function TrackedGameFrame({
	game,
	username,
	variant = "embedded",
	onBack,
	className = "",
	iframeClassName = "h-full w-full border-none",
}: TrackedGameFrameProps) {
	const logPrefix =
		variant === "page"
			? "[TrackedGameFrame:page]"
			: "[TrackedGameFrame:inline]";
	const [tracked, setTracked] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const startTimeRef = useRef<number>(Date.now());
	const trackedRef = useRef(false);
	const latestProgressRef = useRef<AttemptPayload | null>(null);
	const gameOriginRef = useRef<string | null>(null);

	const logInfo = useCallback(
		(message: string, details?: unknown) => {
			if (details !== undefined) {
				console.info(logPrefix, message, details);
				return;
			}
			console.info(logPrefix, message);
		},
		[logPrefix],
	);

	const logWarn = useCallback(
		(message: string, details?: unknown) => {
			if (details !== undefined) {
				console.warn(logPrefix, message, details);
				return;
			}
			console.warn(logPrefix, message);
		},
		[logPrefix],
	);

	const logAttemptEvent = useCallback(
		(
			stage:
				| "ATTEMPT_PROGRESS_STORED"
				| "ATTEMPT_PARTIAL_SUBMIT_START"
				| "ATTEMPT_PARTIAL_SUBMIT_SUCCESS"
				| "ATTEMPT_PARTIAL_SUBMIT_FAILURE"
				| "ATTEMPT_RESULT_SUBMIT_START"
				| "ATTEMPT_RESULT_SUBMIT_SUCCESS"
				| "ATTEMPT_RESULT_SUBMIT_FAILURE"
				| "ATTEMPT_SUBMIT_SKIPPED",
			details?: unknown,
		) => {
			logInfo(stage, details);
		},
		[logInfo],
	);

	useEffect(() => {
		startTimeRef.current = Date.now();
		trackedRef.current = false;
		latestProgressRef.current = null;
		setTracked(false);
	}, [game.id]);

	useEffect(() => {
		try {
			gameOriginRef.current = new URL(
				game.playUrl,
				window.location.href,
			).origin;
			logInfo("Resolved game origin", {
				gameId: game.id,
				playUrl: game.playUrl,
				origin: gameOriginRef.current,
			});
		} catch (error) {
			gameOriginRef.current = null;
			logWarn("Failed to resolve game origin", error);
		}
	}, [game.id, game.playUrl, logInfo, logWarn]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			const fullscreenElement = document.fullscreenElement;
			setIsFullscreen(
				Boolean(
					fullscreenElement &&
						containerRef.current &&
						containerRef.current.contains(fullscreenElement),
				) || fullscreenElement === containerRef.current,
			);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	const buildAttemptPayload = useCallback(
		(data: {
			rawScore?: number;
			maxRawScore?: number;
			duration?: number;
			completed?: boolean;
			metrics?: Record<string, unknown>;
			attemptType?: string;
			scoringModel?: "FINITE_SCORE" | "HIGH_SCORE" | "NO_SCORE";
			attemptState?: "PARTIAL" | "COMPLETED";
			metricsVersion?: number;
		}): AttemptPayload => ({
			rawScore: data.rawScore ?? 0,
			maxRawScore: data.maxRawScore,
			duration: data.duration,
			completed: data.completed,
			resultMetrics: data.metrics,
			attemptType: data.attemptType ?? "STANDARD_HTML",
			scoringModel: data.scoringModel ?? game.scoringModel,
			attemptState:
				data.attemptState ??
				(data.completed === false ? "PARTIAL" : "COMPLETED"),
			metricsVersion: data.metricsVersion ?? 1,
		}),
		[game.scoringModel],
	);

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
				gameId: game.id,
				elapsed,
				payload,
			});
			logAttemptEvent("ATTEMPT_RESULT_SUBMIT_START", {
				gameId: game.id,
				attemptState:
					"score" in payload ? "LEGACY" : (payload.attemptState ?? "COMPLETED"),
				scoringModel:
					"score" in payload
						? "LEGACY"
						: (payload.scoringModel ?? game.scoringModel),
				elapsed,
				payload,
			});

			try {
				if ("score" in payload) {
					await gameService.submitAttempt(game.id, {
						attemptType: "LEGACY_STANDARD",
						rawScore: payload.score,
						maxRawScore: 100,
						duration: elapsed,
						completed: payload.score > 0,
					});
				} else {
					await gameService.submitAttempt(game.id, {
						attemptType: payload.attemptType ?? "STANDARD_HTML",
						scoringModel: payload.scoringModel,
						attemptState: payload.attemptState ?? "COMPLETED",
						rawScore: payload.rawScore ?? 0,
						maxRawScore: payload.maxRawScore,
						duration: elapsed,
						completed: payload.completed ?? true,
						metricsVersion: payload.metricsVersion ?? 1,
						resultMetrics: payload.resultMetrics,
					});
				}

				latestProgressRef.current = null;
				logInfo("Game result saved successfully", {
					gameId: game.id,
					elapsed,
				});
				logAttemptEvent("ATTEMPT_RESULT_SUBMIT_SUCCESS", {
					gameId: game.id,
					elapsed,
					tracked: true,
				});
				toast.success({
					title: "Kết quả đã được ghi nhận",
					description: `Thời lượng: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
				});
			} catch (error) {
				console.error("Tracking error", error);
				logWarn("Game result submit failed", error);
				logAttemptEvent("ATTEMPT_RESULT_SUBMIT_FAILURE", {
					gameId: game.id,
					error,
				});
				trackedRef.current = false;
				setTracked(false);
			}
		},
		[game.id, game.scoringModel, logAttemptEvent, logInfo, logWarn],
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
				logAttemptEvent("ATTEMPT_SUBMIT_SKIPPED", {
					gameId: game.id,
					kind: "PARTIAL",
					reason,
					skipReason: "MISSING_ACCESS_TOKEN",
				});
				return false;
			}
			if (trackedRef.current) {
				logInfo(
					"submitPartialAttempt skipped because result was already tracked",
					{ reason },
				);
				logAttemptEvent("ATTEMPT_SUBMIT_SKIPPED", {
					gameId: game.id,
					kind: "PARTIAL",
					reason,
					skipReason: "ALREADY_TRACKED",
				});
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
				logAttemptEvent("ATTEMPT_SUBMIT_SKIPPED", {
					gameId: game.id,
					kind: "PARTIAL",
					reason,
					skipReason: "EMPTY_PROGRESS",
					totalCount,
					hasProgress: !!progress,
				});
				return false;
			}

			const payload = {
				attemptType: progress.attemptType ?? "STANDARD_HTML",
				scoringModel: progress.scoringModel ?? game.scoringModel,
				attemptState: "PARTIAL" as const,
				rawScore: progress.rawScore ?? 0,
				maxRawScore:
					progress.scoringModel === "HIGH_SCORE" ||
					progress.scoringModel === "NO_SCORE"
						? (progress.maxRawScore ?? null)
						: Math.max(progress.maxRawScore ?? totalCount, totalCount, 1),
				duration:
					progress.duration ??
					Math.round((Date.now() - startTimeRef.current) / 1000),
				completed: false,
				metricsVersion: progress.metricsVersion ?? 1,
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
			const url = new URL(`games/${game.id}/attempts`, apiBaseUrl).toString();
			const body = JSON.stringify(payload);

			trackedRef.current = true;
			setTracked(true);

			logInfo("Submitting partial attempt", {
				gameId: game.id,
				reason,
				url,
				payload,
			});
			logAttemptEvent("ATTEMPT_PARTIAL_SUBMIT_START", {
				gameId: game.id,
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
						gameId: game.id,
						reason,
					});
					logAttemptEvent("ATTEMPT_PARTIAL_SUBMIT_SUCCESS", {
						gameId: game.id,
						reason,
						method: "sendBeacon",
					});
					return true;
				}
				logWarn("sendBeacon returned false, falling back to fetch", {
					gameId: game.id,
					reason,
				});
			}

			void fetch(url, {
				method: "POST",
				body,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				credentials: "include",
				keepalive: true,
			})
				.then((response) => {
					logInfo("Partial attempt fetch completed", {
						gameId: game.id,
						reason,
						status: response.status,
						ok: response.ok,
					});
					if (response.ok) {
						logAttemptEvent("ATTEMPT_PARTIAL_SUBMIT_SUCCESS", {
							gameId: game.id,
							reason,
							method: "fetch",
							status: response.status,
						});
						return;
					}
					logAttemptEvent("ATTEMPT_PARTIAL_SUBMIT_FAILURE", {
						gameId: game.id,
						reason,
						method: "fetch",
						status: response.status,
						ok: response.ok,
					});
					trackedRef.current = false;
					setTracked(false);
				})
				.catch((error) => {
					logWarn("Partial attempt fetch failed", {
						gameId: game.id,
						reason,
						error,
					});
					logAttemptEvent("ATTEMPT_PARTIAL_SUBMIT_FAILURE", {
						gameId: game.id,
						reason,
						method: "fetch",
						error,
					});
					trackedRef.current = false;
					setTracked(false);
				});

			return true;
		},
		[game.id, game.scoringModel, logAttemptEvent, logInfo, logWarn],
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

			if (
				iframeRef.current?.contentWindow &&
				event.source === iframeRef.current.contentWindow
			) {
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
		const iframeWindow = iframeRef.current?.contentWindow;
		if (!iframeWindow) return;

		try {
			logInfo("Sending BITLEARNING_HOST_READY to iframe");
			iframeWindow.postMessage({ type: "BITLEARNING_HOST_READY" }, "*");
		} catch (error) {
			logWarn("Failed to notify iframe host readiness", error);
		}
	}, [logInfo, logWarn]);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const data = parseIncomingMessage(event.data);
			logInfo("window.message received", {
				gameId: game.id,
				origin: event.origin,
				sourceMatchesIframe: event.source === iframeRef.current?.contentWindow,
				type: data?.type,
				source: data?.source,
			});

			if (!isMessageFromCurrentGame(event, data)) {
				logInfo(
					"Ignored window.message because it does not match current game",
				);
				return;
			}

			if (data?.type === "GAME_PROGRESS") {
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
					scoringModel:
						typeof data.scoringModel === "string"
							? (data.scoringModel as
									| "FINITE_SCORE"
									| "HIGH_SCORE"
									| "NO_SCORE")
							: game.scoringModel,
					attemptState:
						typeof data.attemptState === "string"
							? (data.attemptState as "PARTIAL" | "COMPLETED")
							: "PARTIAL",
					metricsVersion:
						typeof data.metricsVersion === "number" ? data.metricsVersion : 1,
				});
				latestProgressRef.current = payload;
				logInfo("Stored latest GAME_PROGRESS payload", payload);
				logAttemptEvent("ATTEMPT_PROGRESS_STORED", {
					gameId: game.id,
					attemptState: payload.attemptState,
					scoringModel: payload.scoringModel,
					rawScore: payload.rawScore ?? 0,
					maxRawScore: payload.maxRawScore ?? null,
					duration: payload.duration ?? null,
					totalCount:
						typeof payload.resultMetrics?.totalCount === "number"
							? payload.resultMetrics.totalCount
							: null,
					answeredCount:
						typeof payload.resultMetrics?.answeredCount === "number"
							? payload.resultMetrics.answeredCount
							: null,
					exitReason:
						typeof payload.resultMetrics?.exitReason === "string"
							? payload.resultMetrics.exitReason
							: null,
				});
				return;
			}

			if (data?.type === "GAME_RESULT") {
				logInfo("Received GAME_RESULT payload", data);
				void trackResult(
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
						scoringModel:
							typeof data.scoringModel === "string"
								? (data.scoringModel as
										| "FINITE_SCORE"
										| "HIGH_SCORE"
										| "NO_SCORE")
								: game.scoringModel,
						attemptState:
							typeof data.attemptState === "string"
								? (data.attemptState as "PARTIAL" | "COMPLETED")
								: "COMPLETED",
						metricsVersion:
							typeof data.metricsVersion === "number" ? data.metricsVersion : 1,
					}),
				);
				return;
			}

			if (data?.type === "GAME_OVER" && typeof data.score === "number") {
				logInfo("Received legacy GAME_OVER payload", data);
				void trackResult({
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
		game.id,
		isMessageFromCurrentGame,
		logAttemptEvent,
		logInfo,
		parseIncomingMessage,
		trackResult,
	]);

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

	const handleBack = () => {
		logInfo("Back button clicked, attempting partial submit");
		submitPartialAttempt("BACK");
		onBack?.();
	};

	const toggleFullscreen = () => {
		if (!containerRef.current) return;

		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen().catch((error) => {
				logWarn("Failed to enter fullscreen", error);
			});
			return;
		}

		void document.exitFullscreen();
	};

	const gameUrl = useMemo(() => {
		try {
			const gameUrlObject = new URL(game.playUrl, window.location.href);
			gameUrlObject.searchParams.set("gameId", String(game.id));
			if (username) {
				gameUrlObject.searchParams.set("userId", username);
			}
			return gameUrlObject.toString();
		} catch (error) {
			logWarn("Failed to append tracking params to game URL", error);
			return game.playUrl;
		}
	}, [game.id, game.playUrl, logWarn, username]);

	if (variant === "page") {
		return (
			<div className="fixed inset-0 z-50 bg-black flex flex-col">
				<div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
					<div className="flex items-center gap-4">
						{onBack && (
							<button
								onClick={handleBack}
								className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
							>
								← Quay lại
							</button>
						)}
						<h2 className="font-bold text-lg">{game.title}</h2>
						{!username && (
							<span className="text-yellow-500 text-sm">
								⚠️ Chưa đăng nhập - tiến trình chơi sẽ không được ghi nhận
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
						{isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
					</button>
				</div>
				<div ref={containerRef} className="flex-1 relative">
					<iframe
						ref={iframeRef}
						src={gameUrl}
						className="w-full h-full border-none"
						title={`${game.title} - Chơi game`}
						onLoad={notifyGameHostReady}
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className={`relative overflow-hidden bg-black ${className}`}
		>
			<iframe
				ref={iframeRef}
				src={gameUrl}
				className={iframeClassName}
				title={`${game.title} - Chơi trong trang`}
				onLoad={notifyGameHostReady}
			/>
			<div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
				<div className="flex flex-col gap-2">
					{!username && (
						<span className="pointer-events-auto rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-semibold text-black shadow-lg">
							Chưa đăng nhập: không lưu kết quả
						</span>
					)}
					{tracked && (
						<span className="pointer-events-auto rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
							Đã ghi nhận kết quả
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={toggleFullscreen}
					className="pointer-events-auto rounded-full bg-black/65 px-4 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-black/80"
				>
					{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
				</button>
			</div>
		</div>
	);
}
