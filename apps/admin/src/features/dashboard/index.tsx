import { useQuery } from "@tanstack/react-query";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllDashboardStats } from "./api/dashboard-api";
import { Analytics } from "./components/analytics";
import { OrderStatsTab } from "./components/order-stats-tab";
import { PaymentStatsTab } from "./components/payment-stats-tab";
import { StatsCards } from "./components/stats-cards";
import { UserStatsTab } from "./components/user-stats-tab";

export function Dashboard() {
	// Fetch dashboard statistics
	const { data: dashboardStats, isLoading } = useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: getAllDashboardStats,
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	return (
		<>
			{/* ===== Top Heading ===== */}
			<Header>
				<TopNav links={topNav} />
				<div className="ms-auto flex items-center space-x-4">
					<Search />
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			{/* ===== Main ===== */}
			<Main>
				<div className="mb-2 flex items-center justify-between space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">Bảng điều khiển</h1>
					<div className="flex items-center space-x-2">
						<Button>Tải xuống</Button>
					</div>
				</div>
				<Tabs
					orientation="vertical"
					defaultValue="overview"
					className="space-y-4"
				>
					<div className="w-full overflow-x-auto pb-2">
						<TabsList>
							<TabsTrigger value="overview">Tổng quan</TabsTrigger>
							<TabsTrigger value="orders">Đơn hàng</TabsTrigger>
							<TabsTrigger value="users">Người dùng</TabsTrigger>
							<TabsTrigger value="payments">Thanh toán</TabsTrigger>
							<TabsTrigger value="analytics">Phân tích</TabsTrigger>
						</TabsList>
					</div>

					{/* Overview Tab - Quick summary from all services */}
					<TabsContent value="overview" className="space-y-4">
						<StatsCards data={dashboardStats} isLoading={isLoading} />
					</TabsContent>

					{/* Orders Tab */}
					<TabsContent value="orders" className="space-y-4">
						<OrderStatsTab
							data={dashboardStats?.orders}
							isLoading={isLoading}
						/>
					</TabsContent>

					{/* Users Tab */}
					<TabsContent value="users" className="space-y-4">
						<UserStatsTab data={dashboardStats?.users} isLoading={isLoading} />
					</TabsContent>

					{/* Payments Tab */}
					<TabsContent value="payments" className="space-y-4">
						<PaymentStatsTab
							data={dashboardStats?.payments}
							isLoading={isLoading}
						/>
					</TabsContent>

					{/* Analytics Tab */}
					<TabsContent value="analytics" className="space-y-4">
						<Analytics />
					</TabsContent>
				</Tabs>
			</Main>
		</>
	);
}

const topNav = [
	{
		title: "Tổng quan",
		href: "dashboard/overview",
		isActive: true,
		disabled: false,
	},
	{
		title: "Khách hàng",
		href: "dashboard/customers",
		isActive: false,
		disabled: true,
	},
	{
		title: "Sản phẩm",
		href: "dashboard/products",
		isActive: false,
		disabled: true,
	},
	{
		title: "Cài đặt",
		href: "dashboard/settings",
		isActive: false,
		disabled: true,
	},
];
