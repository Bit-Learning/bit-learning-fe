import SockJS from "sockjs-client";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { getAccessToken } from "@/shared/lib/cookies";

export type GameMessageType =
	| "PLAYER_JOINED"
	| "PLAYER_LEFT"
	| "PLAYER_READY"
	| "PLAYER_ANSWER"
	| "GAME_START"
	| "GAME_END"
	| "NEXT_QUESTION"
	| "LEADERBOARD_UPDATE"
	| "QUESTION_RESULT"
	| "FINAL_RESULTS"
	| "ERROR"
	| "INFO";

export interface GameMessage<T = unknown> {
	type: GameMessageType;
	sessionPin: string;
	payload?: T;
	username?: string;
	timestamp?: number;
}

export interface GameSocketConfig<T = unknown> {
	pinCode: string;
	onMessage?: (message: GameMessage<T>) => void;
	onQuestionResult?: (message: GameMessage<T>) => void;
}

export interface GameSocketConnection {
	client: Client;
	disconnect: () => void;
	sendJoin: (username: string) => void;
	sendStart: (username: string) => void;
	sendNextQuestion: (username: string) => void;
	sendEnd: (username: string) => void;
	sendAnswer: (username: string, payload: Record<string, unknown>) => void;
}

const createWebSocketUrl = () => {
	const apiBase =
		import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/";
	const httpBase = apiBase.replace(/\/?api\/?$/, "");
	return `${httpBase}/ws/game`;
};

export function createGameSocket<T = unknown>(
	config: GameSocketConfig<T>,
): GameSocketConnection {
	const { pinCode, onMessage, onQuestionResult } = config;
	const wsUrl = createWebSocketUrl();

	const socket: WebSocket = new SockJS(wsUrl) as unknown as WebSocket;

	const client: Client = new Client({
		webSocketFactory: () => socket,
		reconnectDelay: 5000,
		heartbeatIncoming: 10000,
		heartbeatOutgoing: 10000,
		connectHeaders: {},
	});

	client.beforeConnect = () => {
		const token = getAccessToken();
		if (token) {
			client.connectHeaders = {
				...client.connectHeaders,
				Authorization: `Bearer ${token}`,
			};
		}
	};

	let topicSub: StompSubscription | undefined;
	let resultSub: StompSubscription | undefined;

	client.onConnect = () => {
		// Subscribe to game topic for broadcast updates
		if (onMessage) {
			topicSub = client.subscribe(`/topic/game/${pinCode}`, (msg: IMessage) => {
				try {
					const body = JSON.parse(msg.body) as GameMessage<T>;
					onMessage(body);
				} catch (e) {
					console.error("Failed to parse game message", e);
				}
			});
		}

		// Subscribe to user-specific question results
		if (onQuestionResult) {
			resultSub = client.subscribe(
				"/user/queue/game/result",
				(msg: IMessage) => {
					try {
						const body = JSON.parse(msg.body) as GameMessage<T>;
						onQuestionResult(body);
					} catch (e) {
						console.error("Failed to parse question result message", e);
					}
				},
			);
		}
	};

	client.onStompError = (frame) => {
		console.error(
			"Broker reported error:",
			frame.headers["message"],
			frame.body,
		);
	};

	client.onWebSocketError = (event) => {
		console.error("WebSocket error", event);
	};

	client.activate();

	const send = (
		type: GameMessageType,
		username: string,
		payload?: Record<string, unknown>,
	) => {
		if (!client.connected) return;
		client.publish({
			destination:
				"/app/game/" +
				pinCode +
				"/" +
				(type === "PLAYER_JOINED"
					? "join"
					: type === "PLAYER_READY"
						? "ready"
						: type === "PLAYER_ANSWER"
							? "answer"
							: type === "GAME_START"
								? "start"
								: type === "NEXT_QUESTION"
									? "next"
									: type === "GAME_END"
										? "end"
										: "join"),
			body: JSON.stringify({
				type,
				sessionPin: pinCode,
				username,
				payload,
				timestamp: Date.now(),
			}),
		});
	};

	return {
		client,
		disconnect: () => {
			try {
				topicSub?.unsubscribe();
				resultSub?.unsubscribe();
				client.deactivate();
			} catch (e) {
				console.error("Error disconnecting game socket", e);
			}
		},
		sendJoin: (username: string) => send("PLAYER_JOINED", username),
		sendStart: (username: string) => send("GAME_START", username),
		sendNextQuestion: (username: string) => send("NEXT_QUESTION", username),
		sendEnd: (username: string) => send("GAME_END", username),
		sendAnswer: (username: string, payload: Record<string, unknown>) =>
			send("PLAYER_ANSWER", username, payload),
	};
}
