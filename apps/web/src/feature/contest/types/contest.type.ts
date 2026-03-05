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
  C = "C",
  JAVASCRIPT = "JAVASCRIPT",
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

export interface SubmitRequest {
  contestProblemId: string;
  language: Language;
  sourceCode: string;
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
  language: Language;
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
