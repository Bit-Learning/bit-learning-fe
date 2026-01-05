/**
 * Dashboard statistics types
 */

/**
 * Order dashboard statistics
 */
export interface OrderDashboardStats {
	totalOrders: number;
	totalRevenue: number;
	revenueThisMonth: number;
	statusBreakdown: Record<string, number>;
}

/**
 * User dashboard statistics
 */
export interface UserDashboardStats {
	totalUsers: number;
	newUsersToday: number;
	newUsersThisWeek: number;
	newUsersThisMonth: number;
	activeUsers: number;
}

/**
 * Monthly revenue data point
 */
export interface MonthlyRevenue {
	month: number; // 1-12 (Jan-Dec)
	monthName?: string; // "January", "February", etc. (optional)
	revenue: number; // Revenue for that month
}

/**
 * Payment dashboard statistics
 */
export interface PaymentDashboardStats {
	totalTransactions: number;
	totalRevenue: number;
	revenueThisMonth: number;
	successfulTransactions: number;
	failedTransactions: number;
	statusBreakdown: Record<string, number>;
	// Transaction type breakdown
	depositTransactions: number; // Nạp tiền vào hệ thống (doanh thu)
	aiRequestTransactions: number; // Số lượng request cho AI
	purchaseTransactions: number; // Đơn mua hàng
	typeBreakdown: Record<string, number>;
	// Monthly revenue for chart (all months in current year)
	monthlyRevenue: MonthlyRevenue[];
}

/**
 * Combined dashboard stats
 */
export interface DashboardStats {
	orders: OrderDashboardStats;
	users: UserDashboardStats;
	payments: PaymentDashboardStats;
}
