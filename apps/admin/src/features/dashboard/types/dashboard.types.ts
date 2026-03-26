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
