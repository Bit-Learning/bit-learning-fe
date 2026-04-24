import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { DataTablePagination } from "@/components/data-table";
import { Header } from "@/layout/header";
import Loader from "@/shared/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getUserPlayHistory,
	type UserPlayHistoryItem,
} from "../api/user-play-history.api";

const route = getRouteApi("/_authenticated/users/$userId/game-history");

function formatPlayedAt(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return date.toLocaleString("vi-VN");
}

function formatDuration(seconds: number | null) {
	if (typeof seconds !== "number" || seconds < 0) {
		return "-";
	}

	const minutes = Math.floor(seconds / 60);
	const remainSeconds = seconds % 60;

	if (minutes <= 0) {
		return `${remainSeconds}s`;
	}

	return `${minutes}m ${remainSeconds}s`;
}

export function UserGameHistoryPage() {
	const search = route.useSearch();
	const navigate = route.useNavigate();
	const { userId } = route.useParams();

	const page = Math.max((search.page ?? 1) - 1, 0);
	const pageSize = search.pageSize ?? 10;
	const numericUserId = Number(userId);

	const historyQuery = useQuery({
		queryKey: ["user-play-history", numericUserId, page, pageSize],
		queryFn: () =>
			getUserPlayHistory({
				userId: numericUserId,
				page,
				size: pageSize,
			}),
		enabled: Number.isFinite(numericUserId),
		placeholderData: (previousData) => previousData,
	});

	const data = historyQuery.data;
	const totalPages = data?.totalPages ?? 0;
	const normalizedTotalPages = Math.max(totalPages, 1);
	const totalItems = data?.totalItems ?? 0;
	const historyItems = data?.content ?? [];

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

	// eslint-disable-next-line react-hooks/incompatible-library
	const paginationTable = useReactTable<UserPlayHistoryItem>({
		data: historyItems,
		columns: [
			{
				id: "id",
				accessorKey: "id",
			},
		],
		state: {
			pagination: {
				pageIndex: page,
				pageSize,
			},
		},
		onPaginationChange,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: normalizedTotalPages,
	});

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-6 p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Lịch sử chơi game
						</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							User ID: {numericUserId} • Tổng lượt chơi:{" "}
							{totalItems.toLocaleString("vi-VN")}
						</p>
					</div>
					<Button
						variant="outline"
						onClick={() => {
							navigate({ to: "/users" });
						}}
					>
						<ArrowLeft className="mr-2 size-4" />
						Quay lại danh sách người dùng
					</Button>
				</div>

				<Card className="border border-border/70 shadow-sm">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Danh sách lịch sử chơi</CardTitle>
					</CardHeader>
					<CardContent>
						{historyQuery.isLoading && (
							<div className="flex min-h-52 items-center justify-center">
								<Loader />
							</div>
						)}

						{historyQuery.isError && (
							<div className="text-destructive py-10 text-center text-sm">
								Không thể tải lịch sử chơi game của user này.
							</div>
						)}

						{!historyQuery.isLoading && !historyQuery.isError && (
							<>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Thời gian</TableHead>
											<TableHead>Tên trò chơi</TableHead>
											<TableHead className="text-right">Điểm</TableHead>
											<TableHead className="text-right">Độ chính xác</TableHead>
											<TableHead className="text-right">Thời lượng</TableHead>
											<TableHead>Khối/Lĩnh vực</TableHead>
											<TableHead>Trạng thái</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{historyItems.map((item) => (
											<TableRow key={item.id}>
												<TableCell>{formatPlayedAt(item.playedAt)}</TableCell>
												<TableCell>
													<div className="flex min-w-60 items-center gap-3">
														{item.gameThumbnail ? (
															<img
																src={item.gameThumbnail}
																alt={item.gameTitle}
																className="h-10 w-16 rounded-md object-cover"
															/>
														) : null}
														<div className="min-w-0">
															<div className="truncate font-medium">
																{item.gameTitle}
															</div>
															<div className="text-muted-foreground truncate text-xs">
																{item.questionSetTitle ?? "-"}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell className="text-right">
													{item.score ?? "-"}
												</TableCell>
												<TableCell className="text-right">
													{typeof item.accuracy === "number"
														? `${item.accuracy}%`
														: "-"}
												</TableCell>
												<TableCell className="text-right">
													{formatDuration(item.duration)}
												</TableCell>
												<TableCell>
													{item.grade ? `Lớp ${item.grade}` : "-"}
													{item.topicName ? ` • ${item.topicName}` : ""}
												</TableCell>
												<TableCell>
													<Badge
														variant={item.completed ? "default" : "secondary"}
													>
														{item.attemptState ??
															(item.completed ? "COMPLETED" : "PARTIAL")}
													</Badge>
												</TableCell>
											</TableRow>
										))}

										{historyItems.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={7}
													className="text-muted-foreground py-10 text-center"
												>
													Hiện chưa có dữ liệu.
												</TableCell>
											</TableRow>
										) : null}
									</TableBody>
								</Table>

								<DataTablePagination
									table={paginationTable}
									pageCount={normalizedTotalPages}
									className="mt-4 px-0"
								/>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
