import React from "react";
import {
	BookOpen,
	CheckCircle,
	Code2,
	FileText,
	HelpCircle,
	Video,
	XCircle,
	X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLectureQuiz, useLectureText } from "../queries/useLecture";
import { useProblemDetail } from "@/features/problems/queries/useProblem";
import { difficultyLabel } from "./ProblemPicker";
import HlsVideoPlayer from "./VideoPlayer";
import { LectureDetail } from "../types/lecture.type";

interface LectureDetailModalProps {
	lecture: LectureDetail;
	onClose: () => void;
	onEdit: () => void;
}

const LinkedProblemRow: React.FC<{ problemId: string }> = ({ problemId }) => {
	const { data: problem, isLoading } = useProblemDetail(problemId);

	if (isLoading)
		return <div className="h-9 animate-pulse rounded-lg bg-gray-100" />;
	if (!problem) return null;

	const diff = difficultyLabel[problem.difficulty];

	return (
		<div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2">
			<Code2 className="h-4 w-4 shrink-0 text-blue-500" />
			<span className="flex-1 truncate text-sm font-medium text-gray-700">
				{problem.title}
			</span>
			{diff && (
				<span
					className={`shrink-0 rounded border px-2 py-0.5 text-xs font-semibold ${diff.color}`}
				>
					{diff.label}
				</span>
			)}
			{problem.classLevel && (
				<span className="flex shrink-0 items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
					<BookOpen className="h-3 w-3" />
					Lớp {problem.classLevel}
				</span>
			)}
		</div>
	);
};

export const LectureDetailModal: React.FC<LectureDetailModalProps> = ({
	lecture,
	onClose,
	onEdit,
}) => {
	const { data: textData, isLoading: textLoading } = useLectureText(
		lecture.type === "TEXT" ? lecture.id : 0,
	);
	const { data: quizData, isLoading: quizLoading } = useLectureQuiz(
		lecture.type === "QUIZ" ? lecture.id : 0,
	);

	const renderContent = () => {
		switch (lecture.type) {
			case "VIDEO":
				return (
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-blue-600">
							<Video className="h-5 w-5" />
							<span className="font-medium">Bài học Video</span>
						</div>
						{lecture.description && (
							<div className="rounded-lg border bg-gray-50 p-4">
								<div
									dangerouslySetInnerHTML={{ __html: lecture.description }}
									className="prose prose-sm max-w-none"
								/>
							</div>
						)}
						<HlsVideoPlayer lectureId={lecture.id} />
					</div>
				);

			case "TEXT":
				if (textLoading) {
					return (
						<div className="py-8 text-center text-gray-500">
							Đang tải nội dung...
						</div>
					);
				}
				return (
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-green-600">
							<FileText className="h-5 w-5" />
							<span className="font-medium">Bài học Văn bản</span>
						</div>
						{textData?.problemId && (
							<div className="space-y-1">
								<p className="text-xs font-medium text-gray-400">
									Bài tập gắn kèm
								</p>
								<LinkedProblemRow problemId={textData.problemId} />
							</div>
						)}
						<div className="prose prose-sm max-w-none rounded-lg border bg-white p-6">
							<div
								dangerouslySetInnerHTML={{
									__html: textData?.content || "<p>Không có nội dung</p>",
								}}
								className="lecture-content"
							/>
						</div>
					</div>
				);

			case "QUIZ":
				if (quizLoading) {
					return (
						<div className="py-8 text-center text-gray-500">
							Đang tải câu hỏi...
						</div>
					);
				}
				return (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-purple-600">
								<HelpCircle className="h-5 w-5" />
								<span className="font-medium">Bài kiểm tra</span>
							</div>
							<div className="flex gap-4 text-sm text-gray-600">
								<span>
									Phần trăm đúng tối thiểu:{" "}
									{((quizData?.passPercent || 0) * 100).toFixed(0)}%
								</span>
							</div>
						</div>

						<div className="space-y-4">
							{quizData?.quizzes?.map((quiz, qIdx) => (
								<Card key={quiz.id} className="p-4">
									<h4 className="mb-3 font-medium">
										Câu {qIdx + 1}: {quiz.questionText}
									</h4>
									<div className="space-y-2">
										{quiz.answers?.map((answer, aIdx) => (
											<div
												key={answer.id}
												className={`flex items-center gap-2 rounded-lg border p-3 ${
													answer.isCorrect
														? "border-green-300 bg-green-50"
														: "border-gray-200 bg-gray-50"
												}`}
											>
												{answer.isCorrect ? (
													<CheckCircle className="h-4 w-4 text-green-600" />
												) : (
													<XCircle className="h-4 w-4 text-gray-400" />
												)}
												<span
													className={
														answer.isCorrect ? "font-medium text-green-700" : ""
													}
												>
													{String.fromCharCode(65 + aIdx)}. {answer.answerText}
												</span>
												{answer.isCorrect && (
													<Badge
														variant="secondary"
														className="ml-auto text-xs"
													>
														Đáp án đúng
													</Badge>
												)}
											</div>
										))}
									</div>
								</Card>
							))}
						</div>
					</div>
				);

			default:
				return (
					<div className="py-8 text-center text-gray-500">
						Loại bài học không xác định
					</div>
				);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden py-0">
				<div className="flex items-center justify-between border-b p-4">
					<div className="flex-1">
						<h2 className="text-xl font-bold">{lecture.title}</h2>
						{lecture.description && lecture.type === "TEXT" && (
							<div className="mt-2 text-sm text-gray-600">
								{lecture.description}
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Badge
							className="text-sm"
							variant={lecture.isPreviewable ? "secondary" : "outline"}
						>
							{lecture.isPreviewable ? "Cho xem trước" : "Không xem trước"}
						</Badge>
						<Button variant="outline" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto px-6">{renderContent()}</div>

				<div className="flex justify-end gap-2 border-t bg-gray-50 p-4">
					<Button variant="outline" onClick={onClose}>
						Đóng
					</Button>
					<Button onClick={onEdit}>Chỉnh sửa</Button>
				</div>
			</Card>
		</div>
	);
};

export default LectureDetailModal;
