import { useEffect, useRef, useState } from "react";
import {
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import {
	Eye,
	Trash2,
	Calendar,
	Search as SearchIcon,
	SlidersHorizontal,
	X,
	ChevronDown,
	ArrowDownIcon,
	ArrowUpIcon,
} from "lucide-react";
import { DataTablePagination } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useSearchQuestions, useDeleteQuestion } from "../queries/useQuestion";
import {
	ApprovalStatus,
	QuestionLevel,
	QuestionType,
	type QuestionResponse,
} from "../types/question.type";
import { QuestionDetailDialog } from "../components/QuestionDetailDialog";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { NavigateFn } from "@/shared/hooks/use-table-url-state";
import { cn } from "@/shared/lib/utils";
import { EMPTY_FILTERS, FilterPanel, FilterState } from "./FilterPanel";

type QuestionBankTabProps = {
	keyword: string;
	pagination: PaginationState;
	onPaginationChange: OnChangeFn<PaginationState>;
	navigate: NavigateFn;
};

export function QuestionBankTab({
	keyword,
	pagination: tablePagination,
	onPaginationChange,
	navigate,
}: QuestionBankTabProps) {
	const page = tablePagination.pageIndex;
	const pageSize = tablePagination.pageSize;
	const [searchValue, setSearchValue] = useState(keyword);
	const [viewQuestion, setViewQuestion] = useState<QuestionResponse | null>(
		null,
	);
	const [deleteQuestion, setDeleteQuestion] = useState<QuestionResponse | null>(
		null,
	);
	const [filterOpen, setFilterOpen] = useState(false);
	const [activeFilters, setActiveFilters] =
		useState<FilterState>(EMPTY_FILTERS);
	const filterRef = useRef<HTMLDivElement>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
	const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

	const { data: response, isLoading } = useSearchQuestions({
		keyword,
		page,
		size: pageSize,
		approvalStatus: ApprovalStatus.APPROVED,
		sort: `createdAt,${sortDirection}`,
		subjectId: activeFilters.subjectId ?? undefined,
		chapterId: activeFilters.chapterId ?? undefined,
		lessonId: activeFilters.lessonId ?? undefined,
		questionType: activeFilters.questionType ?? undefined,
		questionLevel: activeFilters.questionLevel ?? undefined,
	});

	const deleteQuestionMutation = useDeleteQuestion();
	const questions = response?.data || [];
	const pagination = response?.page;

	useEffect(() => {
		setSearchValue(keyword);
	}, [keyword]);

	useEffect(() => {
		if (!filterOpen) return;
		const handler = (e: MouseEvent) => {
			if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
				setFilterOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [filterOpen]);

	useEffect(() => {
		if (
			pagination &&
			pagination.totalPages > 0 &&
			page >= pagination.totalPages
		) {
			navigate({
				replace: true,
				search: (prev) => ({
					...prev,
					page: pagination.totalPages <= 1 ? undefined : pagination.totalPages,
				}),
			});
		}
	}, [navigate, page, pagination]);

	const handleSearch = () => {
		navigate({
			search: (prev) => ({
				...prev,
				page: undefined,
				keyword: searchValue.trim() || undefined,
			}),
		});
	};

	const bankPaginationChange: OnChangeFn<PaginationState> = (updater) => {
		const next =
			typeof updater === "function" ? updater(tablePagination) : updater;
		onPaginationChange({
			pageIndex:
				next.pageSize !== tablePagination.pageSize ? 0 : next.pageIndex,
			pageSize: next.pageSize,
		});
	};

	// eslint-disable-next-line react-hooks/incompatible-library
	const bankTable = useReactTable({
		data: questions,
		columns: [],
		state: { pagination: tablePagination },
		onPaginationChange: bankPaginationChange,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: pagination?.totalPages ?? 0,
	});

	const handleDelete = () => {
		if (!deleteQuestion) return;
		deleteQuestionMutation.mutate(deleteQuestion.id, {
			onSuccess: () => setDeleteQuestion(null),
		});
	};

	const getDifficultyBadge = (level: QuestionLevel) => {
		const config = {
			[QuestionLevel.EASY]: {
				label: "Dễ",
				className: "bg-green-100 text-green-700",
			},
			[QuestionLevel.MEDIUM]: {
				label: "Trung bình",
				className: "bg-yellow-100 text-yellow-700",
			},
			[QuestionLevel.HARD]: {
				label: "Khó",
				className: "bg-red-100 text-red-700",
			},
		};
		const { label, className } = config[level];
		return <Badge className={className}>{label}</Badge>;
	};

	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});

	if (isLoading)
		return (
			<div className="flex flex-1 flex-col gap-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-96" />
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm câu hỏi theo nội dung..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						className="pl-9"
					/>
				</div>
				<Button onClick={handleSearch}>Tìm kiếm</Button>

				<div className="relative" ref={filterRef}>
					<Button
						variant="outline"
						className={cn(
							"gap-2",
							activeFilterCount > 0 && "border-primary text-primary",
						)}
						onClick={() => setFilterOpen((o) => !o)}
					>
						<SlidersHorizontal className="h-4 w-4" />
						Bộ lọc
						{activeFilterCount > 0 && (
							<Badge className="h-4 px-1 text-[10px]">
								{activeFilterCount}
							</Badge>
						)}
						<ChevronDown
							className={cn(
								"h-3 w-3 transition-transform",
								filterOpen && "rotate-180",
							)}
						/>
					</Button>

					{filterOpen && (
						<FilterPanel
							filters={activeFilters}
							onChange={(f) => {
								setActiveFilters(f);
								onPaginationChange({
									pageIndex: 0,
									pageSize: tablePagination.pageSize,
								});
							}}
							onClose={() => setFilterOpen(false)}
						/>
					)}
				</div>

				<div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
					Tổng:{" "}
					<span className="font-semibold text-foreground">
						{pagination?.totalElements ?? 0}
					</span>{" "}
					câu hỏi
				</div>
			</div>

			{activeFilterCount > 0 && (
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-xs text-muted-foreground">Đang lọc:</span>
					{activeFilters.questionType && (
						<Badge variant="secondary" className="gap-1">
							{activeFilters.questionType === QuestionType.MCQ
								? "Trắc nghiệm"
								: "Tự luận"}
							<button
								onClick={() =>
									setActiveFilters((f) => ({ ...f, questionType: null }))
								}
							>
								<X className="h-2.5 w-2.5" />
							</button>
						</Badge>
					)}
					{activeFilters.questionLevel && (
						<Badge variant="secondary" className="gap-1">
							{activeFilters.questionLevel === QuestionLevel.EASY
								? "Dễ"
								: activeFilters.questionLevel === QuestionLevel.MEDIUM
									? "Trung bình"
									: "Khó"}
							<button
								onClick={() =>
									setActiveFilters((f) => ({ ...f, questionLevel: null }))
								}
							>
								<X className="h-2.5 w-2.5" />
							</button>
						</Badge>
					)}
					<button
						className="text-xs text-muted-foreground hover:text-foreground underline"
						onClick={() => setActiveFilters(EMPTY_FILTERS)}
					>
						Xoá tất cả
					</button>
				</div>
			)}

			{questions.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
					<SearchIcon className="h-16 w-16 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">
						{keyword || activeFilterCount > 0
							? "Không tìm thấy câu hỏi"
							: "Chưa có câu hỏi nào"}
					</h3>
					<p className="text-sm text-muted-foreground">
						{keyword || activeFilterCount > 0
							? "Thử tìm kiếm với từ khóa hoặc bộ lọc khác"
							: "Ngân hàng câu hỏi đang trống"}
					</p>
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nội dung câu hỏi</TableHead>
								<TableHead>Mức độ</TableHead>
								<TableHead>Loại</TableHead>
								<TableHead>Giảng viên</TableHead>
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
								</TableHead>
								<TableHead className="text-right">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{questions.map((question: QuestionResponse, index: number) => (
								<TableRow key={index}>
									<TableCell>
										<p className="font-medium line-clamp-1">
											{question.content}
										</p>
									</TableCell>
									<TableCell>
										{getDifficultyBadge(question.questionLevel)}
									</TableCell>
									<TableCell>
										<span className="text-sm">
											{question.questionType === QuestionType.MCQ
												? "Trắc nghiệm"
												: "Tự luận"}
										</span>
									</TableCell>
									<TableCell>
										<span className="text-sm">
											{question.requestedBy.firstName +
												" " +
												question.requestedBy.lastName}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1 text-sm text-muted-foreground">
											<Calendar className="h-3 w-3" />
											{formatDate(question.createdAt)}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setViewQuestion(question)}
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setDeleteQuestion(question)}
												className="text-red-600 hover:text-red-700 hover:bg-red-50"
											>
												<Trash2 className="h-4 w-4" />
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
						{pagination.totalElements} câu hỏi
					</p>
					<DataTablePagination
						table={bankTable}
						pageCount={pagination.totalPages}
					/>
				</div>
			)}

			<QuestionDetailDialog
				question={viewQuestion}
				open={!!viewQuestion}
				onOpenChange={(open) => !open && setViewQuestion(null)}
			/>

			<DeleteConfirmModal
				open={!!deleteQuestion}
				onClose={() => setDeleteQuestion(null)}
				onConfirm={handleDelete}
				title="Xác nhận xóa câu hỏi"
				description={`Bạn có chắc chắn muốn xóa câu hỏi "${deleteQuestion?.content}"? Hành động này không thể hoàn tác.`}
				isPending={deleteQuestionMutation.isPending}
				confirmLabel="Xóa câu hỏi"
			/>
		</div>
	);
}
