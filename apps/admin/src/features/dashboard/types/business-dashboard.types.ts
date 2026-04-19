export type DashboardPreset = "3m" | "6m" | "12m";
export type DashboardGranularity = "day" | "week" | "month";
export type TransactionType = "PURCHASE" | "DEPOSIT" | "AI_REQUEST";
export type TransactionStatus = "COMPLETED" | "FAILED" | "PENDING";

export interface BusinessDashboardFilterParams {
	preset?: DashboardPreset;
	fromDate?: string;
	toDate?: string;
	granularity?: DashboardGranularity;
	transactionTypes?: TransactionType[];
	statuses?: TransactionStatus[];
	timezone?: string;
}

export interface BusinessDashboardFilterResponse {
	preset?: string | null;
	fromDate: string;
	toDate: string;
	granularity: DashboardGranularity;
	timezone: string;
}

export interface BusinessDashboardSummary {
	totalUsers: number;
	activeUsers: number;
	newUsersInRange: number;
	totalOrders: number;
	ordersInRange: number;
	completedOrdersInRange: number;
	totalTransactionsInRange: number;
	successfulTransactionsInRange: number;
	failedTransactionsInRange: number;
	revenueInRange: number;
	totalRevenueAllTime: number;
}

export interface BusinessDashboardRevenuePoint {
	bucketLabel: string;
	bucketStart: string;
	bucketEnd: string;
	revenue: number;
}

export interface BusinessDashboardOverview {
	filter: BusinessDashboardFilterResponse;
	summary: BusinessDashboardSummary;
	revenueTrend: BusinessDashboardRevenuePoint[];
	transactionTypeBreakdown: Record<string, number>;
	transactionStatusBreakdown: Record<string, number>;
	orderStatusBreakdown: Record<string, number>;
	userRoleBreakdown: Record<string, number>;
	generatedAt: string;
}

export interface BusinessDashboardRevenueDetailRow {
	transactionId: number;
	transactionCode: string;
	userId: number;
	userEmail: string;
	orderId?: number | null;
	orderCode?: string | null;
	amount: number;
	type: TransactionType;
	status: TransactionStatus;
	paymentMethod?: string | null;
	createdAt: string;
}
