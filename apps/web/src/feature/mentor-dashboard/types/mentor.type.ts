export interface QuestionStats {
  totalQuestions: number;
  pendingQuestions: number;
  approvedQuestions: number;
  rejectedQuestions: number;
}

export interface SubjectStats {
  totalSubjects: number;
  januarySubjects: number;
  februarySubjects: number;
  marchSubjects: number;
  aprilSubjects: number;
  maySubjects: number;
  juneSubjects: number;
  julySubjects: number;
  augustSubjects: number;
  septemberSubjects: number;
  octoberSubjects: number;
  novemberSubjects: number;
  decemberSubjects: number;
}

export interface ProblemStats {
  totalProblems: number;
  pendingProblems: number;
  approvedProblems: number;
  rejectedProblems: number;
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
  subjectStats: SubjectStats;
  problemStats: ProblemStats;
  slideStats: SlideStats;
  mindMapStats: MindMapStats;
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
  totalDeposited: number;
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
}

export interface RecentQuestion {
  id: number;
  student: string;
  course: string;
  question: string;
  time: string;
  status: "pending" | "answered";
}

const MONTHS_VI = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

const SUBJECT_KEYS = [
  "januarySubjects",
  "februarySubjects",
  "marchSubjects",
  "aprilSubjects",
  "maySubjects",
  "juneSubjects",
  "julySubjects",
  "augustSubjects",
  "septemberSubjects",
  "octoberSubjects",
  "novemberSubjects",
  "decemberSubjects",
] as const satisfies (keyof SubjectStats)[];

const SLIDE_KEYS = [
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
] as const satisfies (keyof SlideStats)[];

const MINDMAP_KEYS = [
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
] as const satisfies (keyof MindMapStats)[];

export interface TransformedMentorStats {
  stats: MentorDashboardStats;
  examMonthly: MonthlyCount[];
  contentMonthly: ContentMonthlyData[];
  questionStatus: QuestionStatusData;
}

export function transformMentorStats(raw: MentorDashboardStatsResponse): TransformedMentorStats {
  const currentMonth = new Date().getMonth();

  return {
    stats: {
      totalQuestions: raw.questionStats.totalQuestions,
      pendingQuestions: raw.questionStats.pendingQuestions,
      rejectedQuestions: raw.questionStats.rejectedQuestions,
      totalExams: raw.subjectStats.totalSubjects,
      newExamsThisMonth: raw.subjectStats[SUBJECT_KEYS[currentMonth]!],
      totalPractices: raw.problemStats.totalProblems,
      newPracticesThisMonth: raw.problemStats.approvedProblems,
      totalSlides: raw.slideStats.totalSlides,
      newSlidesThisMonth: raw.slideStats[SLIDE_KEYS[currentMonth]!],
      totalMindMaps: raw.mindMapStats.totalMindMaps,
      newMindMapsThisMonth: raw.mindMapStats[MINDMAP_KEYS[currentMonth]!],
      totalDeposited: 0,
    },
    examMonthly: MONTHS_VI.map((month, i) => ({
      month,
      count: raw.subjectStats[SUBJECT_KEYS[i]!],
    })),
    contentMonthly: MONTHS_VI.map((month, i) => ({
      month,
      slides: raw.slideStats[SLIDE_KEYS[i]!],
      mindmaps: raw.mindMapStats[MINDMAP_KEYS[i]!],
    })),
    questionStatus: {
      approved: raw.questionStats.approvedQuestions,
      pending: raw.questionStats.pendingQuestions,
      rejected: raw.questionStats.rejectedQuestions,
    },
  };
}
