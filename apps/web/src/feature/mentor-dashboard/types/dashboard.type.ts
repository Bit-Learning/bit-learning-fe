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

export interface QuestionStatusData {
  approved: number;
  pending: number;
  rejected: number;
}

export interface ContentMonthlyData {
  month: string;
  slides: number;
  mindmaps: number;
}

export interface RecentQuestion {
  id: number;
  student: string;
  course: string;
  question: string;
  time: string;
  status: "pending" | "answered";
}
