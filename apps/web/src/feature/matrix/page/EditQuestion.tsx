import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { toast } from "@workspace/ui/components/Sonner";
import { ArrowLeft, Check, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/apiClient";

interface QuestionOption {
	id?: number;
	label: string;
	content: string;
	isCorrect: boolean;
}

export default function EditQuestion() {
	const params = useParams({ strict: false });
	const questionId = (params as any).id
		? Number((params as any).id)
		: undefined;
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		content: "",
		canonicalAnswer: "",
		questionLevel: "EASY" as "EASY" | "MEDIUM" | "HARD",
		options: [] as QuestionOption[],
	});

	// Fetch question data
	const {
		data: question,
		isLoading,
		error,
	} = useQuery({
		...apiClient.question.getQuestionById(questionId!),
		enabled: !!questionId,
	});

	// Update mutation
	const updateMutation = useMutation({
		...apiClient.question.updateQuestion(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["question", questionId] });
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			toast.success({ title: "Cập nhật câu hỏi thành công!" });
			navigate({ to: `/questions/${questionId}` as any });
		},
		onError: (error: any) => {
			toast.error({
				title: "Lỗi khi cập nhật câu hỏi",
				description: error?.response?.data?.message || error.message,
			});
		},
	});

	// Populate form when data loads
	useEffect(() => {
		if (question) {
			setFormData({
				content: question.content || "",
				canonicalAnswer: question.canonicalAnswer || "",
				questionLevel: question.questionLevel || "EASY",
				options: question.options || [],
			});
		}
	}, [question]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (questionId && question) {
			updateMutation.mutate({
				id: questionId,
				data: {
					content: formData.content,
					canonicalAnswer: formData.canonicalAnswer,
					questionType: question.questionType,
					questionLevel: formData.questionLevel,
					subjectId: question.subject?.id || 0,
					lessonId: question.lesson?.id || 0,
					options: formData.options,
				} as any,
			});
		}
	};

	const handleInputChange = (field: string, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleOptionChange = (index: number, content: string) => {
		setFormData((prev) => ({
			...prev,
			options: prev.options.map((opt, i) =>
				i === index ? { ...opt, content } : opt,
			),
		}));
	};

	const handleSetCorrectAnswer = (index: number) => {
		setFormData((prev) => ({
			...prev,
			options: prev.options.map((opt, i) => ({
				...opt,
				isCorrect: i === index,
			})),
		}));
	};

	const getQuestionTypeBadge = (type: string) => {
		return type === "MCQ" ? (
			<Badge className="bg-blue-500">Trắc nghiệm</Badge>
		) : (
			<Badge className="bg-purple-500">Tự luận</Badge>
		);
	};

	const _getLevelBadge = (level: string) => {
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
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="text-center">Đang tải...</div>
			</div>
		);
	}

	if (error || !question) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="text-center text-red-500">Không tìm thấy câu hỏi</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Link to={`/questions/${questionId}` as any}>
					<Button variant="ghost" className="mb-4 gap-2">
						<ArrowLeft className="h-4 w-4" />
						Quay lại chi tiết
					</Button>
				</Link>
				<h1 className="text-4xl font-bold">Chỉnh sửa câu hỏi</h1>
				<p className="text-muted-foreground mt-2">
					Chỉnh sửa nội dung câu hỏi, độ khó và các đáp án
				</p>
			</div>

			{/* Edit Form */}
			<form onSubmit={handleSubmit}>
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							{getQuestionTypeBadge(question.questionType)}
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Question Level - Editable */}
						<div>
							<label
								htmlFor="question-level"
								className="mb-2 block text-sm font-semibold text-gray-700"
							>
								Độ khó: <span className="text-red-500">*</span>
							</label>
							<select
								id="question-level"
								value={formData.questionLevel}
								onChange={(e) =>
									handleInputChange("questionLevel", e.target.value)
								}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
							>
								<option value="EASY">Dễ</option>
								<option value="MEDIUM">Trung bình</option>
								<option value="HARD">Khó</option>
							</select>
						</div>

						{/* Content - Editable */}
						<div>
							<label
								htmlFor="content"
								className="mb-2 block text-sm font-semibold text-gray-700"
							>
								Nội dung câu hỏi: <span className="text-red-500">*</span>
							</label>
							<textarea
								id="content"
								value={formData.content}
								onChange={(e) => handleInputChange("content", e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
								rows={4}
								required
								placeholder="Nhập nội dung câu hỏi..."
							/>
						</div>

						{/* Options - Editable (if MCQ) */}
						{question.questionType === "MCQ" && formData.options && (
							<div>
								<h3 className="mb-3 text-sm font-semibold text-gray-700">
									Các đáp án: <span className="text-red-500">*</span>
								</h3>
								<p className="mb-3 text-xs text-gray-600">
									💡 Click vào đáp án để chọn làm đáp án đúng
								</p>
								<div className="space-y-3">
									{formData.options.map((option, index) => (
										<div
											key={option.id || index}
											onClick={() => handleSetCorrectAnswer(index)}
											className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
												option.isCorrect
													? "border-green-500 bg-green-50 shadow-md"
													: "border-gray-200 bg-white hover:border-gray-300"
											}`}
										>
											<div className="flex items-start gap-3">
												<div className="flex items-center gap-2 pt-2">
													<span className="font-bold text-gray-700">
														{option.label}.
													</span>
													{option.isCorrect && (
														<div className="rounded-full bg-green-600 p-1">
															<Check className="h-3 w-3 text-white" />
														</div>
													)}
												</div>
												<Input
													value={option.content}
													onChange={(e) =>
														handleOptionChange(index, e.target.value)
													}
													onClick={(e) => e.stopPropagation()}
													className={`flex-1 ${option.isCorrect ? "border-green-300 bg-white font-medium" : ""}`}
													placeholder={`Nhập nội dung đáp án ${option.label}`}
													required
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Canonical Answer - Editable */}
						<div>
							<label
								htmlFor="canonical-answer"
								className="mb-2 block text-sm font-semibold text-gray-700"
							>
								Đáp án chi tiết:
								{question.questionType === "ESSAY" && (
									<span className="text-red-500">*</span>
								)}
								{question.questionType === "MCQ" && (
									<span className="ml-2 text-xs font-normal text-gray-500">
										(Tùy chọn)
									</span>
								)}
							</label>
							<textarea
								id="canonical-answer"
								value={formData.canonicalAnswer}
								onChange={(e) =>
									handleInputChange("canonicalAnswer", e.target.value)
								}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
								rows={8}
								required={question.questionType === "ESSAY"}
								placeholder={
									question.questionType === "MCQ"
										? "Nhập đáp án chi tiết, lời giải (không bắt buộc)..."
										: "Nhập đáp án chi tiết, lời giải..."
								}
							/>
						</div>

						{/* Metadata - Read only */}
						<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
							<h3 className="mb-3 text-sm font-semibold text-gray-700">
								Thông tin khác: (Không thể chỉnh sửa)
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<span className="text-sm text-gray-500">Môn học:</span>
									<p className="font-medium">{question.subject?.name || "-"}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">Bài học:</span>
									<p className="font-medium">{question.lesson?.name || "-"}</p>
								</div>
							</div>
							{question.tags && question.tags.length > 0 && (
								<div className="mt-3">
									<span className="text-sm text-gray-500">Tags:</span>
									<div className="mt-2 flex flex-wrap gap-2">
										{question.tags.map((tag: any) => (
											<Badge key={tag.id} variant="outline">
												{tag.name}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex justify-end gap-3">
					<Link to={`/questions/${questionId}` as any}>
						<Button variant="outline" type="button">
							Hủy
						</Button>
					</Link>
					<Button
						type="submit"
						className="gap-2"
						isDisabled={updateMutation.isPending}
					>
						<Save className="h-4 w-4" />
						{updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
					</Button>
				</div>
			</form>
		</div>
	);
}
