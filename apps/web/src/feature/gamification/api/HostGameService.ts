import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "../types";

const HOST_ENDPOINT = "/games/host";

export interface CreateSessionRequest {
	lessonGameId: number;
	maxPlayers: number;
}

export interface GameSessionResponse {
	id: number;
	pinCode: string;
	status: string;
}

export interface JoinSessionRequest {
	pinCode: string;
}

export interface SubmitAnswerRequest {
	pinCode: string;
	questionId: string;
	answer: string;
	timeSpent?: number;
}

export interface LeaderboardPlayer {
	userId: number;
	username: string;
	avatarUrl: string;
	rank: number;
	score: number;
	correctAnswers: number;
	accuracy: number;
	totalTimeSeconds: number;
}

export interface LeaderboardDto {
	sessionPin: string;
	currentQuestion: number;
	totalQuestions: number;
	rankings: LeaderboardPlayer[];
}

export const HostGameService = {
	createSession: (
		payload: CreateSessionRequest,
	): Promise<AxiosResponse<ApiResponse<GameSessionResponse>>> => {
		return api.post(`${HOST_ENDPOINT}/create`, payload);
	},

	joinSession: (
		payload: JoinSessionRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> => {
		return api.post(`${HOST_ENDPOINT}/join`, payload);
	},

	startSession: (
		pinCode: string,
	): Promise<AxiosResponse<ApiResponse<void>>> => {
		return api.post(`${HOST_ENDPOINT}/start/${pinCode}`);
	},

	endSession: (pinCode: string): Promise<AxiosResponse<ApiResponse<void>>> => {
		return api.post(`${HOST_ENDPOINT}/end/${pinCode}`);
	},

	getLeaderboard: (
		pinCode: string,
	): Promise<AxiosResponse<ApiResponse<LeaderboardDto>>> => {
		return api.get(`${HOST_ENDPOINT}/leaderboard/${pinCode}`);
	},

	submitAnswer: (
		payload: SubmitAnswerRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> => {
		return api.post(`${HOST_ENDPOINT}/answer`, payload);
	},
};
