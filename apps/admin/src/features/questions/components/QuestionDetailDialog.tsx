import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { QuestionLevel, QuestionType, ApprovalStatus, type QuestionResponse } from "../types/question.type";
import { cn } from "@/shared/lib/utils";
import { useApproveQuestions, useRejectQuestions } from "../queries/useQuestion";
import { RejectDialog } from "./RejectDialog";

interface QuestionDetailDialogProps {
  question: QuestionResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showApprovalActions?: boolean;
}

export function QuestionDetailDialog({
  question,
  open,
  onOpenChange,
  showApprovalActions = false,
}: QuestionDetailDialogProps) {
  const [rejectOpen, setRejectOpen] = useState(false);

  const approveQuestions = useApproveQuestions();
  const rejectQuestions = useRejectQuestions();

  if (!question) return null;

  const isPending = question.approvalStatus === ApprovalStatus.PENDING;
  const showActions = showApprovalActions && isPending;

  const getDifficultyColor = (level: QuestionLevel) => {
    const colors = {
      [QuestionLevel.EASY]: "bg-green-100 text-green-700",
      [QuestionLevel.MEDIUM]: "bg-yellow-100 text-yellow-700",
      [QuestionLevel.HARD]: "bg-red-100 text-red-700",
    };
    return colors[level];
  };

  const handleApprove = () => {
    approveQuestions.mutate(
      { questionIds: [question.id] },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const handleReject = (reason: string) => {
    rejectQuestions.mutate(
      { questionIds: [question.id], rejectReason: reason },
      {
        onSuccess: () => {
          setRejectOpen(false);
          onOpenChange(false);
        },
      },
    );
  };

  const isProcessing = approveQuestions.isPending || rejectQuestions.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !isProcessing && onOpenChange(o)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết câu hỏi</DialogTitle>
            <DialogDescription>Xem chi tiết nội dung và thông tin câu hỏi</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDifficultyColor(question.questionLevel)}>
                {question.questionLevel === QuestionLevel.EASY && "Dễ"}
                {question.questionLevel === QuestionLevel.MEDIUM && "Trung bình"}
                {question.questionLevel === QuestionLevel.HARD && "Khó"}
              </Badge>
              <Badge variant="outline">{question.questionType === QuestionType.MCQ ? "Trắc nghiệm" : "Tự luận"}</Badge>
              {question.lesson && <Badge variant="secondary">{question.lesson.name}</Badge>}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Nội dung câu hỏi</h3>
              <p className="text-sm leading-relaxed">{question.content}</p>
            </div>

            {question.canonicalAnswer && (
              <div>
                <h3 className="font-semibold mb-2">Đáp án mẫu</h3>
                <p className="text-sm leading-relaxed">{question.canonicalAnswer}</p>
              </div>
            )}

            {question.options && question.options.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Các lựa chọn</h3>
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        option.isCorrect ? "bg-green-50 border-green-200" : "bg-muted/50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-semibold min-w-6">{option.label}</span>
                        <div className="flex-1">
                          <p className="text-sm">{option.content}</p>
                          {option.isCorrect && (
                            <Badge variant="outline" className="mt-2">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đáp án đúng
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Môn học</h3>
                <p className="text-sm">{question.subject?.name || "Chưa có"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Chương</h3>
                <p className="text-sm">{question.chapter?.name || "Chưa có"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Ngày tạo</h3>
                <p className="text-sm">{new Date(question.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Cập nhật</h3>
                <p className="text-sm">{new Date(question.updatedAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            {question.tags && question.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {showActions && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setRejectOpen(true)}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4" />
                  Từ chối
                </Button>
                <Button
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {approveQuestions.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Phê duyệt
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        count={1}
        isPending={rejectQuestions.isPending}
      />
    </>
  );
}
