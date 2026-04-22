import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { type OnChangeFn, type PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { Header } from "@/layout/header";
import { getUserProfileById } from "@/features/users/api/UserService";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminTransactions } from "../api/transaction.api";
import { TransactionsMultiSelect } from "../components/TransactionsMultiSelect";
import { TransactionsTable } from "../components/TransactionsTable";
import { UserLookupCombobox } from "../components/UserLookupCombobox";
import {
	transactionStatusOptions,
	transactionTypeOptions,
} from "../types/transaction.type";
import { Field, FieldLabel } from "@/components/ui/field";

const route = getRouteApi("/_authenticated/transactions/");

export function TransactionsPage() {
	const search = route.useSearch();
	const navigate = route.useNavigate();

	const page = Math.max((search.page ?? 1) - 1, 0);
	const pageSize = search.pageSize ?? 10;
	const currentCode = search.code ?? "";
	const [codeInput, setCodeInput] = useState(currentCode);

	useEffect(() => {
		setCodeInput(currentCode);
	}, [currentCode]);

	useEffect(() => {
		const trimmedCode = codeInput.trim();
		if (trimmedCode === currentCode) {
			return;
		}

		const timer = window.setTimeout(() => {
			navigate({
				search: (prev) => ({
					...prev,
					code: trimmedCode || undefined,
					page: undefined,
				}),
				replace: true,
			});
		}, 300);

		return () => window.clearTimeout(timer);
	}, [codeInput, currentCode, navigate]);

	const transactionsQuery = useQuery({
		queryKey: [
			"admin-transactions",
			page,
			pageSize,
			search.userId,
			search.type,
			search.status,
			currentCode,
			search.fromDate,
			search.toDate,
		],
		queryFn: () =>
			getAdminTransactions({
				page,
				size: pageSize,
				userId: search.userId,
				type: search.type,
				status: search.status,
				code: currentCode,
				fromDate: search.fromDate || undefined,
				toDate: search.toDate || undefined,
			}),
		placeholderData: (previousData) => previousData,
	});

	const hydratedUserQuery = useQuery({
		queryKey: ["admin-transaction-user", search.userId],
		queryFn: async () => {
			if (!search.userId) {
				return null;
			}

			try {
				const response = await getUserProfileById(search.userId);
				const user = response.data.data;
				return {
					id: user.id,
					fullName: `${user.firstName} ${user.lastName}`.trim(),
					email: user.email,
					avatar: user.avatar ?? null,
				};
			} catch {
				return null;
			}
		},
		enabled: typeof search.userId === "number" && search.userId > 0,
		retry: false,
	});

	useEffect(() => {
		const totalPages = transactionsQuery.data?.page?.totalPages ?? 0;
		if (totalPages > 0 && page >= totalPages) {
			navigate({
				search: (prev) => ({
					...prev,
					page: totalPages <= 1 ? undefined : totalPages,
				}),
				replace: true,
			});
		}
	}, [navigate, page, transactionsQuery.data?.page?.totalPages]);

	const selectedUser = hydratedUserQuery.data ?? null;
	const transactions = transactionsQuery.data?.data ?? [];
	const pageInfo = transactionsQuery.data?.page;

	const fromDate = parseSearchDate(search.fromDate);
	const toDate = parseSearchDate(search.toDate);

	const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
		const nextState =
			typeof updater === "function"
				? updater({ pageIndex: page, pageSize })
				: updater;

		navigate({
			search: (prev) => ({
				...prev,
				page: nextState.pageIndex <= 0 ? undefined : nextState.pageIndex + 1,
				pageSize: nextState.pageSize === 10 ? undefined : nextState.pageSize,
			}),
		});
	};

	const activeFilterCount = useMemo(() => {
		return [
			search.userId,
			...(search.type ?? []),
			...(search.status ?? []),
			search.fromDate,
			search.toDate,
			currentCode.trim() ? "code" : undefined,
		].filter(Boolean).length;
	}, [
		currentCode,
		search.fromDate,
		search.status,
		search.toDate,
		search.type,
		search.userId,
	]);

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-6 p-6">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Tra cứu giao dịch
						</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Tra cứu giao dịch toàn hệ thống theo người dùng, loại giao dịch,
							trạng thái, thời gian và mã giao dịch.
						</p>
					</div>
					<div className="flex items-center gap-2 text-lg">
						<span>
							Tổng {pageInfo?.totalElements?.toLocaleString("vi-VN") ?? 0} giao
							dịch
						</span>
						{transactionsQuery.isFetching ? (
							<span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
								<LoaderCircle className="size-3.5 animate-spin" />
								Đang cập nhật
							</span>
						) : null}
					</div>
				</div>

				<Card className="border border-border/70 shadow-sm">
					<CardHeader className="pb-4">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<CardTitle className="text-base">Bộ lọc giao dịch</CardTitle>
								<p className="text-muted-foreground mt-1 text-sm">
									{activeFilterCount > 0
										? `${activeFilterCount} bộ lọc đang được áp dụng`
										: "Chưa áp dụng bộ lọc nào"}
								</p>
							</div>
							<Button
								variant="outline"
								className="h-9 gap-2"
								onClick={() => {
									setCodeInput("");
									navigate({
										search: (prev) => ({
											...prev,
											userId: undefined,
											type: undefined,
											status: undefined,
											code: undefined,
											fromDate: undefined,
											toDate: undefined,
											page: undefined,
										}),
									});
								}}
							>
								<RotateCcw className="size-4" />
								Xóa bộ lọc
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
							<UserLookupCombobox
								value={selectedUser}
								onChange={(user) => {
									navigate({
										search: (prev) => ({
											...prev,
											userId: user?.id,
											page: undefined,
										}),
									});
								}}
							/>

							<TransactionsMultiSelect
								title="Loại giao dịch"
								options={transactionTypeOptions}
								selectedValues={search.type ?? []}
								onChange={(values) => {
									navigate({
										search: (prev) => ({
											...prev,
											type: values.length ? values : undefined,
											page: undefined,
										}),
									});
								}}
							/>

							<TransactionsMultiSelect
								title="Trạng thái"
								options={transactionStatusOptions}
								selectedValues={search.status ?? []}
								onChange={(values) => {
									navigate({
										search: (prev) => ({
											...prev,
											status: values.length ? values : undefined,
											page: undefined,
										}),
									});
								}}
							/>

							<Input
								value={codeInput}
								onChange={(event) => setCodeInput(event.target.value)}
								placeholder="Tìm theo mã giao dịch..."
								className="h-9"
							/>
						</div>

						<div className="grid gap-3 sm:grid-cols-2 xl:max-w-[28rem]">
							<Field className="flex flex-col gap-2">
								<FieldLabel htmlFor="from-date">Từ ngày</FieldLabel>
								<DatePicker
									selected={fromDate}
									onSelect={(date) => {
										navigate({
											search: (prev) => ({
												...prev,
												fromDate: formatSearchDate(date),
												page: undefined,
											}),
										});
									}}
									placeholder="Chọn ngày bắt đầu"
								/>
							</Field>

							<Field className="flex flex-col gap-2">
								<FieldLabel htmlFor="to-date">Đến ngày</FieldLabel>
								<DatePicker
									selected={toDate}
									onSelect={(date) => {
										navigate({
											search: (prev) => ({
												...prev,
												toDate: formatSearchDate(date),
												page: undefined,
											}),
										});
									}}
									placeholder="Chọn ngày kết thúc"
								/>
							</Field>
						</div>
					</CardContent>
				</Card>

				{transactionsQuery.isLoading && !transactionsQuery.data ? (
					<Card className="border border-border/70 shadow-sm">
						<CardContent className="space-y-3 p-6">
							{Array.from({ length: 8 }).map((_, index) => (
								<Skeleton key={index} className="h-12 w-full" />
							))}
						</CardContent>
					</Card>
				) : transactionsQuery.isError ? (
					<Card className="border-destructive/30 bg-destructive/5 shadow-sm">
						<CardContent className="text-destructive p-6 text-sm">
							Không thể tải danh sách giao dịch. Vui lòng thử lại sau.
						</CardContent>
					</Card>
				) : (
					<TransactionsTable
						data={transactions}
						page={page}
						pageSize={pageSize}
						pageInfo={pageInfo}
						onPaginationChange={onPaginationChange}
					/>
				)}
			</div>
		</>
	);
}

function parseSearchDate(value?: string) {
	if (!value) {
		return undefined;
	}

	const date = new Date(`${value}T00:00:00`);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatSearchDate(date?: Date) {
	return date ? format(date, "yyyy-MM-dd") : undefined;
}
