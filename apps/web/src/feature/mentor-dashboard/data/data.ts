import type {
  MentorDashboardStats,
  MonthlyCount,
  QuestionStatusData,
  ContentMonthlyData,
  RecentQuestion,
} from "../types/dashboard.type";

export const mockStats: MentorDashboardStats = {
  totalQuestions: 1248,
  pendingQuestions: 42,
  rejectedQuestions: 58,
  totalExams: 87,
  newExamsThisMonth: 6,
  totalPractices: 134,
  newPracticesThisMonth: 11,
  totalSlides: 56,
  newSlidesThisMonth: 4,
  totalMindMaps: 39,
  newMindMapsThisMonth: 3,
  totalDeposited: 82500,
};

export const mockQuestionStatus: QuestionStatusData = {
  approved: 1148,
  pending: 42,
  rejected: 58,
};

export const mockExamMonthly: MonthlyCount[] = [
  { month: "T1", count: 4 },
  { month: "T2", count: 6 },
  { month: "T3", count: 3 },
  { month: "T4", count: 7 },
  { month: "T5", count: 5 },
  { month: "T6", count: 9 },
  { month: "T7", count: 6 },
  { month: "T8", count: 11 },
  { month: "T9", count: 8 },
  { month: "T10", count: 10 },
  { month: "T11", count: 12 },
  { month: "T12", count: 7 },
];

export const mockContentMonthly: ContentMonthlyData[] = [
  { month: "T1", slides: 2, mindmaps: 1 },
  { month: "T2", slides: 3, mindmaps: 2 },
  { month: "T3", slides: 1, mindmaps: 1 },
  { month: "T4", slides: 4, mindmaps: 3 },
  { month: "T5", slides: 2, mindmaps: 2 },
  { month: "T6", slides: 5, mindmaps: 4 },
  { month: "T7", slides: 3, mindmaps: 2 },
  { month: "T8", slides: 6, mindmaps: 5 },
  { month: "T9", slides: 4, mindmaps: 3 },
  { month: "T10", slides: 5, mindmaps: 4 },
  { month: "T11", slides: 7, mindmaps: 6 },
  { month: "T12", slides: 4, mindmaps: 3 },
];

export const mockRecentQuestions: RecentQuestion[] = [
  {
    id: 1,
    student: "Nguyễn Minh Anh",
    course: "Python cơ bản - Lớp 10",
    question: "Thầy ơi, em không hiểu vòng lặp while khác gì vòng lặp for ạ?",
    time: "5 phút trước",
    status: "pending",
  },
  {
    id: 2,
    student: "Trần Gia Bảo",
    course: "Scratch cơ bản - Lớp 4,5",
    question: "Làm sao để nhân vật di chuyển theo chuột ạ thầy?",
    time: "12 phút trước",
    status: "pending",
  },
  {
    id: 3,
    student: "Lê Thị Mai",
    course: "Lập trình C++ - Lớp 11",
    question: "Em bị lỗi segmentation fault khi chạy đệ quy, thầy giúp em với",
    time: "45 phút trước",
    status: "answered",
  },
  {
    id: 4,
    student: "Phạm Đức Huy",
    course: "Cấu trúc dữ liệu & Giải thuật",
    question: "Thầy có thể giải thích thêm về độ phức tạp O(n log n) không ạ?",
    time: "1 giờ trước",
    status: "pending",
  },
];
