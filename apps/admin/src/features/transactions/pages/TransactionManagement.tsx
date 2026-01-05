import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	DollarSign,
	TrendingDown,
	TrendingUp,
	Wallet,
} from "lucide-react";
import React from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePagedTransactions } from "../hooks/useTransactions";
import type {
	Transaction,
	TransactionStatus,
	TransactionType,
} from "../types/transaction.types";

export function TransactionManagement() {
	const [page, setPage] = React.useState(0);
	const [pageSize, setPageSize] = React.useState(20);
	const [sortBy, setSortBy] = React.useState("id");
	const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
		"desc",
	);
	const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
	const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

	const { data, isLoading, isError } = usePagedTransactions({
		page,
		size: pageSize,
		sortBy,
		sortDirection,
	});

	// Filter transactions based on selected filters
	const filteredTransactions = React.useMemo(() => {
		if (!data?.content) return [];

		return data.content.filter((transaction) => {
			const typeMatch = typeFilter === "ALL" || transaction.type === typeFilter;
			const statusMatch =
				statusFilter === "ALL" || transaction.status === statusFilter;
			return typeMatch && statusMatch;
		});
	}, [data?.content, typeFilter, statusFilter]);

	// Calculate statistics
	const stats = React.useMemo(() => {
		if (!data?.content || data.content.length === 0) {
			return {
				totalTransactions: 0,
				totalDeposit: 0,
				totalSpent: 0,
				completedCount: 0,
				pendingCount: 0,
				failedCount: 0,
			};
		}

		return data.content.reduce(
			(acc, transaction) => {
				if (
					transaction.type === "DEPOSIT" &&
					transaction.status === "COMPLETED"
				) {
					acc.totalDeposit += transaction.amount;
				}
				if (
					(transaction.type === "PURCHASE" ||
						transaction.type === "AI_REQUEST") &&
					transaction.status === "COMPLETED"
				) {
					acc.totalSpent += transaction.amount;
				}
				if (transaction.status === "COMPLETED") acc.completedCount++;
				if (transaction.status === "PENDING") acc.pendingCount++;
				if (transaction.status === "FAILED") acc.failedCount++;
				acc.totalTransactions++;
				return acc;
			},
			{
				totalTransactions: 0,
				totalDeposit: 0,
				totalSpent: 0,
				completedCount: 0,
				pendingCount: 0,
				failedCount: 0,
			},
		);
	}, [data?.content]);

	const getStatusBadge = (status: TransactionStatus) => {
		switch (status) {
			case "COMPLETED":
				return (
					<Badge variant="default" className="bg-green-600">
						Completed
					</Badge>
				);
			case "PENDING":
				return <Badge variant="secondary">Pending</Badge>;
			case "FAILED":
				return <Badge variant="destructive">Failed</Badge>;
			default:
				return <Badge>{status}</Badge>;
		}
	};

	const getTypeBadge = (type: TransactionType) => {
		switch (type) {
			case "DEPOSIT":
				return (
					<Badge variant="outline" className="border-green-500 text-green-600">
						Deposit
					</Badge>
				);
			case "PURCHASE":
				return (
					<Badge variant="outline" className="border-blue-500 text-blue-600">
						Purchase
					</Badge>
				);
			case "AI_REQUEST":
				return (
					<Badge
						variant="outline"
						className="border-purple-500 text-purple-600"
					>
						AI Request
					</Badge>
				);
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("vi-VN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleSort = (column: string) => {
		if (sortBy === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortDirection("desc");
		}
		setPage(0);
	};

	const totalPages = data?.totalPages || 0;

	return (
		<>
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
							Transaction Management
						</h2>
						<p className="text-muted-foreground">
							Manage and monitor all payment transactions
							{!isLoading &&
								` (${data?.totalElements || 0} total transactions)`}
						</p>
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Transactions
							</CardTitle>
							<Wallet className="text-muted-foreground h-4 w-4" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.totalTransactions}
							</div>
							<p className="text-muted-foreground text-xs">
								{stats.completedCount} completed, {stats.pendingCount} pending,{" "}
								{stats.failedCount} failed
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Deposits
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{formatCurrency(stats.totalDeposit)}
							</div>
							<p className="text-muted-foreground text-xs">
								Money added to wallets
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Spent</CardTitle>
							<TrendingDown className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">
								{formatCurrency(stats.totalSpent)}
							</div>
							<p className="text-muted-foreground text-xs">
								Purchases & AI requests
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
							<DollarSign className="text-muted-foreground h-4 w-4" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(stats.totalSpent)}
							</div>
							<p className="text-muted-foreground text-xs">
								Revenue from sales
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
						<CardDescription>
							Filter transactions by type and status
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-4">
						<div className="flex items-center gap-2">
							<label htmlFor="type-filter" className="text-sm font-medium">
								Type:
							</label>
							<Select value={typeFilter} onValueChange={setTypeFilter}>
								<SelectTrigger id="type-filter" className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Types</SelectItem>
									<SelectItem value="DEPOSIT">Deposit</SelectItem>
									<SelectItem value="PURCHASE">Purchase</SelectItem>
									<SelectItem value="AI_REQUEST">AI Request</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2">
							<label htmlFor="status-filter" className="text-sm font-medium">
								Status:
							</label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger id="status-filter" className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Status</SelectItem>
									<SelectItem value="COMPLETED">Completed</SelectItem>
									<SelectItem value="PENDING">Pending</SelectItem>
									<SelectItem value="FAILED">Failed</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2">
							<label htmlFor="page-size" className="text-sm font-medium">
								Page Size:
							</label>
							<Select
								value={pageSize.toString()}
								onValueChange={(value) => {
									setPageSize(Number(value));
									setPage(0);
								}}
							>
								<SelectTrigger id="page-size" className="w-[100px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="100">100</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Transactions Table */}
				<Card>
					<CardHeader>
						<CardTitle>Transactions</CardTitle>
						<CardDescription>
							{filteredTransactions.length} transactions displayed
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading && (
							<div className="flex h-[400px] items-center justify-center">
								<div className="text-muted-foreground">
									Loading transactions...
								</div>
							</div>
						)}

						{isError && (
							<div className="flex h-[400px] items-center justify-center">
								<div className="text-destructive">
									Error loading transactions
								</div>
							</div>
						)}

						{!isLoading && !isError && (
							<>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead
													className="cursor-pointer"
													onClick={() => handleSort("id")}
												>
													<div className="flex items-center gap-1">
														ID
														<ArrowUpDown className="h-4 w-4" />
													</div>
												</TableHead>
												<TableHead>Wallet ID</TableHead>
												<TableHead>Order ID</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Status</TableHead>
												<TableHead
													className="cursor-pointer text-right"
													onClick={() => handleSort("amount")}
												>
													<div className="flex items-center justify-end gap-1">
														Amount
														<ArrowUpDown className="h-4 w-4" />
													</div>
												</TableHead>
												<TableHead
													className="cursor-pointer"
													onClick={() => handleSort("createdAt")}
												>
													<div className="flex items-center gap-1">
														Created At
														<ArrowUpDown className="h-4 w-4" />
													</div>
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredTransactions.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={7}
														className="text-muted-foreground text-center"
													>
														No transactions found
													</TableCell>
												</TableRow>
											) : (
												filteredTransactions.map((transaction: Transaction) => (
													<TableRow key={transaction.id}>
														<TableCell className="font-medium">
															{transaction.id}
														</TableCell>
														<TableCell>{transaction.walletId}</TableCell>
														<TableCell>{transaction.orderId || "-"}</TableCell>
														<TableCell>
															{getTypeBadge(transaction.type)}
														</TableCell>
														<TableCell>
															{getStatusBadge(transaction.status)}
														</TableCell>
														<TableCell className="text-right font-medium">
															{formatCurrency(transaction.amount)}
														</TableCell>
														<TableCell>
															{formatDate(transaction.createdAt)}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>

								{/* Pagination */}
								<div className="flex items-center justify-between pt-4">
									<div className="text-muted-foreground text-sm">
										Page {page + 1} of {totalPages} ({data?.totalElements || 0}{" "}
										total)
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(page - 1)}
											disabled={page === 0}
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(page + 1)}
											disabled={page >= totalPages - 1}
										>
											Next
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</Main>
		</>
	);
}
