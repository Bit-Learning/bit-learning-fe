export enum ContestStatus {
	UPCOMING = "UPCOMING",
	RUNNING = "RUNNING",
	ENDED = "ENDED",
}

export enum ContestSubmissionStatus {
	PENDING = "PENDING",
	RUNNING = "RUNNING",
	DONE = "DONE",
}

export enum ContestVerdict {
	AC = "AC",
	WA = "WA",
	TLE = "TLE",
	MLE = "MLE",
	RE = "RE",
	CE = "CE",
}

export enum Language {
	JAVA = "JAVA",
	PYTHON = "PYTHON",
	CPP = "CPP",
	JAVASCRIPT = "JAVASCRIPT",
}

export interface ContestUpsertDTO {
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	prizeTopCount?: number | null;
	prizeCoinsPerRank?: number[] | null;
}

export interface AddProblemRequest {
	problemId: string;
	orderIndex: number;
}

export interface SubmitRequest {
	contestProblemId: string;
	language: Language;
	sourceCode: string;
}

export interface CreateClarificationRequest {
	contestProblemId?: string;
	question: string;
}

export interface AnswerClarificationRequest {
	answer: string;
	isPublic?: boolean;
}

export interface ContestResponse {
	contestId: string;
	title: string;
	slug: string;
	status: ContestStatus;
	startTime: string;
	endTime: string;
	prizeTopCount?: number | null;
	prizeCoinsPerRank?: number[] | null;
	createdAt: string;
}

export interface ContestListDTO {
	contestId: string;
	title: string;
	slug: string;
	status: ContestStatus;
	startTime: string;
	endTime: string;
	problemCount: number;
	participantCount: number;
	isRegistered: boolean;
	prizeTopCount?: number | null;
	prizeCoinsPerRank?: number[] | null;
}

export interface ContestDetailDTO {
	contestId: string;
	title: string;
	slug: string;
	description?: string;
	status: ContestStatus;
	startTime: string;
	endTime: string;
	durationMinutes: number;
	problemCount: number;
	participantCount: number;
	isRegistered: boolean;
	myRank?: number;
	prizeTopCount?: number | null;
	prizeCoinsPerRank?: number[] | null;
	prizesDistributed?: boolean;
	createdAt: string;
}

export interface ContestProblemResponse {
	contestProblemId: string;
	problemId: string;
	problemTitle: string;
	label: string;
	orderIndex: number;
}

export interface ContestProblemListDTO {
	contestProblemId: string;
	label: string;
	orderIndex: number;
	problemId: string;
	title: string;
	difficulty: string;
	timeLimitMs: number;
	memoryLimitMb: number;
	myStatus?: string;
	myAttempts: number;
	totalAccepted: number;
	totalSubmissions: number;
}

export interface RegisterResponse {
	contestId: string;
	registeredAt: string;
}

export interface StatusResponse {
	contestId: string;
	status: ContestStatus;
	startTime: string;
	endTime: string;
}

export interface SubmitResponse {
	submissionId: string;
	status: ContestSubmissionStatus;
}

export interface SubmissionBriefDTO {
	submissionId: string;
	problemLabel: string;
	problemTitle: string;
	userId: number;
	username: string;
	language: Language;
	status: ContestSubmissionStatus;
	verdict: ContestVerdict | null;
	passedTestcases: number;
	totalTestcases: number;
	executionTimeMs: number | null;
	memoryUsageMb: number | null;
	createdAt: string;
}

export interface TestCaseResultDTO {
	orderIndex: number;
	verdict: ContestVerdict;
	executionTimeMs: number;
	memoryUsageMb: number;
	isSample: boolean;
	input?: string;
	expectedOutput?: string;
	actualOutput?: string;
	errorMessage?: string;
}

export interface SubmissionDetailDTO {
	submissionId: string;
	contestId: string;
	contestProblemId: string;
	problemLabel: string;
	problemTitle: string;
	language: Language;
	sourceCode: string;
	status: ContestSubmissionStatus;
	verdict: ContestVerdict | null;
	passedTestcases: number;
	totalTestcases: number;
	executionTimeMs: number | null;
	memoryUsageMb: number | null;
	errorMessage?: string;
	testcaseResults: TestCaseResultDTO[];
	createdAt: string;
	updatedAt: string;
}

export interface RejudgeResponse {
	submissionId: string;
	status: ContestSubmissionStatus;
	message: string;
}

export interface ProblemResult {
	label: string;
	contestProblemId: string;
	solved: boolean;
	attempts: number;
	wrongAttempts: number;
	acTimeMinutes: number;
	penaltyMinutes: number;
	firstAcMinutes: number;
}

export interface RankingEntry {
	rank: number;
	userId: number;
	username: string;
	avatar?: string;
	solvedCount: number;
	totalPenaltyMinutes: number;
	problemResults: ProblemResult[];
}

export interface LeaderboardResponse {
	contestId: string;
	contestTitle: string;
	totalParticipants: number;
	lastUpdatedAt: string;
	rankings: RankingEntry[];
	myRank?: number;
	prizeTopCount?: number | null;
	prizeCoinsPerRank?: number[] | null;
}

export interface SubmissionSummary {
	submissionId: string;
	problemLabel: string;
	verdict: string;
	createdAt: string;
}

export interface AdminLeaderboardEntry {
	rank: number;
	userId: number;
	username: string;
	email: string;
	avatar?: string;
	solvedCount: number;
	totalPenaltyMinutes: number;
	problemResults: ProblemResult[];
	submissions: SubmissionSummary[];
}

export interface ClarificationResponse {
	clarificationId: string;
	problemLabel?: string;
	question: string;
	answer?: string;
	isPublic: boolean;
	askedBy: string;
	answeredBy?: string;
	createdAt: string;
	answeredAt?: string;
}

export interface ContestListParams {
	status?: ContestStatus;
	search?: string;
	page?: number;
	size?: number;
}

export interface ContestSubmissionParams {
	userId?: number;
	verdict?: ContestVerdict;
	page?: number;
	size?: number;
}

export interface ContestRegistrationDTO {
	registrationId: string;
	userId: number;
	username: string;
	fullName: string;
	email: string;
	avatar: string;
	registeredAt: string;
}

export interface PageableParams {
	page?: number;
	size?: number;
	sort?: string;
}

export interface PageInfo {
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
}

export interface PagedResponse<T> {
	data: T[];
	page: PageInfo;
	message?: string;
}
