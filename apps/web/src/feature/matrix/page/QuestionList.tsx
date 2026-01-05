import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import {
	Edit,
	Eye,
	FileQuestion,
	FileText,
	Plus,
	Search,
	Trash2,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/shared/lib/apiClient";

export default function QuestionList() {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(20);
	const queryClient = useQueryClient();

	// Fetch all questions using search with empty filter
	const {
		data: questions,
		isLoading,
		error,
	} = useQuery({
		...apiClient.question.searchQuestions(
			{}, // Empty filter to get all questions
			{
				page: currentPage,
				size: pageSize,
			},
		),
	});

	// Delete mutation
	const deleteMutation = useMutation({
		...apiClient.question.deleteQuestion(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["questions"] });
		},
	});

	const handleDelete = (id: number, content: string) => {
		if (
			confirm(
				`Bạn có chắc chắn muốn xóa câu hỏi:\n"${content.substring(0, 50)}..."`,
			)
		) {
			deleteMutation.mutate(id);
		}
	};

	// Safely access content array from paginated response
	const questionsList = Array.isArray(questions?.content)
		? questions.content
		: [];

	const filteredQuestions = questionsList.filter((q: any) =>
		q.content.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const getQuestionTypeBadge = (type: string) => {
		return type === "MCQ" ? (
			<Badge className="bg-blue-500">Trắc nghiệm</Badge>
		) : (
			<Badge className="bg-purple-500">Tự luận</Badge>
		);
	};

	const getLevelBadge = (level: string) => {
		const colors = {
			EASY: "bg-green-500",
			MEDIUM: "bg-yellow-500",
			HARD: "bg-red-500",
		};
		const labels = {
			EASY: "Dễ",
			MEDIUM: "Trung bình",
			HARD: "Khó",
		};
		return (
			<Badge className={colors[level as keyof typeof colors]}>
				{labels[level as keyof typeof labels]}
			</Badge>
		);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<div className="text-center">Đang tải...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<div className="text-center text-red-500">
					Có lỗi xảy ra: {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="mb-2 text-4xl font-bold">Ngân hàng câu hỏi</h1>
				<p className="text-muted-foreground">Quản lý và tìm kiếm câu hỏi</p>
			</div>

			{/* Actions Bar */}
			<div className="mb-6 flex flex-col gap-4 md:flex-row">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
					<Input
						type="text"
						placeholder="Tìm kiếm câu hỏi..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Link to={"/questions/generate-from-questions" as any}>
						<Button variant="default" className="gap-2">
							<FileText className="h-4 w-4" />
							Generate đề thi
						</Button>
					</Link>
					<Link to={"/matrices/import" as any}>
						<Button variant="outline" className="gap-2">
							<Upload className="h-4 w-4" />
							Import
						</Button>
					</Link>
					{/* <Link to={'/questions/my' as any}>
                        <Button variant="outline" className="gap-2">
                            <FileQuestion className="h-4 w-4" />
                            Câu hỏi của tôi
                        </Button>
                    </Link> */}
					{/* <Link to={'/questions/create' as any}>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo câu hỏi mới
                        </Button>
                    </Link> */}
				</div>
			</div>

			{/* Questions Table */}
			{filteredQuestions.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<FileQuestion className="mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 text-xl font-medium">Chưa có câu hỏi nào</h3>
						<p className="text-muted-foreground mb-4">
							Bắt đầu import câu hỏi đầu tiên
						</p>
						<Link to={"/questions/import" as any}>
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								Import câu hỏi
							</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<div className="text-sm text-gray-600">
							Tổng số: {filteredQuestions.length} câu hỏi
						</div>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="border-b bg-gray-50">
									<tr>
										<th className="px-4 py-3 text-left text-sm font-semibold">
											STT
										</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">
											Nội dung
										</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">
											Loại
										</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">
											Độ khó
										</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">
											Môn học
										</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">
											Bài học
										</th>
										<th className="px-4 py-3 text-right text-sm font-semibold">
											Hành động
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{filteredQuestions.map((question: any, index: number) => (
										<tr key={question.id} className="hover:bg-gray-50">
											<td className="px-4 py-3 text-sm">
												{index + 1 + currentPage * pageSize}
											</td>
											<td className="px-4 py-3">
												<div className="max-w-md">
													<p className="line-clamp-2 text-sm">
														{question.content}
													</p>
												</div>
											</td>
											<td className="px-4 py-3">
												{getQuestionTypeBadge(question.questionType)}
											</td>
											<td className="px-4 py-3">
												{getLevelBadge(question.questionLevel)}
											</td>
											<td className="px-4 py-3 text-sm">
												{question.subject?.name || "-"}
											</td>
											<td className="px-4 py-3 text-sm">
												{question.lesson?.name || "-"}
											</td>
											<td className="px-4 py-3">
												<div className="flex justify-end gap-2">
													<Link to={`/questions/${question.id}` as any}>
														<Button variant="ghost" size="sm" className="gap-1">
															<Eye className="h-4 w-4" />
														</Button>
													</Link>
													<Link to={`/questions/${question.id}/edit` as any}>
														<Button variant="ghost" size="sm" className="gap-1">
															<Edit className="h-4 w-4" />
														</Button>
													</Link>
													<Button
														variant="ghost"
														size="sm"
														className="gap-1 text-red-600 hover:bg-red-50"
														onClick={() =>
															handleDelete(question.id, question.content)
														}
														isDisabled={deleteMutation.isPending}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Pagination */}
			{questions && questions.totalPages > 1 && (
				<div className="mt-6 flex items-center justify-center gap-4">
					<Button
						variant="outline"
						onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
						isDisabled={currentPage === 0}
					>
						Trước
					</Button>
					<span className="text-sm text-gray-600">
						Trang {currentPage + 1} / {questions.totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() =>
							setCurrentPage((p) => Math.min(questions.totalPages - 1, p + 1))
						}
						isDisabled={currentPage === questions.totalPages - 1}
					>
						Sau
					</Button>
					<select
						value={pageSize}
						onChange={(e) => {
							setPageSize(Number(e.target.value));
							setCurrentPage(0);
						}}
						className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value={10}>10 / trang</option>
						<option value={20}>20 / trang</option>
						<option value={50}>50 / trang</option>
						<option value={100}>100 / trang</option>
					</select>
				</div>
			)}
		</div>
	);
}
