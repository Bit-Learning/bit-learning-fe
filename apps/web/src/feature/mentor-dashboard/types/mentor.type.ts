import { Post } from "@/feature/forum/types/forum.type";

export interface UserSummaryResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface MentorWithViewsResponse extends UserSummaryResponse {
  totalViews: number;
  topPosts: Post[];
}

export interface MentorWithReactionsResponse extends UserSummaryResponse {
  totalReactions: number;
  topPosts: Post[];
}

export interface QuestionStats {
  totalQuestions: number;
  pendingQuestions: number;
  approvedQuestions: number;
  rejectedQuestions: number;
  noneQuestions: number;
}

export interface ExamStats {
  totalExams: number;
  januaryExams: number;
  februaryExams: number;
  marchExams: number;
  aprilExams: number;
  mayExams: number;
  juneExams: number;
  julyExams: number;
  augustExams: number;
  septemberExams: number;
  octoberExams: number;
  novemberExams: number;
  decemberExams: number;
}

export interface ProblemStats {
  totalProblems: number;
  pendingProblems: number;
  approvedProblems: number;
  rejectedProblems: number;
  noneProblems: number;
}

export interface SlideStats {
  totalSlides: number;
  januarySlides: number;
  februarySlides: number;
  marchSlides: number;
  aprilSlides: number;
  maySlides: number;
  juneSlides: number;
  julySlides: number;
  augustSlides: number;
  septemberSlides: number;
  octoberSlides: number;
  novemberSlides: number;
  decemberSlides: number;
}

export interface MindMapStats {
  totalMindMaps: number;
  januaryMindMaps: number;
  februaryMindMaps: number;
  marchMindMaps: number;
  aprilMindMaps: number;
  mayMindMaps: number;
  juneMindMaps: number;
  julyMindMaps: number;
  augustMindMaps: number;
  septemberMindMaps: number;
  octoberMindMaps: number;
  novemberMindMaps: number;
  decemberMindMaps: number;
}

export interface MentorDashboardStatsResponse {
  questionStats: QuestionStats;
  examStats: ExamStats;
  problemStats: ProblemStats;
  slideStats: SlideStats;
  mindMapStats: MindMapStats;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface ContentMonthlyData {
  month: string;
  slides: number;
  mindmaps: number;
}

export interface QuestionStatusData {
  approved: number;
  pending: number;
  rejected: number;
  none: number; // chưa gửi
}

export interface ProblemStatusData {
  approved: number;
  pending: number;
  rejected: number;
  none: number; // chưa gửi
}

export interface MentorDashboardStats {
  totalQuestions: number;
  pendingQuestions: number;
  rejectedQuestions: number;
  totalExams: number;
  newExamsThisMonth: number;
  totalPractices: number;
  newPracticesThisMonth: number;
  totalSlides: number;
  newSlidesThisMonth: number;
  totalMindMaps: number;
  newMindMapsThisMonth: number;
}

const MONTHS_VI = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

const EXAM_MONTH_KEYS: (keyof ExamStats)[] = [
  "januaryExams",
  "februaryExams",
  "marchExams",
  "aprilExams",
  "mayExams",
  "juneExams",
  "julyExams",
  "augustExams",
  "septemberExams",
  "octoberExams",
  "novemberExams",
  "decemberExams",
];

const SLIDE_MONTH_KEYS: (keyof SlideStats)[] = [
  "januarySlides",
  "februarySlides",
  "marchSlides",
  "aprilSlides",
  "maySlides",
  "juneSlides",
  "julySlides",
  "augustSlides",
  "septemberSlides",
  "octoberSlides",
  "novemberSlides",
  "decemberSlides",
];

const MINDMAP_MONTH_KEYS: (keyof MindMapStats)[] = [
  "januaryMindMaps",
  "februaryMindMaps",
  "marchMindMaps",
  "aprilMindMaps",
  "mayMindMaps",
  "juneMindMaps",
  "julyMindMaps",
  "augustMindMaps",
  "septemberMindMaps",
  "octoberMindMaps",
  "novemberMindMaps",
  "decemberMindMaps",
];

export interface TransformedMentorStats {
  stats: MentorDashboardStats;
  examMonthly: MonthlyCount[];
  contentMonthly: ContentMonthlyData[];
  questionStatus: QuestionStatusData;
  problemStatus: ProblemStatusData;
}

export function transformMentorStats(raw: MentorDashboardStatsResponse): TransformedMentorStats {
  const currentMonth = new Date().getMonth();

  const examMonthly: MonthlyCount[] = MONTHS_VI.map((month, i) => {
    const key = EXAM_MONTH_KEYS[i]!;
    return { month, count: raw.examStats[key] };
  });

  const contentMonthly: ContentMonthlyData[] = MONTHS_VI.map((month, i) => {
    const slideKey = SLIDE_MONTH_KEYS[i]!;
    const mindMapKey = MINDMAP_MONTH_KEYS[i]!;
    return {
      month,
      slides: raw.slideStats[slideKey],
      mindmaps: raw.mindMapStats[mindMapKey],
    };
  });

  const questionStatus: QuestionStatusData = {
    approved: raw.questionStats.approvedQuestions,
    pending: raw.questionStats.pendingQuestions,
    rejected: raw.questionStats.rejectedQuestions,
    none: raw.questionStats.noneQuestions,
  };

  const problemStatus: ProblemStatusData = {
    approved: raw.problemStats.approvedProblems,
    pending: raw.problemStats.pendingProblems,
    rejected: raw.problemStats.rejectedProblems,
    none: raw.problemStats.noneProblems,
  };

  const stats: MentorDashboardStats = {
    totalQuestions: raw.questionStats.totalQuestions,
    pendingQuestions: raw.questionStats.pendingQuestions,
    rejectedQuestions: raw.questionStats.rejectedQuestions,
    totalExams: raw.examStats.totalExams,
    newExamsThisMonth: raw.examStats[EXAM_MONTH_KEYS[currentMonth]!],
    totalPractices: raw.problemStats.totalProblems,
    newPracticesThisMonth: raw.problemStats.pendingProblems,
    totalSlides: raw.slideStats.totalSlides,
    newSlidesThisMonth: raw.slideStats[SLIDE_MONTH_KEYS[currentMonth]!],
    totalMindMaps: raw.mindMapStats.totalMindMaps,
    newMindMapsThisMonth: raw.mindMapStats[MINDMAP_MONTH_KEYS[currentMonth]!],
  };

  return { stats, examMonthly, contentMonthly, questionStatus, problemStatus };
}
