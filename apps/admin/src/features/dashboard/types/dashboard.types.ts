export interface UserDashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  roleBreakdown: Record<string, number>;
}

export interface OrderDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  revenueThisMonth: number;
  statusBreakdown: Record<string, number>;
}

export interface MonthlyRevenue {
  month: number;
  revenue: number;
}

export interface PaymentDashboardStats {
  totalTransactions: number;
  totalRevenue: number;
  revenueThisMonth: number;
  successfulTransactions: number;
  failedTransactions: number;
  statusBreakdown: Record<string, number>;
  depositTransactions: number;
  aiRequestTransactions: number;
  purchaseTransactions: number;
  typeBreakdown: Record<string, number>;
  monthlyRevenue: MonthlyRevenue[];
}

export interface DashboardStats {
  orders: OrderDashboardStats;
  users: UserDashboardStats;
  payments: PaymentDashboardStats;
  refreshedAt?: string;
}

export interface CourseStats {
  totalCourses: number;
  newCoursesThisMonth: number;
  activeCourses: number;
  monthlyNewCourses: MonthlyCount[];
}

export interface MonthlyCount {
  month: number;
  count: number;
}

export interface PostStats {
  totalPosts: number;
  activePosts: number;
  bannedPosts: number;
}

export interface QuestionStats {
  totalQuestions: number;
  byGrade: GradeCount[];
}

export interface GradeCount {
  grade: number;
  count: number;
}

export interface ContestStats {
  totalContests: number;
  ongoingContests: number;
  upcomingContests: number;
  endedContests: number;
}

export interface GameStats {
  totalGames: number;
  totalPlays: number;
}

export interface ManagerDashboardStats {
  courses: CourseStats;
  posts: PostStats;
  questions: QuestionStats;
  contests: ContestStats;
  games: GameStats;
}
