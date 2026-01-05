import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdersDialogs } from "./components/orders-dialogs";
import { OrdersProvider } from "./components/orders-provider";
import { OrdersTable } from "./components/orders-table";
import { useFetchAllOrders } from "./hook/useOrder";

export function Orders() {
	const { data: orders, isLoading } = useFetchAllOrders();

	// Convert date strings to Date objects to match schema
	const formattedOrders = orders?.map((order) => ({
		...order,
		createdAt: new Date(order.createdAt),
		updatedAt: new Date(order.updatedAt),
	}));

	return (
		<OrdersProvider>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-4 sm:gap-6">
				<div className="flex flex-wrap items-end justify-between gap-2">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Order Management
						</h2>
						<p className="text-muted-foreground">
							View and manage all orders from customers.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">
							Total: <strong>{formattedOrders?.length || 0}</strong> orders
						</span>
					</div>
				</div>
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-96 w-full" />
					</div>
				) : (
					<OrdersTable data={formattedOrders || []} />
				)}
			</Main>

			<OrdersDialogs />
		</OrdersProvider>
	);
}
