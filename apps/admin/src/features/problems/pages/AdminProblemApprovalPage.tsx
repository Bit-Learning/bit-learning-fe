import React, { useEffect, useState } from "react";
import {
	CheckCircle,
	Eye,
	CheckCircle2,
	Code2,
	ArrowDownIcon,
	ArrowUpIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Difficulty, type ProblemBriefResponse } from "../types/problem.type";
import {
	useApproveProblem,
	useGetPendingProblems,
	useRejectProblem,
} from "../queries/useProblem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { Pagination } from "@/components/Pagination";
import { DetailModal } from "../components/ProblemDetailModal";
import { ProblemBankTab } from "../components/ProblemBankTab";
import { Header } from "@/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

const PENDING_PAGE_SIZE = 20;

const AdminProblemApprovalPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"pending" | "bank">("pending");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	const [page, setPage] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [detailProblemId, setDetailProblemId] = useState<string | null>(null);

	const [bankPagination, setBankPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const { data: response, isLoading } = useGetPendingProblems({
		page,
		size: PENDING_PAGE_SIZE,
		sort: `createdAt,${sortDirection}`,
	});
	const approveMutation = useApproveProblem();
	const rejectMutation = useRejectProblem();

	const problems: ProblemBriefResponse[] = response?.data || [];
	const totalPages: number = response?.page?.totalPages || 0;
	const totalElements: number = response?.page?.totalElements || 0;

	const filteredProblems = problems;

	useEffect(() => {
		setSelectedIds([]);
	}, [page, activeTab]);

	const handleTabChange = (tab: string) => {
		if (tab !== "pending" && tab !== "bank") return;
		setActiveTab(tab);
		setSelectedIds([]);
		setPage(0);
	};

	if (isLoading && activeTab === "pending") {
		return (
			<>
				<Header />
				<div className="flex flex-1 flex-col gap-6 p-6">
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
			</>
		);
	}

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-2xl font-bold mb-2">
							Quản lý bài tập lập trình
						</h1>
						<p className="text-muted-foreground text-sm">
							Phê duyệt bài tập mới và quản lý kho bài tập hiện có
						</p>
					</div>
				</div>

				<Tabs
					value={activeTab}
					onValueChange={handleTabChange}
					className="space-y-4"
				>
					<TabsList>
						<TabsTrigger
							value="pending"
							className="gap-2 px-6 py-3 text-base font-medium"
						>
							<CheckCircle className="h-4 w-4" />
							Chờ phê duyệt
							{totalElements > 0 && (
								<Badge variant="secondary" className="ml-1">
									{totalElements}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger
							value="bank"
							className="gap-2 px-6 py-3 text-base font-medium"
						>
							<Code2 className="h-4 w-4" />
							Kho bài tập
						</TabsTrigger>
					</TabsList>

					<TabsContent value="pending" className="space-y-4">
						{filteredProblems.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
								<CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									"Không có bài tập nào chờ phê duyệt"
								</h3>
								<p className="text-sm text-muted-foreground">
									Tất cả bài tập đã được xử lý
								</p>
							</div>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Tiêu đề</TableHead>
											<TableHead>Độ khó</TableHead>
											<TableHead>Lớp</TableHead>
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
											</TableHead>{" "}
											<TableHead className="text-right">Thao tác</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredProblems.map((problem) => {
											const isSelected = selectedIds.includes(problem.id);
											return (
												<TableRow
													key={problem.id}
													className={cn(isSelected && "bg-muted/50")}
												>
													<TableCell>
														<button
															onClick={() => setDetailProblemId(problem.id)}
															className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
														>
															{problem.title}
														</button>
														<p className="text-xs text-muted-foreground font-mono">
															{problem.slug}
														</p>
													</TableCell>
													<TableCell>
														<Badge
															className={
																difficultyConfig[problem.difficulty].className
															}
														>
															{difficultyConfig[problem.difficulty].label}
														</Badge>
													</TableCell>
													<TableCell>
														<span className="text-sm">
															{problem.classLevel}
														</span>
													</TableCell>
													<TableCell>
														<span className="text-sm">
															{problem.createdBy?.firstName +
																" " +
																problem.createdBy?.lastName}
														</span>
													</TableCell>
													<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
														{format(
															new Date(problem.createdAt),
															"dd/MM/yyyy HH:mm",
															{ locale: vi },
														)}
													</TableCell>
													<TableCell className="text-right">
														<div className="flex items-center justify-end gap-1">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => setDetailProblemId(problem.id)}
															>
																<Eye className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>
						)}

						{totalPages > 1 && (
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									{totalElements} bài tập chờ duyệt
								</p>
								<Pagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
								/>
							</div>
						)}
					</TabsContent>

					<TabsContent value="bank">
						<ProblemBankTab
							pagination={bankPagination}
							onPaginationChange={setBankPagination}
						/>
					</TabsContent>
				</Tabs>
			</div>

			<DetailModal
				problemId={detailProblemId}
				onClose={() => setDetailProblemId(null)}
				onApprove={(ids) =>
					approveMutation.mutate(ids, {
						onSuccess: () => setDetailProblemId(null),
					})
				}
				onReject={(ids, reason) =>
					rejectMutation.mutate(
						{ problemIds: ids, rejectReason: reason },
						{ onSuccess: () => setDetailProblemId(null) },
					)
				}
				isApproving={approveMutation.isPending}
				isRejecting={rejectMutation.isPending}
			/>
		</>
	);
};

export default AdminProblemApprovalPage;
