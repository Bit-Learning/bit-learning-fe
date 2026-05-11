import { useState } from "react";
import { XCircle, Edit, Trash2, BookOpen, GraduationCap, Tag, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useNavigate } from "@tanstack/react-router";
import { useQuestion, useDeleteQuestion } from "../queries/useQuestion";
import MediaUploadPanel from "./MediaUploadPanel";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import { getTypeBadge, getStatusBadge, getDifficultyBadge } from "../utils/question.utils";
import { ApprovalStatus, type QuestionResponse } from "../types/question.type";

interface DetailModalProps {
  question?: QuestionResponse;
  questionId?: number;
  onClose: () => void;
  formatDate?: (d: string) => string;
}

const defaultFormatDate = (d: string) =>
  new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export function DetailModal({
  question: questionProp,
  questionId,
  onClose,
  formatDate = defaultFormatDate,
}: DetailModalProps) {
  const resolvedId = questionId ?? questionProp?.id;

  const { data: fetchedQuestion, isLoading } = useQuestion(resolvedId!, { enabled: !!resolvedId });
  const question = fetchedQuestion ?? questionProp;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Card className="max-w-4xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">Chi tiết câu hỏi</CardTitle>
                {question && (
                  <div className="flex flex-wrap items-center gap-2">
                    {getDifficultyBadge(question.questionLevel)}
                    {getTypeBadge(question.questionType)}
                    {getStatusBadge(question.approvalStatus)}
                    {question.requestedBy && (
                      <span className="px-2 py-1 rounded text-sm font-medium bg-blue-100  text-slate-900">
                        Giảng viên: {question.requestedBy.firstName + " " + question.requestedBy.lastName}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  className="cursor-pointer p-2 text-slate-500 hover:text-red-600 transition-colors rounded-md"
                  onClick={onClose}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-3 space-y-6">
            {isLoading && !question && (
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}

            {question && (
              <>
                {question.approvalStatus === ApprovalStatus.REJECTED && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="shrink-0 mt-0.5">
                      <svg className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-700">Câu hỏi bị từ chối</p>
                      <p className="mt-1 text-md text-black">
                        Lí do: {question.rejectReason ?? "Không có lý do cụ thể."}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-md text-slate-500">Môn học</p>
                      <p className="text-md font-medium text-slate-900">{question.subject?.name || "Chưa có"}</p>
                    </div>
                  </div>
                  {question.lesson && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-md text-slate-500">Bài học</p>
                        <p className="text-md font-medium text-slate-900">{question.lesson.name}</p>
                      </div>
                    </div>
                  )}
                  {question.chapter && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-md text-slate-500">Chương</p>
                        <p className="text-md font-medium text-slate-900">{question.chapter.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-md text-slate-500">Ngày tạo</p>
                      <p className="text-md font-medium text-slate-900">{formatDate(question.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Nội dung câu hỏi
                  </h3>
                  <p className="text-base leading-relaxed text-slate-900">{question.content}</p>
                </div>

                {question.mediaUrl && (
                  <div>
                    <h3 className="font-semibold mb-2">Media đính kèm</h3>
                    {question.mediaType === "IMAGE" ? (
                      <img
                        src={question.mediaUrl}
                        alt="Question media"
                        className="w-full max-h-80 object-contain rounded-lg border border-slate-200"
                      />
                    ) : (
                      <video
                        src={question.mediaUrl}
                        controls
                        className="w-full max-h-80 rounded-lg border border-slate-200"
                      />
                    )}
                  </div>
                )}

                {question.options && question.options.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-slate-500 uppercase tracking-wide mb-3">Các lựa chọn</h3>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`rounded-lg border p-3 transition-colors ${
                            option.isCorrect ? "border-green-400 bg-green-50" : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-base w-5 shrink-0">{option.label}</span>
                            <p className="flex-1 text-base text-slate-900">{option.content}</p>
                            {option.isCorrect && (
                              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-sm font-bold bg-green-600 text-white">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.canonicalAnswer && (
                  <div>
                    <h3 className="text-md font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Đáp án / Hướng dẫn giải
                    </h3>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-900">{question.canonicalAnswer}</p>
                    </div>
                  </div>
                )}

                {question.tags && question.tags.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-slate-400" />
                      <p className="text-md font-semibold text-slate-500 uppercase tracking-wide">Tags</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
