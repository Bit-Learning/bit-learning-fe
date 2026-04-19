import type React from "react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	CheckCircle2,
	FileWarning,
	Lock,
	ShieldAlert,
} from "lucide-react";
import { Header } from "@/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import {
	formatAppealDate,
	getAppealStatusLabel,
	getAppealUserName,
} from "../post-appeal.utils";
import { useGetPostAppeals } from "../queries/usePostAppeal";
import type { AppealTicketStatus } from "../types/post-appeal.type";

type StatusFilter = "ALL" | AppealTicketStatus;

const FILTERS: { label: string; value: StatusFilter }[] = [
	{ label: "Tất cả", value: "ALL" },
	{ label: "Đang chờ xử lý", value: "OPEN" },
	{ label: "Đã đóng", value: "CLOSED" },
];

export const PostAppealListPage: React.FC = () => {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("OPEN");

	const queryStatus = statusFilter === "ALL" ? undefined : statusFilter;
	const { data, isLoading, isError } = useGetPostAppeals(page, 10, queryStatus);

	const appeals = data?.content ?? [];
	const pagination = data?.page;

	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-6 p-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">Quản lý khiếu nại bài viết</h1>
						<p className="text-sm text-muted-foreground">
							Theo dõi các yêu cầu mở khóa bài viết, xem lại lý do khóa cũ và xử
							lý từng trường hợp.
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{FILTERS.map((filter) => (
							<Button
								key={filter.value}
								type="button"
								variant={statusFilter === filter.value ? "default" : "outline"}
								onClick={() => {
									setStatusFilter(filter.value);
									setPage(0);
								}}
							>
								{filter.label}
							</Button>
						))}
					</div>
				</div>

				{isError ? (
					<Card className="border-destructive/30">
						<CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 py-10 text-center">
							<FileWarning className="h-10 w-10 text-destructive" />
							<div className="space-y-1">
								<p className="font-semibold">
									Không thể tải danh sách khiếu nại
								</p>
								<p className="text-sm text-muted-foreground">
									Vui lòng thử lại sau hoặc kiểm tra quyền truy cập của tài
									khoản admin.
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4">
						{isLoading
							? Array.from({ length: 4 }, (_, index) => (
									<Card key={`appeal-skeleton-${index}`}>
										<CardHeader className="space-y-3">
											<Skeleton className="h-5 w-48" />
											<Skeleton className="h-4 w-72" />
										</CardHeader>
										<CardContent className="space-y-3">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-5/6" />
											<Skeleton className="h-10 w-32" />
										</CardContent>
									</Card>
								))
							: appeals.map((appeal) => {
									const isOpen = appeal.status === "OPEN";
									const postStillBanned = !!appeal.post?.isBanned;

									return (
										<Card key={appeal.id}>
											<CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
												<div className="space-y-3">
													<div className="flex flex-wrap items-center gap-2">
														<Badge
															variant={isOpen ? "destructive" : "secondary"}
														>
															{getAppealStatusLabel(appeal.status)}
														</Badge>
														<Badge variant="outline">{appeal.code}</Badge>
														<Badge
															variant={
																postStillBanned ? "destructive" : "secondary"
															}
														>
															{postStillBanned
																? "Bài viết đang bị khóa"
																: "Bài viết đã mở khóa"}
														</Badge>
													</div>
													<div className="space-y-1">
														<CardTitle className="text-xl">
															{appeal.post?.title || appeal.title}
														</CardTitle>
														<CardDescription>
															Tác giả khiếu nại:{" "}
															<span className="font-medium text-foreground">
																{getAppealUserName(appeal.createdBy)}
															</span>
															{" • "}
															Gửi lúc {formatAppealDate(appeal.createdAt)}
														</CardDescription>
													</div>
												</div>

												<Button
													type="button"
													className="w-full lg:w-auto"
													onClick={() =>
														navigate({
															to: "/post-appeals/$id",
															params: { id: appeal.id.toString() },
														})
													}
												>
													Xem chi tiết
													<ArrowRight className="ml-2 h-4 w-4" />
												</Button>
											</CardHeader>

											<CardContent className="grid gap-4 lg:grid-cols-2">
												<div className="rounded-xl border border-red-100 bg-red-50/70 p-4">
													<div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
														<Lock className="h-4 w-4" />
														Lý do khóa ban đầu
													</div>
													<p className="text-sm leading-6 text-red-900">
														{appeal.originalBanReason?.trim() ||
															"Không có lý do khóa được lưu lại trong khiếu nại này."}
													</p>
												</div>

												<div className="rounded-xl border bg-muted/30 p-4">
													<div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
														<ShieldAlert className="h-4 w-4 text-amber-500" />
														Nội dung khiếu nại
													</div>
													<p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground line-clamp-4">
														{appeal.appealMessage}
													</p>
												</div>

												<div className="rounded-xl border bg-background p-4 lg:col-span-2">
													<div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
														<div className="flex flex-wrap items-center gap-2">
															<span className="font-medium text-foreground">
																Bài viết liên quan:
															</span>
															<span>
																#{appeal.post?.id ?? "--"}{" "}
																{appeal.post?.title ?? "--"}
															</span>
														</div>
														<div className="flex items-center gap-2">
															{appeal.post?.author ? (
																<span>
																	Tác giả bài viết:{" "}
																	<span className="font-medium text-foreground">
																		{getAppealUserName(appeal.post.author)}
																	</span>
																</span>
															) : null}
															{appeal.post?.categoryName ? (
																<span
																	className={cn(
																		"rounded-full border px-2.5 py-1 text-xs",
																		"bg-background text-foreground",
																	)}
																>
																	{appeal.post.categoryName}
																</span>
															) : null}
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									);
								})}

						{!isLoading && appeals.length === 0 ? (
							<Card>
								<CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 py-10 text-center">
									<CheckCircle2 className="h-12 w-12 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-semibold">Không có khiếu nại phù hợp</p>
										<p className="text-sm text-muted-foreground">
											Hãy đổi bộ lọc để xem các ticket đã đóng hoặc toàn bộ lịch
											sử xử lý.
										</p>
									</div>
								</CardContent>
							</Card>
						) : null}
					</div>
				)}

				<div className="flex flex-col gap-3 rounded-xl border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-sm text-muted-foreground">
						Trang{" "}
						<span className="font-medium text-foreground">{page + 1}</span>/
						{Math.max(pagination?.totalPages ?? 1, 1)}
						{pagination ? (
							<>
								{" • "}
								{pagination.totalElements.toLocaleString("vi-VN")} khiếu nại
							</>
						) : null}
					</div>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={page === 0 || isLoading}
							onClick={() =>
								setPage((currentPage) => Math.max(0, currentPage - 1))
							}
						>
							Trang trước
						</Button>
						<Button
							type="button"
							variant="outline"
							disabled={!!pagination?.last || isLoading || !pagination}
							onClick={() => setPage((currentPage) => currentPage + 1)}
						>
							Trang sau
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};
