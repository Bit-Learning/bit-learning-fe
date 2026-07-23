import { useState } from "react";
import {
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import { Code2, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DataTablePagination } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useProblems, usePublishProblem } from "../queries/useProblem";
import {
	ApprovalStatus,
	Difficulty,
	type ProblemBriefResponse,
} from "../types/problem.type";
import { DetailModal } from "./ProblemDetailModal";
import { TogglePublishConfirm } from "./TogglePublishConfirm";

const difficultyConfig: Record<
	Difficulty,
	{ label: string; className: string }
> = {
	[Difficulty.EASY]: {
		label: "Dễ",
		className: "bg-emerald-100 text-emerald-700",
	},
	[Difficulty.MEDIUM]: {
		label: "Trung bình",
		className: "bg-amber-100 text-amber-700",
	},
	[Difficulty.HARD]: { label: "Khó", className: "bg-rose-100 text-rose-700" },
};

type ProblemBankTabProps = {
	pagination: PaginationState;
	onPaginationChange: OnChangeFn<PaginationState>;
};
export function ProblemBankTab({
	pagination: tablePagination,
	onPaginationChange,
}: ProblemBankTabProps) {
	const page = tablePagination.pageIndex;
	const pageSize = tablePagination.pageSize;
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	const [viewProblemId, setViewProblemId] = useState<string | null>(null);
	const [toggleProblem, setToggleProblem] =
		useState<ProblemBriefResponse | null>(null);

	const publishProblemMutation = usePublishProblem();

	const { data: response, isLoading } = useProblems({
		page,
		size: pageSize,
		sort: `createdAt,${sortDirection}`,
		approvalStatus: ApprovalStatus.APPROVED,
	});

	const problems: ProblemBriefResponse[] = response?.data || [];
	const pagination = response?.page;

	const bankPaginationChange: OnChangeFn<PaginationState> = (updater) => {
		const next =
			typeof updater === "function" ? updater(tablePagination) : updater;
		onPaginationChange({
			pageIndex:
				next.pageSize !== tablePagination.pageSize ? 0 : next.pageIndex,
			pageSize: next.pageSize,
		});
	};

	const bankTable = useReactTable({
		data: problems,
		columns: [],
		state: { pagination: tablePagination },
		onPaginationChange: bankPaginationChange,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: pagination?.totalPages ?? 0,
	});

	const handleTogglePublish = () => {
		if (!toggleProblem) return;
		publishProblemMutation.mutate(
			{ id: toggleProblem.id, isPublic: !toggleProblem.isPublic },
			{ onSuccess: () => setToggleProblem(null) },
		);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-8 w-64" />
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-14 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{problems.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
					<Code2 className="h-16 w-16 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">"Chưa có bài tập nào"</h3>
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tiêu đề</TableHead>
								<TableHead>Độ khó</TableHead>
								<TableHead>Lớp</TableHead>
								<TableHead>Tác giả</TableHead>
								<TableHead>
									<button
										className="flex items-center gap-1 hover:text-primary transition-colors uppercase"
										onClick={() =>
											setSortDirection((prev) =>
												prev === "desc" ? "asc" : "desc",
											)
										}
									>
										Ngày tạo
										{sortDirection === "desc" ? (
											<ArrowDownIcon className="h-4 w-4" />
										) : (
											<ArrowUpIcon className="h-4 w-4" />
										)}
									</button>
								</TableHead>{" "}
								<TableHead>Trạng thái</TableHead>
								<TableHead>Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{problems.map((problem) => (
								<TableRow key={problem.id}>
									<TableCell>
										<button
											onClick={() => setViewProblemId(problem.id)}
											className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
										>
											{problem.title}
										</button>{" "}
										<p className="text-xs text-muted-foreground font-mono">
											{problem.slug}
										</p>
									</TableCell>
									<TableCell>
										<Badge
											className={difficultyConfig[problem.difficulty].className}
										>
											{difficultyConfig[problem.difficulty].label}
										</Badge>
									</TableCell>
									<TableCell>
										<span className="text-sm">{problem.classLevel}</span>
									</TableCell>
									<TableCell>
										<span className="text-sm">
											{problem.createdBy
												? problem.createdBy.firstName +
													" " +
													problem.createdBy.lastName
												: "—"}
										</span>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
										{format(new Date(problem.createdAt), "dd/MM/yyyy HH:mm", {
											locale: vi,
										})}
									</TableCell>
									<TableCell>
										{problem.isPublic ? (
											<Badge className="bg-emerald-100 text-emerald-700">
												Hiển thị
											</Badge>
										) : (
											<Badge className="bg-slate-100 text-slate-500">
												Đang ẩn
											</Badge>
										)}
									</TableCell>
									<TableCell className="text-left">
										<div className="flex items-center justify-start gap-2">
											<Button
												variant="outline"
												size="sm"
												className="hover:bg-blue-100"
												onClick={() => setViewProblemId(problem.id)}
											>
												Chi tiết
											</Button>

											<Button
												variant="outline"
												size="sm"
												onClick={() => setToggleProblem(problem)}
												className={
													problem.isPublic
														? "border-red-500 text-red-600 hover:bg-red-50"
														: "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
												}
											>
												{problem.isPublic ? "Ẩn" : "Hiển thị"}
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{pagination && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Hiển thị {page * pageSize + 1} đến{" "}
						{Math.min((page + 1) * pageSize, pagination.totalElements)} trong{" "}
						{pagination.totalElements} bài tập
					</p>
					<DataTablePagination
						table={bankTable}
						pageCount={pagination.totalPages}
					/>
				</div>
			)}

			<DetailModal
				problemId={viewProblemId}
				onClose={() => setViewProblemId(null)}
				mode="view"
			/>

			<TogglePublishConfirm
				problem={toggleProblem}
				isPending={publishProblemMutation.isPending}
				onConfirm={handleTogglePublish}
				onClose={() => setToggleProblem(null)}
			/>
		</div>
	);
}
