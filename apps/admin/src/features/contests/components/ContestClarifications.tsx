import React, { useState } from "react";
import { useClarifications, useAnswerClarification } from "../queries/useContest";
import { MessageSquare, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ContestClarificationsProps {
  contestId: string;
}

export const ContestClarifications: React.FC<ContestClarificationsProps> = ({ contestId }) => {
  const { data: clarifications, isLoading } = useClarifications(contestId);
  const answerMutation = useAnswerClarification();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [publicFlags, setPublicFlags] = useState<Record<string, boolean>>({});

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleAnswerChange = (clarificationId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [clarificationId]: value }));
  };

  const handlePublicChange = (clarificationId: string, isPublic: boolean) => {
    setPublicFlags((prev) => ({ ...prev, [clarificationId]: isPublic }));
  };

  const handleSubmitAnswer = (clarificationId: string) => {
    const answer = answers[clarificationId];
    const isPublic = publicFlags[clarificationId] || false;

    if (!answer || answer.trim() === "") {
      alert("Vui lòng nhập câu trả lời");
      return;
    }

    answerMutation.mutate(
      {
        contestId,
        clarificationId,
        request: { answer, isPublic },
      },
      {
        onSuccess: () => {
          setAnswers((prev) => ({ ...prev, [clarificationId]: "" }));
          setPublicFlags((prev) => ({ ...prev, [clarificationId]: false }));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Đang tải danh sách câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Hỏi đáp ({clarifications?.length || 0})</h3>
        <p className="text-sm text-gray-600">Quản lý câu hỏi từ thí sinh trong cuộc thi</p>
      </div>

      {!clarifications || clarifications.length === 0 ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Chưa có câu hỏi nào</h4>
              <p className="text-sm text-gray-600">Các câu hỏi từ thí sinh sẽ hiển thị ở đây</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clarifications.map((clarification) => (
            <Card key={clarification.clarificationId} className="bg-white border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {clarification.problemLabel && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                          Bài {clarification.problemLabel}
                        </Badge>
                      )}
                      {clarification.isPublic ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          Công khai
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                          Riêng tư
                        </Badge>
                      )}
                      {clarification.answer && (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đã trả lời
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-900">Từ: {clarification.askedBy}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(clarification.createdAt)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Câu hỏi:</p>
                  <p className="text-sm text-gray-900">{clarification.question}</p>
                </div>

                {clarification.answer ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Câu trả lời:</p>
                    <p className="text-sm text-gray-900 mb-2">{clarification.answer}</p>
                    <p className="text-xs text-gray-500">
                      Trả lời bởi: {clarification.answeredBy} • {formatDateTime(clarification.answeredAt!)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Nhập câu trả lời..."
                      value={answers[clarification.clarificationId] || ""}
                      onChange={(e) => handleAnswerChange(clarification.clarificationId, e.target.value)}
                      className="min-h-24"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={publicFlags[clarification.clarificationId] || false}
                          onChange={(e) => handlePublicChange(clarification.clarificationId, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Công khai cho tất cả thí sinh</span>
                      </label>
                      <Button
                        onClick={() => handleSubmitAnswer(clarification.clarificationId)}
                        disabled={answerMutation.isPending}
                        className="bg-primary hover:bg-blue-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Gửi trả lời
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
