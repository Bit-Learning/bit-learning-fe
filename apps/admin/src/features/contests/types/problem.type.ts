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
export interface ProblemFilters {
  page?: number;
  size?: number;
  sort?: string;
}
export interface TestCaseResponse {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  orderIndex: number;
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
