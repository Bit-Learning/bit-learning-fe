import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { toast } from "@workspace/ui/components/Sonner";
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	Download,
	Eye,
	FileText,
	Plus,
	Search,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { apiClient } from "@/shared/lib/apiClient";

export default function MyExams() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	// Get userId from Redux
	const authState = useSelector(selectAuthStateInfo);
	const userId = authState?.userInfo?.id;

	// Fetch user's exams
	const { data, isLoading, error } = useQuery({
		...apiClient.exam.getMyExams(userId!, {
			page,
			size: pageSize,
			search: searchTerm,
		}),
		enabled: !!userId,
	});

	const exams = data?.content || [];
	const totalPages = data?.totalPages || 0;
	const totalElements = data?.totalElements || 0;

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setPage(0); // Reset to first page on new search
	};

	const handleViewExam = (examId: number) => {
		navigate({ to: `/exams/${examId}` as any });
	};

	const handleDownloadExam = async (
		examId: number,
		examName: string,
		format: "pdf" | "docx",
	) => {
		try {
			const downloadOpts = apiClient.exam.downloadExam(examId, format);
			const blob = await downloadOpts.queryFn?.({
				queryKey: downloadOpts.queryKey,
			} as any);
			const url = window.URL.createObjectURL(blob as Blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${examName}.${format === "pdf" ? "pdf" : "docx"}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			toast.success({ title: "Tải xuống thành công!" });
		} catch (error: any) {
			toast.error({ title: "Lỗi khi tải xuống", description: error.message });
		}
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="mb-2 text-4xl font-bold">Đề Thi Của Tôi</h1>
						<p className="text-muted-foreground">
							Quản lý các đề thi bạn đã tạo
						</p>
					</div>
					<Button
						onClick={() =>
							navigate({ to: "/questions/generate-from-questions" })
						}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						Tạo đề thi mới
					</Button>
				</div>
			</div>

			{/* Search and Filters */}
			<Card className="mb-6">
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="relative flex-1">
							<Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
							<Input
								placeholder="Tìm kiếm theo tên hoặc mã đề thi..."
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Results Summary */}
			{!isLoading && (
				<div className="text-muted-foreground mb-4 text-sm">
					Tìm thấy{" "}
					<span className="text-foreground font-semibold">{totalElements}</span>{" "}
					đề thi
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="pt-6">
								<Skeleton className="mb-2 h-6 w-3/4" />
								<Skeleton className="mb-4 h-4 w-1/2" />
								<div className="flex gap-2">
									<Skeleton className="h-9 w-24" />
									<Skeleton className="h-9 w-24" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Error State */}
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<p className="text-red-600">
							Lỗi khi tải danh sách đề thi: {(error as Error).message}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Exam List */}
			{!isLoading && !error && exams.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-semibold">Chưa có đề thi nào</h3>
						<p className="text-muted-foreground mb-4 text-center">
							Bạn chưa tạo đề thi nào. Hãy bắt đầu tạo đề thi đầu tiên!
						</p>
						<Button
							onClick={() =>
								navigate({ to: "/questions/generate-from-questions" })
							}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							Tạo đề thi mới
						</Button>
					</CardContent>
				</Card>
			)}

			{!isLoading && !error && exams.length > 0 && (
				<div className="space-y-4">
					{exams.map((exam: any) => (
						<Card key={exam.id} className="transition-shadow hover:shadow-md">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="mb-1 text-xl">{exam.name}</CardTitle>
										<CardDescription className="flex items-center gap-4 text-sm">
											<span className="flex items-center gap-1">
												<FileText className="h-4 w-4" />
												Mã: {exam.code}
											</span>
											{exam.subject && (
												<span className="flex items-center gap-1">
													<FileText className="h-4 w-4" />
													Môn: {exam.subject.name}
												</span>
											)}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
									<div className="flex items-center gap-2">
										<Clock className="text-muted-foreground h-4 w-4" />
										<div>
											<div className="text-muted-foreground text-xs">
												Thời gian
											</div>
											<div className="text-sm font-medium">
												{exam.durationInMinutes} phút
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<FileText className="text-muted-foreground h-4 w-4" />
										<div>
											<div className="text-muted-foreground text-xs">
												Tổng điểm
											</div>
											<div className="text-sm font-medium">
												{exam.totalScore} điểm
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<FileText className="text-muted-foreground h-4 w-4" />
										<div>
											<div className="text-muted-foreground text-xs">
												Số câu hỏi
											</div>
											<div className="text-sm font-medium">
												{exam.totalQuestions || 0} câu
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Calendar className="text-muted-foreground h-4 w-4" />
										<div>
											<div className="text-muted-foreground text-xs">
												Ngày tạo
											</div>
											<div className="text-sm font-medium">
												{new Date(exam.createdAt).toLocaleDateString("vi-VN")}
											</div>
										</div>
									</div>
								</div>

								<div className="flex flex-wrap gap-2">
									<Button
										variant="outline"
										onClick={() => handleViewExam(exam.id)}
										className="gap-2"
									>
										<Eye className="h-4 w-4" />
										Xem chi tiết
									</Button>
									<Button
										variant="outline"
										onClick={() =>
											handleDownloadExam(exam.id, exam.name, "pdf")
										}
										className="gap-2"
									>
										<Download className="h-4 w-4" />
										Tải PDF
									</Button>
									<Button
										variant="outline"
										onClick={() =>
											handleDownloadExam(exam.id, exam.name, "docx")
										}
										className="gap-2"
									>
										<Download className="h-4 w-4" />
										Tải Word
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{!isLoading && !error && totalPages > 1 && (
				<div className="mt-6 flex flex-col items-center gap-4">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							isDisabled={page === 0}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>

						{/* Page Numbers */}
						<div className="flex gap-1">
							{Array.from({ length: totalPages }, (_, i) => i).map(
								(pageNum) => {
									// Show first page, last page, current page, and pages around current
									const showPage =
										pageNum === 0 ||
										pageNum === totalPages - 1 ||
										Math.abs(pageNum - page) <= 1;

									// Show ellipsis
									const showEllipsisBefore = pageNum === page - 2 && page > 2;
									const showEllipsisAfter =
										pageNum === page + 2 && page < totalPages - 3;

									if (showEllipsisBefore || showEllipsisAfter) {
										return (
											<span key={pageNum} className="px-2 py-1 text-sm">
												...
											</span>
										);
									}

									if (!showPage && Math.abs(pageNum - page) > 1) {
										return null;
									}

									return (
										<Button
											key={pageNum}
											variant={pageNum === page ? "default" : "outline"}
											size="sm"
											onClick={() => setPage(pageNum)}
											className="min-w-[2.5rem]"
										>
											{pageNum + 1}
										</Button>
									);
								},
							)}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							isDisabled={page >= totalPages - 1}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>

					{/* Page Size Selector */}
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">Hiển thị:</span>
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
								setPage(0);
							}}
							className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value={10}>10 / trang</option>
							<option value={20}>20 / trang</option>
							<option value={50}>50 / trang</option>
							<option value={100}>100 / trang</option>
						</select>
					</div>
				</div>
			)}
		</div>
	);
}
