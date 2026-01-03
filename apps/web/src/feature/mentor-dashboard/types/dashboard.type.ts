export interface DashboardStats {
	totalCourses: number;
	totalStudents: number;
	totalEarnings: number;
	monthlyGrowth: number;
}

export interface RevenueData {
	month: string;
	revenue: number;
	students: number;
}

export interface CoursePerformance {
	name: string;
	students: number;
	rating: number;
	completion: number;
}

export interface StudentDistribution {
	name: string;
	value: number;
	color: string;
}

export interface RecentQuestion {
	id: number;
	student: string;
	course: string;
	question: string;
	time: string;
	status: "pending" | "answered";
}

export interface QuickAction {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	href: string;
	color: string;
}
