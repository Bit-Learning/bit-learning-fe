import api from "@/shared/api/api";

export interface StudentProfile {
	userId: number;
	username: string;
	email: string;
	createdAt: string;
	totalScore: number;
	gamesPlayed: number;
	totalAttempts: number;
}

export interface PlayHistoryItem {
	id: number;
	gameId: number;
	gameTitle: string;
	gameThumbnail: string;
	playedAt: string;
	score: number;
	rawScore: number;
	maxScore: number;
	normalizedScore: number;
	leaderboardPoints: number;
	duration: number;
	completed: boolean;
	attemptType?: string | null;
	analyticsAvailable: boolean;
	bookCode?: string | null;
	bookTitle?: string | null;
	grade?: number | null;
	topicLetter?: string | null;
	part?: number | null;
	topicName?: string | null;
	questionSetId?: string | null;
	questionSetTitle?: string | null;
	questionSetVersion?: string | null;
	attemptState?: string | null;
	exitReason?: string | null;
	correctCount: number;
	wrongCount: number;
	timeoutCount: number;
	totalCount: number;
	answeredCount: number;
	accuracy: number;
}

export interface PlayHistoryQuestionResult {
	order: number;
	questionId: string;
	type: string;
	prompt: string;
	selectedAnswerText?: string | null;
	selectedOptionIndex?: number | null;
	correctAnswerText?: string | null;
	correctOptionIndex?: number | null;
	outcome: "correct" | "wrong" | "timeout";
	durationMs: number;
}

export interface PlayHistoryDetail extends PlayHistoryItem {
	resultMetrics?: Record<string, unknown> | null;
	questionResults?: PlayHistoryQuestionResult[] | null;
}

export interface UserGameAnalyticsSummary {
	gameId: number;
	gameTitle: string;
	totalAttempts: number;
	completedAttempts: number;
	partialAttempts: number;
	completionRate: number;
	partialRate: number;
	averageAccuracy: number;
	bestAccuracy: number;
	averageDurationSeconds: number;
	averageLeaderboardPoints: number;
	bestLeaderboardPoints: number;
	averageNormalizedScore: number;
	timeoutRate: number;
	totalQuestions: number;
	totalCorrect: number;
	totalWrong: number;
	totalTimeout: number;
	lastPlayedAt?: string | null;
}

export interface PaginatedPlayHistory {
	content: PlayHistoryItem[];
	currentPage: number;
	totalItems: number;
	totalPages: number;
}

export interface PaginatedStudents {
	content: StudentProfile[];
	currentPage: number;
	totalItems: number;
	totalPages: number;
}

const studentService = {
	// Get student profile by ID
	getStudentProfile: async (userId: number): Promise<StudentProfile> => {
		const response = await api.get<StudentProfile>(
			`/students/${userId}/profile`,
		);
		return response.data;
	},

	// Get student play history with pagination
	getStudentPlayHistory: async (
		userId: number,
		page: number = 0,
		size: number = 10,
		sortBy: string = "playedAt",
		sortDirection: string = "DESC",
	): Promise<PaginatedPlayHistory> => {
		const response = await api.get<PaginatedPlayHistory>(
			`/students/${userId}/play-history`,
			{
				params: { page, size, sortBy, sortDirection },
			},
		);
		return response.data;
	},

	getStudentPlayHistoryDetail: async (
		userId: number,
		historyId: number,
	): Promise<PlayHistoryDetail> => {
		const response = await api.get<PlayHistoryDetail>(
			`/students/${userId}/play-history/${historyId}`,
		);
		return response.data;
	},

	getStudentGamePlayHistory: async (
		userId: number,
		gameId: number,
		page: number = 0,
		size: number = 6,
		sortBy: string = "playedAt",
		sortDirection: string = "DESC",
	): Promise<PaginatedPlayHistory> => {
		const response = await api.get<PaginatedPlayHistory>(
			`/students/${userId}/games/${gameId}/play-history`,
			{
				params: { page, size, sortBy, sortDirection },
			},
		);
		return response.data;
	},

	getStudentGameAnalytics: async (
		userId: number,
		gameId: number,
	): Promise<UserGameAnalyticsSummary> => {
		const response = await api.get<UserGameAnalyticsSummary>(
			`/students/${userId}/games/${gameId}/analytics`,
		);
		return response.data;
	},

	// Get all students with pagination
	getAllStudents: async (
		page: number = 0,
		size: number = 20,
	): Promise<PaginatedStudents> => {
		const response = await api.get<PaginatedStudents>("/students", {
			params: { page, size },
		});
		return response.data;
	},
};

export default studentService;
