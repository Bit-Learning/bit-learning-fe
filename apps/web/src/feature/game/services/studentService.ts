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
