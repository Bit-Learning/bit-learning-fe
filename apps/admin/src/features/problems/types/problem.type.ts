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

export enum ApprovalStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
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

export const ParamTypeInfo: Record<
  ParamType,
  {
    javaType: string;
    pythonType: string;
    cppType: string;
    jsType: string;
    javaDefault: string;
    pythonDefault: string;
    cppDefault: string;
    jsDefault: string;
    displayName: string;
  }
> = {
  [ParamType.INT]: {
    javaType: "int",
    pythonType: "int",
    cppType: "int",
    jsType: "number",
    javaDefault: "0",
    pythonDefault: "0",
    cppDefault: "0",
    jsDefault: "0",
    displayName: "Integer",
  },
  [ParamType.LONG]: {
    javaType: "long",
    pythonType: "int",
    cppType: "long long",
    jsType: "number",
    javaDefault: "0L",
    pythonDefault: "0",
    cppDefault: "0",
    jsDefault: "0",
    displayName: "Long",
  },
  [ParamType.DOUBLE]: {
    javaType: "double",
    pythonType: "float",
    cppType: "double",
    jsType: "number",
    javaDefault: "0.0",
    pythonDefault: "0.0",
    cppDefault: "0.0",
    jsDefault: "0",
    displayName: "Double",
  },
  [ParamType.STRING]: {
    javaType: "String",
    pythonType: "str",
    cppType: "string",
    jsType: "string",
    javaDefault: '""',
    pythonDefault: '""',
    cppDefault: '""',
    jsDefault: '""',
    displayName: "String",
  },
  [ParamType.BOOLEAN]: {
    javaType: "boolean",
    pythonType: "bool",
    cppType: "bool",
    jsType: "boolean",
    javaDefault: "false",
    pythonDefault: "False",
    cppDefault: "false",
    jsDefault: "false",
    displayName: "Boolean",
  },
  [ParamType.CHAR]: {
    javaType: "char",
    pythonType: "str",
    cppType: "char",
    jsType: "string",
    javaDefault: "' '",
    pythonDefault: "''",
    cppDefault: "' '",
    jsDefault: '""',
    displayName: "Character",
  },
  [ParamType.INT_ARRAY]: {
    javaType: "int[]",
    pythonType: "List[int]",
    cppType: "vector<int>",
    jsType: "number[]",
    javaDefault: "new int[0]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "Integer Array",
  },
  [ParamType.LONG_ARRAY]: {
    javaType: "long[]",
    pythonType: "List[int]",
    cppType: "vector<long long>",
    jsType: "number[]",
    javaDefault: "new long[0]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "Long Array",
  },
  [ParamType.DOUBLE_ARRAY]: {
    javaType: "double[]",
    pythonType: "List[float]",
    cppType: "vector<double>",
    jsType: "number[]",
    javaDefault: "new double[0]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "Double Array",
  },
  [ParamType.STRING_ARRAY]: {
    javaType: "String[]",
    pythonType: "List[str]",
    cppType: "vector<string>",
    jsType: "string[]",
    javaDefault: "new String[0]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "String Array",
  },
  [ParamType.BOOLEAN_ARRAY]: {
    javaType: "boolean[]",
    pythonType: "List[bool]",
    cppType: "vector<bool>",
    jsType: "boolean[]",
    javaDefault: "new boolean[0]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "Boolean Array",
  },
  [ParamType.CHAR_ARRAY]: {
    javaType: "char[]",
    pythonType: "List[str]",
    cppType: "vector<char>",
    jsType: "string[]",
    javaDefault: "new char[0]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "Character Array",
  },
  [ParamType.INT_2D_ARRAY]: {
    javaType: "int[][]",
    pythonType: "List[List[int]]",
    cppType: "vector<vector<int>>",
    jsType: "number[][]",
    javaDefault: "new int[0][]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "2D Integer Array",
  },
  [ParamType.STRING_2D_ARRAY]: {
    javaType: "String[][]",
    pythonType: "List[List[str]]",
    cppType: "vector<vector<string>>",
    jsType: "string[][]",
    javaDefault: "new String[0][]",
    pythonDefault: "[]",
    cppDefault: "{}",
    jsDefault: "[]",
    displayName: "2D String Array",
  },
};

export const isArrayType = (type: ParamType): boolean => type.includes("ARRAY");
export const is2DArrayType = (type: ParamType): boolean => type.includes("2D_ARRAY");
export const isPrimitiveType = (type: ParamType): boolean => !isArrayType(type);

export const getTypeForLanguage = (type: ParamType, language: "java" | "python" | "cpp" | "js"): string => {
  const info = ParamTypeInfo[type];
  switch (language) {
    case "java":
      return info.javaType;
    case "python":
      return info.pythonType;
    case "cpp":
      return info.cppType;
    case "js":
      return info.jsType;
  }
};

export const getDefaultValueForLanguage = (type: ParamType, language: "java" | "python" | "cpp" | "js"): string => {
  const info = ParamTypeInfo[type];
  switch (language) {
    case "java":
      return info.javaDefault;
    case "python":
      return info.pythonDefault;
    case "cpp":
      return info.cppDefault;
    case "js":
      return info.jsDefault;
  }
};

export interface CodeFile {
  name: string;
  content: string;
}

export interface CreateProblemRequest {
  title: string;
  slug: string;
  description: string;
  constraints?: string;
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
  constraints?: string;
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

export interface BulkCreateTestCaseRequest {
  testCases: CreateTestCaseRequest[];
  replaceExisting?: boolean;
}

export interface BulkCreateTestCaseResponse {
  createdCount: number;
  totalCount: number;
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
  multifileEntryTemplate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
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
  createdBy?: UserSummary;
  approvalStatus: ApprovalStatus;
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
  createdBy?: UserSummary;
  approvalStatus: ApprovalStatus;
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
  sourceCode?: string;
  files?: CodeFile[];
  entryFile?: string;
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

export interface RunCodeRequest {
  problemId?: string;
  language: Language;
  sourceCode?: string;
  files?: CodeFile[];
  entryFile?: string;
  input?: string;
}

export interface RunTestCaseResult {
  orderIndex: number;
  status: SubmissionStatus;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  executionTimeMs: number;
  memoryUsageMb: number;
  errorMessage?: string;
}

export interface RunCodeResponse {
  overallStatus: SubmissionStatus;
  language: Language;
  compileError?: string;
  testCaseResults: RunTestCaseResult[];
}

export interface DebugRequest {
  problemId: string;
  code?: string;
  language: Language;
  lines: number[];
  files?: CodeFile[];
  entryFile?: string;
  input?: string;
}

export interface DebugStep {
  line: number;
  iteration: number;
  file?: string;
  variables: Record<string, string>;
}

export interface DebugResponse {
  status: SubmissionStatus;
  steps: DebugStep[];
  output?: string;
  error?: string;
}

export interface ProblemFilters {
  search?: string;
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

export interface ApprovalFilters {
  status?: ApprovalStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface FunctionParam {
  name: string;
  type: ParamType;
}

export interface GenerateCodeTemplatesRequest {
  functionName: string;
  returnType: ParamType;
  parameters: FunctionParam[];
}

export interface GenerateCodeTemplatesResponse {
  templates: CodeTemplateResponse[];
}

export interface FormatError {
  line: number;
  message: string;
}

export interface RequestPublishRequest {
  problemIds: string[];
}

export interface ApproveRejectRequest {
  problemIds: string[];
  rejectReason?: string;
}

export interface TagResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
