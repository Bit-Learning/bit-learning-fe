export interface ManagerStatsDto {
	courseStats: CourseStats;
	postStats: PostStats;
	questionStats: QuestionStats;
	contestStats: ContestStats;
	gameStats: GameStats;
}

export interface CourseStats {
	totalCourses: number;
	activeCourses: number;
	inactiveCourses: number;
	coursesInJanuary: number;
	coursesInFebruary: number;
	coursesInMarch: number;
	coursesInApril: number;
	coursesInMay: number;
	coursesInJune: number;
	coursesInJuly: number;
	coursesInAugust: number;
	coursesInSeptember: number;
	coursesInOctober: number;
	coursesInNovember: number;
	coursesInDecember: number;
}

export interface PostStats {
	totalPosts: number;
	activePosts: number;
	inactivePosts: number;
}

export interface QuestionStats {
	totalQuestions: number;
	grade3Questions: number;
	grade4Questions: number;
	grade5Questions: number;
	grade6Questions: number;
	grade7Questions: number;
	grade8Questions: number;
	grade9Questions: number;
	grade10Questions: number;
	grade11Questions: number;
	grade12Questions: number;
}

export interface ContestStats {
	totalContests: number;
	upcomingContests: number;
	runningContests: number;
	endedContests: number;
}

export interface GameStats {
	totalGames: number;
	typingGames: number;
	matchingGames: number;
	quizGames: number;
	publishedGames: number;
	draftGames: number;
	archivedGames: number;
	easyGames: number;
	mediumGames: number;
	hardGames: number;
}
