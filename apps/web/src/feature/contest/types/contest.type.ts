import type {
	Language as LangType,
	SubmissionStatus,
} from "@/feature/code-practice/types/coding.type";

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

export interface CodeFile {
	name: string;
	content: string;
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
	description: string;
	status: ContestStatus;
	startTime: string;
	endTime: string;
	durationMinutes: number;
	problemCount: number;
	participantCount: number;
	isRegistered: boolean;
	myRank: number | null;
	prizeTopCount?: number | null;
	prizeCoinsPerRank?: number[] | null;
	prizesDistributed?: boolean;
	createdAt: string;
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
	myStatus: string | null;
	myAttempts: number;
	totalAccepted: number;
	totalSubmissions: number;
}

export interface RegisterResponse {
	contestId: string;
	registeredAt: string;
}

export type SubmitRequest =
	| {
			contestProblemId: string;
			language: LangType;
			sourceCode: string;
			files?: never;
			entryFile?: never;
	  }
	| {
			contestProblemId: string;
			language: LangType;
			sourceCode?: never;
			files: CodeFile[];
			entryFile: string;
	  };

export interface SubmitResponse {
	submissionId: string;
	status: ContestSubmissionStatus;
}

export type ContestRunRequest =
	| {
			contestProblemId: string;
			language: LangType;
			sourceCode: string;
			files?: never;
			entryFile?: never;
	  }
	| {
			contestProblemId: string;
			language: LangType;
			sourceCode?: never;
			files: CodeFile[];
			entryFile: string;
	  };

export interface ContestRunTestCaseResult {
	orderIndex: number;
	status: ContestVerdict;
	input: string | null;
	expectedOutput: string | null;
	actualOutput: string | null;
	executionTimeMs: number | null;
	memoryUsageMb: number | null;
	errorMessage: string | null;
}

export interface ContestRunResponse {
	overallStatus: ContestVerdict | "COMPILE_ERROR";
	language: LangType;
	compileError: string | null;
	testCaseResults: ContestRunTestCaseResult[];
}

export type ContestDebugRequest =
	| {
			contestProblemId: string;
			language: LangType;
			lines: number[];
			input?: string;
			code: string;
			files?: never;
			entryFile?: never;
	  }
	| {
			contestProblemId: string;
			language: LangType;
			lines: number[];
			input?: string;
			code?: never;
			files: CodeFile[];
			entryFile: string;
	  };

export interface ContestDebugStep {
	line: number;
	iteration: number;
	file: string;
	variables: Record<string, string>;
}

export interface ContestDebugResponse {
	status: SubmissionStatus;
	steps: ContestDebugStep[];
	output: string;
	error: string | null;
}

export interface SubmissionBriefDTO {
	submissionId: string;
	problemLabel: string;
	problemTitle: string;
	userId: number;
	username: string;
	language: LangType;
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
	executionTimeMs: number | null;
	memoryUsageMb: number | null;
	isSample: boolean;
	input: string | null;
	expectedOutput: string | null;
	actualOutput: string | null;
	errorMessage: string | null;
}

export interface SubmissionDetailDTO {
	submissionId: string;
	contestId: string;
	contestProblemId: string;
	problemLabel: string;
	problemTitle: string;
	language: LangType;
	sourceCode: string;
	status: ContestSubmissionStatus;
	verdict: ContestVerdict | null;
	passedTestcases: number;
	totalTestcases: number;
	executionTimeMs: number | null;
	memoryUsageMb: number | null;
	errorMessage: string | null;
	testcaseResults: TestCaseResultDTO[];
	createdAt: string;
	updatedAt: string;
}

export interface ProblemResult {
	label: string;
	contestProblemId: string;
	solved: boolean;
	attempts: number;
	wrongAttempts: number;
	acTimeMinutes: number | null;
	penaltyMinutes: number;
	firstAcMinutes: number | null;
}

export interface RankingEntry {
	rank: number;
	userId: number;
	username: string;
	avatar: string | null;
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
	myRank: number | null;
	prizeTopCount?: number | null;
	prizeCoinsPerRank?: number[] | null;
}

export interface CreateClarificationRequest {
	contestProblemId?: string;
	question: string;
}

export interface ClarificationResponse {
	clarificationId: string;
	problemLabel: string | null;
	question: string;
	answer: string | null;
	isPublic: boolean;
	askedBy: string;
	answeredBy: string | null;
	createdAt: string;
	answeredAt: string | null;
}

export interface ContestListParams {
	status?: ContestStatus;
	search?: string;
	page?: number;
	size?: number;
}

export interface MySubmissionsParams {
	contestId: string;
	contestProblemId?: string;
	page?: number;
	size?: number;
}
