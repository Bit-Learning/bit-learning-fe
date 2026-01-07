import type {
  StudentDashboardData,
  DashboardStats,
  ContinueLearning,
  EnrolledCourse,
  WeeklyProgress,
  MonthlyProgress,
  LearningStreak,
} from "../types/dashboard.type";

const mockStats: DashboardStats = {
  totalCoursesEnrolled: 8,
  totalCoursesCompleted: 3,
  totalLecturesCompleted: 156,
  totalMinutesLearned: 4820,
  certificatesEarned: 3,
};

const mockContinueLearning: ContinueLearning = {
  courseId: 1,
  courseTitle: "React & TypeScript - Xây dựng ứng dụng thực tế",
  courseThumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
  lectureId: 45,
  lectureTitle: "Custom Hooks - useDebounce và useThrottle",
  sectionTitle: "Phần 5: React Hooks nâng cao",
  progressPercent: 65,
  lastWatchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
  lastWatchedSecond: 845,
  totalDuration: 1320,
};

const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    title: "React & TypeScript - Xây dựng ứng dụng thực tế",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
    instructor: "Nguyễn Văn A",
    totalLectures: 120,
    completedLectures: 78,
    progressPercent: 65,
    lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: "Frontend",
  },
  {
    id: 2,
    title: "Node.js & Express - Backend từ cơ bản đến nâng cao",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    instructor: "Trần Văn B",
    totalLectures: 95,
    completedLectures: 95,
    progressPercent: 100,
    lastAccessedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Backend",
  },
  {
    id: 3,
    title: "Docker & Kubernetes cho Developer",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop",
    instructor: "Lê Văn C",
    totalLectures: 65,
    completedLectures: 32,
    progressPercent: 49,
    lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "DevOps",
  },
  {
    id: 4,
    title: "SQL & PostgreSQL - Thành thạo cơ sở dữ liệu",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop",
    instructor: "Phạm Thị D",
    totalLectures: 80,
    completedLectures: 80,
    progressPercent: 100,
    lastAccessedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Database",
  },
  {
    id: 5,
    title: "Git & GitHub - Làm việc nhóm hiệu quả",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=300&fit=crop",
    instructor: "Nguyễn Văn A",
    totalLectures: 45,
    completedLectures: 45,
    progressPercent: 100,
    lastAccessedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Tools",
  },
  {
    id: 6,
    title: "Next.js 14 - Fullstack Framework",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    instructor: "Hoàng Văn E",
    totalLectures: 110,
    completedLectures: 15,
    progressPercent: 14,
    lastAccessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Frontend",
  },
  {
    id: 7,
    title: "AWS Cloud Practitioner",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    instructor: "Trần Thị F",
    totalLectures: 75,
    completedLectures: 0,
    progressPercent: 0,
    lastAccessedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Cloud",
  },
  {
    id: 8,
    title: "Testing với Jest & React Testing Library",
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
    instructor: "Lê Văn C",
    totalLectures: 55,
    completedLectures: 28,
    progressPercent: 51,
    lastAccessedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Testing",
  },
];

const getWeekDates = (): WeeklyProgress[] => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const today = new Date();
  const dayOfWeek = today.getDay();

  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOfWeek + index);

    // Random data, ngày hôm nay và hôm qua có data cao hơn
    const isRecent = index >= dayOfWeek - 1 && index <= dayOfWeek;
    const baseMinutes = isRecent ? 60 : 30;
    const randomMinutes =
      index === dayOfWeek
        ? 45 // Hôm nay
        : Math.random() > 0.3
        ? Math.floor(Math.random() * baseMinutes) + 15
        : 0;

    return {
      day,
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      minutesLearned: randomMinutes,
      lecturesCompleted: randomMinutes > 0 ? Math.floor(randomMinutes / 20) + 1 : 0,
    };
  });
};

const mockWeeklyProgress: WeeklyProgress[] = getWeekDates();

const mockMonthlyProgress: MonthlyProgress[] = [
  { month: "T8", totalMinutes: 1250, totalLectures: 42, coursesCompleted: 0 },
  { month: "T9", totalMinutes: 980, totalLectures: 35, coursesCompleted: 1 },
  { month: "T10", totalMinutes: 1560, totalLectures: 52, coursesCompleted: 1 },
  { month: "T11", totalMinutes: 2100, totalLectures: 68, coursesCompleted: 1 },
  { month: "T12", totalMinutes: 1890, totalLectures: 61, coursesCompleted: 0 },
  { month: "T1", totalMinutes: 850, totalLectures: 28, coursesCompleted: 0 },
];

const mockStreak: LearningStreak = {
  currentStreak: 5,
  longestStreak: 21,
  totalDaysLearned: 87,
  lastActivityDate: new Date().toISOString(),
  weekActivity: [true, true, false, true, true, true, true], // CN -> T7
};

// Data mẫu hoàn chỉnh
export const mockDashboardData: StudentDashboardData = {
  stats: mockStats,
  continueLearning: mockContinueLearning,
  enrolledCourses: mockEnrolledCourses,
  weeklyProgress: mockWeeklyProgress,
  monthlyProgress: mockMonthlyProgress,
  streak: mockStreak,
};

// Trường hợp user mới, chưa có data
export const mockEmptyDashboardData: StudentDashboardData = {
  stats: {
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    totalLecturesCompleted: 0,
    totalMinutesLearned: 0,
    certificatesEarned: 0,
  },
  continueLearning: null,
  enrolledCourses: [],
  weeklyProgress: getWeekDates().map((d) => ({ ...d, minutesLearned: 0, lecturesCompleted: 0 })),
  monthlyProgress: mockMonthlyProgress.map((m) => ({ ...m, totalMinutes: 0, totalLectures: 0, coursesCompleted: 0 })),
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLearned: 0,
    lastActivityDate: "",
    weekActivity: [false, false, false, false, false, false, false],
  },
};

// Helper function để sử dụng trong development
export const getMockDashboard = (isEmpty = false): Promise<StudentDashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(isEmpty ? mockEmptyDashboardData : mockDashboardData);
    }, 500); // Simulate API delay
  });
};
