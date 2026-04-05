export interface TagResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

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
  tags: TagResponse[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemDetailResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  constraints?: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublic: boolean;
  tags: TagResponse[];
  sampleTestcases: TestCaseResponse[];
  codeTemplate: string;
  multifileEntryTemplate?: string;
  createdAt: string;
  updatedAt: string;
}
