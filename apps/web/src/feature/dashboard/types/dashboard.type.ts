export interface EnrolledCourse {
  id: number;
  title: string;
  thumbnail: string;
  instructor: string;
  totalLectures: number;
  completedLectures: number;
  progressPercent: number;
  lastAccessedAt: string;
  category: string;
}

export interface ContinueLearning {
  courseId: number;
  courseTitle: string;
  courseThumbnail: string;
  lectureId: number;
  lectureTitle: string;
  sectionTitle: string;
  progressPercent: number;
  lastWatchedAt: string;
  lastWatchedSecond: number;
  totalDuration: number;
}

export interface WeeklyProgress {
  day: string;
  date: string;
  minutesLearned: number;
  lecturesCompleted: number;
}

export interface MonthlyProgress {
  month: string;
  totalMinutes: number;
  totalLectures: number;
  coursesCompleted: number;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  totalDaysLearned: number;
  lastActivityDate: string;
  weekActivity: boolean[];
}

export interface DashboardStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLecturesCompleted: number;
  totalMinutesLearned: number;
  certificatesEarned: number;
}

export interface StudentDashboardData {
  stats: DashboardStats;
  continueLearning: ContinueLearning | null;
  enrolledCourses: EnrolledCourse[];
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
  streak: LearningStreak;
}
