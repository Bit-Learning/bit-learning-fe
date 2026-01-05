import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { ArrowLeft, Edit } from "lucide-react";
import { apiClient } from "@/shared/lib/apiClient";

export default function QuestionDetail() {
	const params = useParams({ strict: false });
	const questionId = (params as any).id
		? Number((params as any).id)
		: undefined;

	const {
		data: question,
		isLoading,
		error,
	} = useQuery({
		...apiClient.question.getQuestionById(questionId!),
		enabled: !!questionId,
	});

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

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Link to={"/questions/my" as any}>
					<Button variant="ghost" className="mb-4 gap-2">
						<ArrowLeft className="h-4 w-4" />
						Quay lại danh sách
					</Button>
				</Link>
				<div className="flex items-center justify-between">
					<h1 className="text-4xl font-bold">Chi tiết câu hỏi</h1>
					<Link to={`/questions/${questionId}/edit` as any}>
						<Button className="gap-2">
							<Edit className="h-4 w-4" />
							Chỉnh sửa
						</Button>
					</Link>
				</div>
			</div>

			{/* Question Info */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center gap-3">
						{getQuestionTypeBadge(question.questionType)}
						{getLevelBadge(question.questionLevel)}
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Content */}
					<div>
						<h3 className="mb-2 font-semibold text-gray-700">
							Nội dung câu hỏi:
						</h3>
						<p className="text-lg">{question.content}</p>
					</div>

					{/* Options (if MCQ) */}
					{question.questionType === "MCQ" && question.options && (
						<div>
							<h3 className="mb-3 font-semibold text-gray-700">Các đáp án:</h3>
							<div className="space-y-2">
								{question.options.map((option: any) => (
									<div
										key={option.id}
										className={`rounded-lg border p-3 ${
											option.isCorrect
												? "border-green-500 bg-green-50"
												: "border-gray-200 bg-white"
										}`}
									>
										<div className="flex items-center gap-3">
											<span className="font-semibold">{option.label}.</span>
											<span>{option.content}</span>
											{option.isCorrect && (
												<Badge className="ml-auto bg-green-600">
													Đáp án đúng
												</Badge>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Canonical Answer */}
					<div>
						<h3 className="mb-2 font-semibold text-gray-700">
							Đáp án chi tiết:
						</h3>
						<div className="rounded-lg bg-gray-50 p-4">
							<p className="whitespace-pre-wrap">{question.canonicalAnswer}</p>
						</div>
					</div>

					{/* Metadata */}
					<div className="grid grid-cols-2 gap-4 border-t pt-6">
						<div>
							<span className="text-sm text-gray-500">Môn học:</span>
							<p className="font-medium">{question.subject?.name || "-"}</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Bài học:</span>
							<p className="font-medium">{question.lesson?.name || "-"}</p>
						</div>
						{question.tags && question.tags.length > 0 && (
							<div className="col-span-2">
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
		</div>
	);
}
