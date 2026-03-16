export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum Language {
  CPP = "CPP",
  JAVA = "JAVA",
  PYTHON = "PYTHON",
  JAVASCRIPT = "JAVASCRIPT",
}

export enum SubmissionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  ACCEPTED = "ACCEPTED",
  WRONG_ANSWER = "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
  RUNTIME_ERROR = "RUNTIME_ERROR",
  COMPILE_ERROR = "COMPILE_ERROR",
}

export enum ParamType {
  INT = "INT",
  LONG = "LONG",
  DOUBLE = "DOUBLE",
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",
  CHAR = "CHAR",
  INT_ARRAY = "INT_ARRAY",
  LONG_ARRAY = "LONG_ARRAY",
  DOUBLE_ARRAY = "DOUBLE_ARRAY",
  STRING_ARRAY = "STRING_ARRAY",
  BOOLEAN_ARRAY = "BOOLEAN_ARRAY",
  CHAR_ARRAY = "CHAR_ARRAY",
  INT_2D_ARRAY = "INT_2D_ARRAY",
  STRING_2D_ARRAY = "STRING_2D_ARRAY",
}
export interface CreateProblemRequest {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateProblemRequest {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface CreateProblemResponse {
  id: string;
}

export interface CreateTestCaseRequest {
  input: string;
  expectedOutput: string;
  isSample?: boolean;
}

export interface UpdateTestCaseRequest {
  input: string;
  expectedOutput: string;
  isSample?: boolean;
  orderIndex?: number;
}

export interface CreateTestCaseResponse {
  id: string;
}

export interface TestCaseResponse {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  orderIndex: number;
}

export interface CreateCodeTemplateRequest {
  language: Language;
  templateCode: string;
  driverCode?: string;
}

export interface CreateCodeTemplateResponse {
  id: string;
}

export interface CodeTemplateResponse {
  id: string;
  language: Language;
  templateCode: string;
  driverCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemBriefResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublic: boolean;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemDetailResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublic: boolean;
  tags: string[];
  sampleTestcases: TestCaseResponse[];
  codeTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemStatisticsResponse {
  problemId: string;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  totalUsers: number;
  solvedUsers: number;
}

export interface ToggleFavoriteResponse {
  isFavorite: boolean;
}

export interface SubmitCodeRequest {
  problemId: string;
  language: Language;
  sourceCode: string;
}

export interface SubmitCodeResponse {
  submissionId: string;
  status: SubmissionStatus;
}

export interface TestCaseResultResponse {
  testcaseId: string;
  orderIndex: number;
  status: SubmissionStatus;
  executionTimeMs: number;
  memoryUsageMb: number;
  actualOutput?: string;
  errorMessage?: string;
}

export interface SubmissionResultResponse {
  submissionId: string;
  problemId: string;
  language: Language;
  status: SubmissionStatus;
  totalTimeMs: number;
  maxMemoryMb: number;
  errorMessage?: string;
  passedTestcases: number;
  totalTestcases: number;
  testcaseResults: TestCaseResultResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionBriefResponse {
  submissionId: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  language: Language;
  status: SubmissionStatus;
  totalTimeMs: number;
  maxMemoryMb: number;
  passedTestcases: number;
  totalTestcases: number;
  createdAt: string;
}

export interface UserSubmissionStatsResponse {
  userId: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  solvedProblems: number;
  totalProblems: number;
}

export interface ProblemFilters {
  page?: number;
  size?: number;
  sort?: string;
}

export interface SubmissionFilters {
  problemId?: string;
  status?: SubmissionStatus;
  language?: Language;
  page?: number;
  size?: number;
  sort?: string;
}
