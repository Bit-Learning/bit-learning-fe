import React from "react";
import { CheckCircle, FileText, HelpCircle, Video, XCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLectureQuiz, useLectureText } from "../queries/useLecture";
import type { LectureDetail } from "../types/course.type";
import HlsVideoPlayer from "./VideoPlayer";

interface LectureDetailModalProps {
  lecture: LectureDetail;
  onClose: () => void;
  onEdit: () => void;
}

export const LectureDetailModal: React.FC<LectureDetailModalProps> = ({ lecture, onClose, onEdit }) => {
  const { data: textData, isLoading: textLoading } = useLectureText(lecture.type === "TEXT" ? lecture.id : 0);
  const { data: quizData, isLoading: quizLoading } = useLectureQuiz(lecture.type === "QUIZ" ? lecture.id : 0);

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
                <div dangerouslySetInnerHTML={{ __html: lecture.description }} className="prose prose-sm max-w-none" />
              </div>
            )}
            <HlsVideoPlayer lectureId={lecture.id} />
          </div>
        );

      case "TEXT":
        if (textLoading) {
          return <div className="py-8 text-center text-gray-500">Đang tải nội dung...</div>;
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Bài học Văn bản</span>
            </div>
            <div className="prose prose-sm max-w-none rounded-lg border bg-white p-6">
              <div
                dangerouslySetInnerHTML={{ __html: textData?.content || "<p>Không có nội dung</p>" }}
                className="lecture-content"
              />
            </div>
          </div>
        );

      case "QUIZ":
        if (quizLoading) {
          return <div className="py-8 text-center text-gray-500">Đang tải câu hỏi...</div>;
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-600">
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Bài kiểm tra</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Điểm đạt: {((quizData?.passPercent || 0) * 100).toFixed(0)}%</span>
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
                          answer.isCorrect ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {answer.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={answer.isCorrect ? "font-medium text-green-700" : ""}>
                          {String.fromCharCode(65 + aIdx)}. {answer.answerText}
                        </span>
                        {answer.isCorrect && (
                          <Badge variant="secondary" className="ml-auto text-xs">
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
        return <div className="py-8 text-center text-gray-500">Loại bài học không xác định</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{lecture.title}</h2>
            {lecture.description && lecture.type === "TEXT" && (
              <div className="mt-2 text-sm text-gray-600">{lecture.description}</div>
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

        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

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
