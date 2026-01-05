import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { Checkbox } from "@workspace/ui/components/Checkbox";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/Sonner";
import {
	ArrowLeft,
	Download,
	Eye,
	FileText,
	Search,
	Settings,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { apiClient } from "@/shared/lib/apiClient";

type QuestionSource = "system" | "user";

export default function GenerateExamFromQuestions() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { userInfo } = useSelector(selectAuthStateInfo);

	// Form states
	const [questionSource, setQuestionSource] =
		useState<QuestionSource>("system");
	const [examName, setExamName] = useState("");
	const [examCode, setExamCode] = useState("");
	const [durationInMinutes, setDurationInMinutes] = useState(90);
	const [totalScore, setTotalScore] = useState(10);
	const [shuffleOptions, setShuffleOptions] = useState(true);
	const [generatedExamId, setGeneratedExamId] = useState<number | null>(null);

	// Search and filter
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
		new Set(),
	);
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(20);

	// Load system questions
	const systemQuestionsQuery = useQuery({
		...apiClient.question.searchQuestions(
			{},
			{
				page: currentPage,
				size: pageSize,
			},
		),
		enabled: questionSource === "system",
	});

	// Load user questions
	const userQuestionsQuery = useQuery({
		...apiClient.question.getMyQuestions(userInfo?.id || 0, {
			page: currentPage,
			size: pageSize,
		}),
		enabled: questionSource === "user" && !!userInfo?.id,
	});

	// Select active query based on source
	const questions =
		questionSource === "system"
			? systemQuestionsQuery.data
			: userQuestionsQuery.data;
	const questionsLoading =
		questionSource === "system"
			? systemQuestionsQuery.isLoading
			: userQuestionsQuery.isLoading;
	const questionsError =
		questionSource === "system"
			? systemQuestionsQuery.error
			: userQuestionsQuery.error;

	// Load generated exam if exists
	const { data: examData } = useQuery({
		...apiClient.exam.getExamById(generatedExamId!),
		enabled: !!generatedExamId,
	});

	// Generate exam mutation - using generateExamFromQuestions API
	const generateMutation = useMutation({
		...apiClient.exam.generateExamFromQuestions(),
		onSuccess: (data) => {
			console.log("[GenerateExamFromQuestions] Success:", data);
			setGeneratedExamId(data.id);
			queryClient.invalidateQueries({ queryKey: ["exams"] });
			toast.success({ title: "Đề thi đã được tạo thành công!" });
		},
		onError: (error: any) => {
			console.error("[GenerateExamFromQuestions] Error:", error);
			const errorMessage =
				error.response?.data?.message || error.message || "Lỗi không xác định";
			toast.error({ title: "Lỗi khi tạo đề thi", description: errorMessage });
		},
	});

	// Download mutation
	const handleDownload = async (format: "pdf" | "docx") => {
		if (!generatedExamId) {
			toast.warning({ title: "Chưa có đề thi để tải xuống" });
			return;
		}

		try {
			const blob = await queryClient.fetchQuery(
				apiClient.exam.downloadExam(generatedExamId, format),
			);

			const url = window.URL.createObjectURL(blob as Blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${examData?.name || "exam"}.${format === "pdf" ? "pdf" : "docx"}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			toast.success({ title: "Tải xuống thành công!" });
		} catch (error: any) {
			toast.error({ title: "Lỗi khi tải xuống", description: error.message });
		}
	};

	const handleGenerate = () => {
		if (!examName || !examCode) {
			toast.warning({ title: "Vui lòng nhập tên và mã đề thi" });
			return;
		}

		if (selectedQuestions.size === 0) {
			toast.warning({ title: "Vui lòng chọn ít nhất 1 câu hỏi" });
			return;
		}

		const payload = {
			questionIds: Array.from(selectedQuestions),
			name: examName,
			code: examCode,
			shuffleOptions,
			durationInMinutes,
			totalScore,
		};

		console.log("[GenerateExamFromQuestions] Sending request:", payload);
		generateMutation.mutate(payload);
	};

	const handleViewFullExam = () => {
		if (!generatedExamId) {
			toast.warning({ title: "Chưa có đề thi để xem" });
			return;
		}
		navigate({ to: `/exams/${generatedExamId}` as any });
	};

	const handleToggleQuestion = (questionId: number) => {
		setSelectedQuestions((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(questionId)) {
				newSet.delete(questionId);
			} else {
				newSet.add(questionId);
			}
			return newSet;
		});
	};

	const handleSelectAll = () => {
		if (!questions?.content) return;

		const allIds = questions.content.map((q: any) => q.id);
		setSelectedQuestions(new Set(allIds));
	};

	const handleDeselectAll = () => {
		setSelectedQuestions(new Set());
	};

	const getLevelBadgeColor = (level: string) => {
		switch (level) {
			case "EASY":
				return "bg-green-500";
			case "MEDIUM":
				return "bg-blue-500";
			case "HARD":
				return "bg-orange-500";
			default:
				return "bg-gray-500";
		}
	};

	const getQuestionTypeBadge = (type: string) => {
		return type === "MCQ" ? (
			<Badge className="bg-blue-500">Trắc nghiệm</Badge>
		) : (
			<Badge className="bg-purple-500">Tự luận</Badge>
		);
	};

	const questionsList = Array.isArray(questions?.content)
		? questions.content
		: [];
	const filteredQuestions = questionsList.filter((q: any) =>
		q.content.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/questions/my" })}
					className="mb-4 gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại danh sách câu hỏi
				</Button>
				<h1 className="mb-2 text-4xl font-bold">
					Generate đề thi từ ngân hàng câu hỏi
				</h1>
				<p className="text-muted-foreground">
					Chọn câu hỏi và tạo đề thi tùy chỉnh
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Column - Settings & Question Selection */}
				<div className="space-y-6 lg:col-span-2">
					{/* Source Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Nguồn câu hỏi</CardTitle>
							<CardDescription>
								Chọn nguồn câu hỏi để tạo đề thi
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-4">
								<Button
									variant={questionSource === "system" ? "default" : "outline"}
									onClick={() => {
										setQuestionSource("system");
										setSelectedQuestions(new Set());
										setCurrentPage(0);
									}}
									className="flex-1"
								>
									Ngân hàng hệ thống
								</Button>
								<Button
									variant={questionSource === "user" ? "default" : "outline"}
									onClick={() => {
										setQuestionSource("user");
										setSelectedQuestions(new Set());
										setCurrentPage(0);
									}}
									className="flex-1"
								>
									Câu hỏi của tôi
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Question List */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>
										Danh sách câu hỏi (
										{questionSource === "system" ? "Hệ thống" : "Của tôi"})
									</CardTitle>
									<CardDescription>
										Đã chọn: {selectedQuestions.size} câu hỏi
									</CardDescription>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={handleSelectAll}>
										Chọn tất cả
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleDeselectAll}
									>
										Bỏ chọn
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{/* Search */}
							<div className="relative mb-4">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
								<Input
									type="text"
									placeholder="Tìm kiếm câu hỏi..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>

							{questionsLoading ? (
								<div className="py-8 text-center text-gray-500">
									Đang tải câu hỏi...
								</div>
							) : questionsError ? (
								<div className="py-8 text-center text-red-500">
									Lỗi khi tải câu hỏi: {questionsError.message}
								</div>
							) : filteredQuestions.length === 0 ? (
								<div className="py-8 text-center text-gray-500">
									<FileText className="mx-auto mb-2 h-12 w-12 text-gray-400" />
									<p>Không tìm thấy câu hỏi nào</p>
								</div>
							) : (
								<div className="space-y-3">
									{filteredQuestions.map((question: any, _index: number) => (
										<div
											key={question.id}
											className={`cursor-pointer rounded-lg border p-4 transition-colors ${
												selectedQuestions.has(question.id)
													? "border-blue-500 bg-blue-50"
													: "hover:bg-gray-50"
											}`}
											onClick={() => handleToggleQuestion(question.id)}
										>
											<div className="flex items-start gap-3">
												<Checkbox
													isSelected={selectedQuestions.has(question.id)}
													onChange={() => handleToggleQuestion(question.id)}
													className="mt-1"
												/>
												<div className="flex-1">
													<div className="mb-2 flex items-start justify-between">
														<p className="flex-1 text-sm font-medium">
															{question.content}
														</p>
														<div className="ml-2 flex gap-2">
															{getQuestionTypeBadge(question.questionType)}
															<Badge
																className={getLevelBadgeColor(
																	question.questionLevel,
																)}
															>
																{question.questionLevel}
															</Badge>
														</div>
													</div>
													<div className="text-muted-foreground flex gap-2 text-xs">
														<span>{question.subject?.name || "N/A"}</span>
														{question.lesson && (
															<>
																<span>•</span>
																<span>{question.lesson.name}</span>
															</>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Pagination */}
							{questions && questions.totalPages > 1 && (
								<div className="mt-4 flex items-center justify-center gap-4">
									<Button
										variant="outline"
										size="sm"
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
										size="sm"
										onClick={() =>
											setCurrentPage((p) =>
												Math.min(questions.totalPages - 1, p + 1),
											)
										}
										isDisabled={currentPage === questions.totalPages - 1}
									>
										Sau
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Settings & Preview */}
				<div className="space-y-6 lg:col-span-1">
					{/* Generation Settings */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								<CardTitle>Cài đặt đề thi</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="examName">Tên đề thi *</Label>
								<Input
									id="examName"
									placeholder="VD: Đề thi HK1 - Đề số 1"
									value={examName}
									onChange={(e) => setExamName(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="examCode">Mã đề thi *</Label>
								<Input
									id="examCode"
									placeholder="VD: DE-TOAN-10-HK1-01"
									value={examCode}
									onChange={(e) => setExamCode(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="duration">Thời gian (phút) *</Label>
								<Input
									id="duration"
									type="number"
									min="1"
									value={durationInMinutes}
									onChange={(e) => setDurationInMinutes(Number(e.target.value))}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="totalScore">Tổng điểm *</Label>
								<Input
									id="totalScore"
									type="number"
									min="0"
									step="0.5"
									value={totalScore}
									onChange={(e) => setTotalScore(Number(e.target.value))}
								/>
							</div>

							<div className="space-y-3 border-t pt-4">
								<div className="flex items-center gap-2">
									<Checkbox
										id="shuffleOptions"
										isSelected={shuffleOptions}
										onChange={(isSelected: boolean) =>
											setShuffleOptions(isSelected)
										}
									/>
									<Label
										htmlFor="shuffleOptions"
										className="cursor-pointer text-sm"
									>
										Xáo trộn thứ tự đáp án
									</Label>
								</div>
							</div>

							<Button
								onClick={handleGenerate}
								isDisabled={
									generateMutation.isPending || selectedQuestions.size === 0
								}
								className="mt-4 w-full gap-2"
							>
								<Sparkles className="h-4 w-4" />
								{generateMutation.isPending ? "Đang tạo đề..." : "Tạo đề thi"}
							</Button>

							{selectedQuestions.size > 0 && (
								<div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
									Đã chọn {selectedQuestions.size} câu hỏi
								</div>
							)}
						</CardContent>
					</Card>

					{/* Preview Card */}
					{examData && (
						<Card>
							<CardHeader>
								<CardTitle>Đề thi đã tạo</CardTitle>
								<CardDescription>{examData.name}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Mã đề:</span>
										<span className="font-medium">{examData.code}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Số câu hỏi:</span>
										<span className="font-medium">
											{examData.examQuestions.length}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tổng điểm:</span>
										<span className="font-medium">{examData.totalScore}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Thời gian:</span>
										<span className="font-medium">
											{examData.durationInMinutes} phút
										</span>
									</div>
								</div>

								<div className="flex flex-col gap-2 border-t pt-3">
									<Button
										variant="outline"
										size="sm"
										className="w-full gap-2"
										onClick={handleViewFullExam}
									>
										<Eye className="h-4 w-4" />
										Xem đầy đủ
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="w-full gap-2"
										onClick={() => handleDownload("pdf")}
									>
										<Download className="h-4 w-4" />
										Tải PDF
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="w-full gap-2"
										onClick={() => handleDownload("docx")}
									>
										<Download className="h-4 w-4" />
										Tải Word
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
