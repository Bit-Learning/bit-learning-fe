export interface GameListItem {
	id: number;
	title: string;
	thumbnailUrl: string;
	topic: string;
	type: string;
	description: string;
	lessonId?: number;
	courseId?: number;
	isPlayed: boolean;
	bestScore: number;
}

export interface PublicOption {
	id: string;
	text: string;
}

export interface PublicQuestion {
	id: string;
	text: string;
	options: PublicOption[];
	shuffle?: boolean; // null = use global setting, true/false = override
}

export interface GameSettings {
	timePerQuestion: number;
	pointsBase: number;
	shuffleOptions?: boolean; // Default true if not set
}

export interface GameDetail {
	id: number;
	title: string;
	thumbnailUrl: string;
	topic: string;
	type: string;
	description: string;
	questions: PublicQuestion[];
	settings: GameSettings;
}

export interface CheckAnswerRequest {
	questionId: string;
	selectedOptionId: string;
	timeLeft: number;
}

export interface CheckAnswerResponse {
	correct: boolean;
	points: number;
	correctOptionId: string;
}

export interface QuestionLog {
	questionId: string;
	selectedOptionId: string;
	correct: boolean;
	timeSpent: number;
}

export interface GameLogDetails {
	totalTime: number;
	accuracy: number;
	history: QuestionLog[];
}

export interface SubmitGameRequest {
	score: number;
	accuracy: number;
	totalTime: number;
	history: QuestionLog[];
}

export interface SubmitGameResponse {
	score: number;
	accuracy: number;
	rank: number;
	totalPlayers: number;
}

export interface GameLog {
	id: number;
	score: number;
	playedAt: string;
	details: GameLogDetails;
}

export interface LeaderboardEntry {
	rank: number;
	userId: number;
	username: string;
	firstName: string;
	lastName: string;
	avatar: string;
	score: number;
}

export interface GameSection {
	type: string;
	sectionTitle: string;
	items: GameListItem[];
}

export type GameType = "QUIZ" | "FILL_IN_BLANK" | "TYPING" | "CODE_COMPLETION";

export interface ApiResponse<T> {
	data: T;
	message: string;
	status: number;
}

export interface PageResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
}
