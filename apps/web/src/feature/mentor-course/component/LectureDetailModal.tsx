import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import {
	CheckCircle,
	FileText,
	HelpCircle,
	Video,
	X,
	XCircle,
} from "lucide-react";
import {
	useLectureQuiz,
	useLectureText,
	useVideoUrls,
} from "@/feature/lecture/queries/useLecture";
import type { LectureDetail } from "@/feature/lecture/types/lecture.type";

interface LectureDetailModalProps {
	lecture: LectureDetail;
	onClose: () => void;
	onEdit: () => void;
}

export const LectureDetailModal = ({
	lecture,
	onClose,
	onEdit,
}: LectureDetailModalProps) => {
	const { data: textData, isLoading: textLoading } = useLectureText(
		lecture.type === "TEXT" ? lecture.id : 0,
	);
	const { data: quizData, isLoading: quizLoading } = useLectureQuiz(
		lecture.type === "QUIZ" ? lecture.id : 0,
	);
	const { m3u8Url } = useVideoUrls(lecture.type === "VIDEO" ? lecture.id : 0);

	const renderContent = () => {
		switch (lecture.type) {
			case "VIDEO":
				return (
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-blue-600">
							<Video className="h-5 w-5" />
							<span className="font-medium">Bài học Video</span>
						</div>
						<div className="aspect-video overflow-hidden rounded-lg bg-black">
							<video
								src={m3u8Url}
								controls
								className="h-full w-full"
								poster="/video-placeholder.jpg"
							>
								<track kind="captions" srcLang="vi" label="Tiếng Việt" />
								Trình duyệt không hỗ trợ video
							</video>
						</div>
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
						<div className="prose max-w-none rounded-lg border bg-gray-50 p-4">
							<div className="whitespace-pre-wrap">
								{textData?.content || "Không có nội dung"}
							</div>
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
									Điểm đạt: {((quizData?.passPercent || 0) * 100).toFixed(0)}%
								</span>
								<span>Số lần làm tối đa: {quizData?.maxAttempts || 0}</span>
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
			<Card className="max-h-[90vh] w-full max-w-4xl overflow-hidden">
				<div className="flex items-center justify-between border-b p-4">
					<div>
						<h2 className="text-xl font-bold">{lecture.title}</h2>
						{lecture.description && (
							<p className="mt-1 text-sm text-gray-600">
								{lecture.description}
							</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={lecture.isPreviewable ? "secondary" : "outline"}>
							{lecture.isPreviewable ? "Cho xem trước" : "Không xem trước"}
						</Badge>
						<Button variant="outline" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
					{renderContent()}
				</div>

				<div className="flex justify-end gap-3 border-t p-4">
					<Button variant="outline" onClick={onClose}>
						Đóng
					</Button>
					<Button onClick={onEdit}>Chỉnh sửa</Button>
				</div>
			</Card>
		</div>
	);
};
