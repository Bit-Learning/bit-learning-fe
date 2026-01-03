import type {
	CoursePerformance,
	DashboardStats,
	RecentQuestion,
	RevenueData,
	StudentDistribution,
} from "../types/dashboard.type";

export const mockStats: DashboardStats = {
	totalCourses: 15,
	totalStudents: 2156,
	totalEarnings: 68500000,
	monthlyGrowth: 18.2,
};

export const mockRevenueData: RevenueData[] = [
	{ month: "T1", revenue: 4200000, students: 125 },
	{ month: "T2", revenue: 5100000, students: 148 },
	{ month: "T3", revenue: 4800000, students: 136 },
	{ month: "T4", revenue: 6200000, students: 172 },
	{ month: "T5", revenue: 5800000, students: 165 },
	{ month: "T6", revenue: 7100000, students: 198 },
	{ month: "T7", revenue: 8500000, students: 245 },
	{ month: "T8", revenue: 9200000, students: 268 },
	{ month: "T9", revenue: 7800000, students: 215 },
	{ month: "T10", revenue: 8100000, students: 228 },
	{ month: "T11", revenue: 7500000, students: 205 },
	{ month: "T12", revenue: 9200000, students: 251 },
];

export const mockCoursePerformance: CoursePerformance[] = [
	{
		name: "Python cơ bản - Lớp 10",
		students: 342,
		rating: 4.8,
		completion: 78,
	},
	{
		name: "Lập trình C++ - Lớp 11",
		students: 287,
		rating: 4.7,
		completion: 72,
	},
	{
		name: "Cấu trúc dữ liệu & Giải thuật",
		students: 198,
		rating: 4.9,
		completion: 65,
	},
	{
		name: "Scratch nâng cao - Lớp 8",
		students: 425,
		rating: 4.8,
		completion: 85,
	},
	{
		name: "Python cho THCS - Lớp 9",
		students: 312,
		rating: 4.6,
		completion: 80,
	},
	{
		name: "Scratch cơ bản - Lớp 4,5",
		students: 568,
		rating: 4.9,
		completion: 92,
	},
];

export const mockStudentDistribution: StudentDistribution[] = [
	{ name: "Tiểu học (Lớp 3-5)", value: 724, color: "#22C55E" },
	{ name: "THCS (Lớp 6-9)", value: 856, color: "#3B82F6" },
	{ name: "THPT (Lớp 10-12)", value: 576, color: "#8B5CF6" },
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
	{
		id: 5,
		student: "Hoàng Yến Nhi",
		course: "Scratch nâng cao - Lớp 8",
		question: "Em muốn làm game bắn súng như thầy demo, bắt đầu từ đâu ạ?",
		time: "2 giờ trước",
		status: "answered",
	},
	{
		id: 6,
		student: "Võ Thanh Tùng",
		course: "Python cho THCS - Lớp 9",
		question: "List và Tuple khác nhau chỗ nào vậy thầy?",
		time: "3 giờ trước",
		status: "pending",
	},
];
