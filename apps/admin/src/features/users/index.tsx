import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Activity, UserPlus, Users as UsersIcon } from "lucide-react";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";
import { getAllDashboardStats } from "@/features/dashboard/api/dashboard-api";
import { GetPagedUsers } from "./api/UserService";
import { UsersDialogs } from "./components/users-dialogs";
import { UsersPrimaryButtons } from "./components/users-primary-buttons";
import { UsersProvider } from "./components/users-provider";
import { UsersTable } from "./components/users-table";

const route = getRouteApi("/_authenticated/users/");

export function Users() {
	const search = route.useSearch();
	const navigate = route.useNavigate();

	const page = (search.page || 1) - 1;
	const pageSize = search.pageSize || 10;

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["users", page, pageSize],
		queryFn: () => GetPagedUsers({ page, size: pageSize }),
	});

	const users = data?.data?.content || [];
	const totalElements = data?.data?.totalElements || 0;

	const {
		data: dashboardStats,
		isLoading: isStatsLoading,
		isError: isStatsError,
	} = useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: getAllDashboardStats,
		staleTime: 5 * 60 * 1000,
	});

	const userStats = dashboardStats?.users;

	return (
		<UsersProvider>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-4 sm:gap-6 p-8">
				<div className="flex flex-wrap items-end justify-between gap-2">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Quản lí người dùng
						</h2>
						<p className="text-muted-foreground text-sm">
							Quản lí tất cả người dùng trong hệ thống
						</p>
					</div>
					<UsersPrimaryButtons />
				</div>

				<div className="space-y-4">
					{isStatsLoading && (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<Card key={i}>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-4" />
									</CardHeader>
									<CardContent>
										<Skeleton className="mb-2 h-8 w-32" />
										<Skeleton className="h-3 w-40" />
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{!isStatsLoading && userStats && (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{[
								{
									title: "Tổng người dùng",
									value: userStats.totalUsers.toLocaleString("vi-VN"),
									description: "Tổng số tài khoản trong hệ thống",
									icon: UsersIcon,
									iconColor: "text-purple-600",
									bgColor: "bg-purple-100 dark:bg-purple-950",
								},
								{
									title: "Người dùng hoạt động",
									value: userStats.activeUsers.toLocaleString("vi-VN"),
									description: `${((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% tổng người dùng`,
									icon: Activity,
									iconColor: "text-green-600",
									bgColor: "bg-green-100 dark:bg-green-950",
								},
								{
									title: "Người dùng mới (tháng)",
									value: `+${userStats.newUsersThisMonth.toLocaleString("vi-VN")}`,
									description: `Hôm nay: +${userStats.newUsersToday.toLocaleString("vi-VN")} · Tuần này: +${userStats.newUsersThisWeek.toLocaleString("vi-VN")}`,
									icon: UserPlus,
									iconColor: "text-orange-600",
									bgColor: "bg-orange-100 dark:bg-orange-950",
								},
							].map((stat, index) => {
								const Icon = stat.icon;
								return (
									<Card key={index}>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-medium">
												{stat.title}
											</CardTitle>
											<div className={`rounded-lg p-2 ${stat.bgColor}`}>
												<Icon className={`h-4 w-4 ${stat.iconColor}`} />
											</div>
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">{stat.value}</div>
											<p className="text-muted-foreground text-xs">
												{stat.description}
											</p>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}

					{!isStatsLoading && isStatsError && !userStats && (
						<div className="text-muted-foreground text-sm">
							Không thể tải thống kê người dùng.
						</div>
					)}
				</div>

				{isLoading && (
					<div className="flex h-100 items-center justify-center">
						<div className="text-muted-foreground">Loading users...</div>
					</div>
				)}

				{isError && (
					<div className="flex h-100 items-center justify-center">
						<div className="text-destructive">
							Error loading users:{" "}
							{error instanceof Error ? error.message : "Unknown error"}
						</div>
					</div>
				)}

				{!isLoading && !isError && (
					<UsersTable data={users} search={search} navigate={navigate} />
				)}
			</Main>

			<UsersDialogs />
		</UsersProvider>
	);
}
