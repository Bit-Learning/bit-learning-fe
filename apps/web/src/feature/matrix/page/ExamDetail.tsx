import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { toast } from "@workspace/ui/components/Sonner";
import { ArrowLeft, Download } from "lucide-react";
import { apiClient } from "@/shared/lib/apiClient";

export default function ExamDetail() {
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const examId = (params as any).id ? Number((params as any).id) : undefined;
	const queryClient = useQueryClient();

	// Load exam data
	const {
		data: examData,
		isLoading,
		error,
	} = useQuery({
		...apiClient.exam.getExamById(examId!),
		enabled: !!examId,
	});

	const handleDownload = async (format: "pdf" | "docx") => {
		if (!examId) {
			toast.error({ title: "Không tìm thấy ID đề thi" });
			return;
		}

		try {
			const blob = await queryClient.fetchQuery(
				apiClient.exam.downloadExam(examId, format),
			);

			const url = window.URL.createObjectURL(blob as Blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${examData?.name || "exam"}.${format}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			toast.success({ title: "Tải xuống thành công!" });
		} catch (error: any) {
			toast.error({ title: "Lỗi khi tải xuống", description: error.message });
		}
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

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="text-center">Đang tải đề thi...</div>
			</div>
		);
	}

	if (error || !examData) {
		return (
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="text-center text-red-500">Không tìm thấy đề thi</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/exams/my-exams" as any })}
					className="mb-4 gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại
				</Button>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="mb-2 text-4xl font-bold">{examData.name}</h1>
						<p className="text-muted-foreground">
							Mã đề: <span className="font-semibold">{examData.code}</span>
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="gap-2"
							onClick={() => handleDownload("pdf")}
						>
							<Download className="h-4 w-4" />
							Tải PDF
						</Button>
						<Button
							variant="outline"
							className="gap-2"
							onClick={() => handleDownload("docx")}
						>
							<Download className="h-4 w-4" />
							Tải Word
						</Button>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Chi tiết đề thi</CardTitle>
							<CardDescription>
								{examData.examQuestions.length} câu hỏi • {examData.totalScore}{" "}
								điểm • {examData.durationInMinutes} phút
							</CardDescription>
						</div>
						<Badge variant={examData.isPublished ? "default" : "secondary"}>
							{examData.isPublished ? "Đã công bố" : "Chưa công bố"}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{/* Exam Info */}
					<div
						className={`mb-6 grid gap-4 rounded-lg border p-4 ${examData.subject ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}
					>
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{examData.examQuestions.length}
							</div>
							<div className="text-muted-foreground text-sm">Câu hỏi</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{examData.totalScore}
							</div>
							<div className="text-muted-foreground text-sm">Tổng điểm</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{examData.durationInMinutes}
							</div>
							<div className="text-muted-foreground text-sm">Phút</div>
						</div>
						{examData.subject && (
							<div className="text-center">
								<div className="text-2xl font-bold text-orange-600">
									{examData.subject.name}
								</div>
								<div className="text-muted-foreground text-sm">Môn học</div>
							</div>
						)}
					</div>

					{/* Questions List */}
					<div className="space-y-6">
						<h3 className="text-lg font-semibold">Danh sách câu hỏi</h3>
						{examData.examQuestions.map((examQuestion, _index) => (
							<div key={examQuestion.id} className="rounded-lg border p-4">
								<div className="mb-3 flex items-start justify-between">
									<div className="flex-1">
										<p className="mb-1 font-medium">
											<span className="font-bold">
												Câu {examQuestion.questionNo}:
											</span>{" "}
											{examQuestion.question.content}
										</p>
										<div className="text-muted-foreground flex gap-2 text-sm">
											<span>{examQuestion.score} điểm</span>
											<span>•</span>
											<span>{examQuestion.question.questionType}</span>
										</div>
									</div>
									<Badge
										className={getLevelBadgeColor(
											examQuestion.question.questionLevel,
										)}
									>
										{examQuestion.question.questionLevel}
									</Badge>
								</div>

								{/* Options for MCQ */}
								{examQuestion.question.questionType === "MCQ" &&
									examQuestion.question.options.length > 0 && (
										<div className="mt-3 space-y-2">
											{examQuestion.question.options.map((option) => (
												<div key={option.id} className="flex items-start gap-2">
													<span className="font-medium">{option.label}.</span>
													<span
														className={
															option.isCorrect
																? "font-medium text-green-600"
																: ""
														}
													>
														{option.content}
														{option.isCorrect && " ✓"}
													</span>
												</div>
											))}
										</div>
									)}

								{/* Canonical Answer */}
								{examQuestion.question.canonicalAnswer && (
									<div className="mt-3 rounded border-l-4 border-green-500 bg-green-50 p-3">
										<p className="text-sm">
											<span className="font-semibold text-green-700">
												Đáp án:{" "}
											</span>
											{examQuestion.question.canonicalAnswer}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
