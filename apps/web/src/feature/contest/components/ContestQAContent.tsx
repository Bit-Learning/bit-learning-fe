import React, { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Search, MessageSquarePlus, ShieldCheck, Lock, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Avatar, AvatarFallback } from "@workspace/ui/components/Avatar";
import CreateClarificationModal from "./CreateClarificationModal";
// import { useClarifications } from "../queries/useContest";
// import { useContestProblems } from "../queries/useContest";
// import type { ClarificationResponse } from "../types/contest.type";

interface MockClarification {
  clarificationId: string;
  problemLabel: string | null;
  question: string;
  answer: string | null;
  isPublic: boolean;
  askedBy: string;
  answeredBy: string | null;
  createdAt: string;
  answeredAt: string | null;
}

const ContestQAContent: React.FC = () => {
  const { id: contestId } = useParams({ strict: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  // const { data: clarificationsData, isLoading } = useClarifications(contestId || "", currentPage, pageSize);
  // const { data: problemsData } = useContestProblems(contestId || "");

  const mockProblems = [
    { contestProblemId: "problem-a", label: "A", title: "Hai số tổng" },
    { contestProblemId: "problem-b", label: "B", title: "Tìm kiếm nhị phân" },
    { contestProblemId: "problem-c", label: "C", title: "Quy hoạch động" },
  ];

  const mockClarifications: MockClarification[] = [
    {
      clarificationId: "1",
      problemLabel: "A",
      question:
        "Trong bài A, giới hạn của số nguyên N là $10^9$ hay $10^{18}$ ạ? Em thấy trong ví dụ có số lớn hơn $10^9$.",
      answer:
        "Chào bạn, giới hạn đúng là $10^{18}$ nhé. Ban tổ chức đã cập nhật lại phần mô tả đề bài. Cảm ơn bạn đã phản hồi.",
      isPublic: true,
      askedBy: "Minh Tran",
      answeredBy: "Admin - Ban tổ chức",
      createdAt: "2025-03-05T10:20:00",
      answeredAt: "2025-03-05T10:25:00",
    },
    {
      clarificationId: "2",
      problemLabel: null,
      question: "Cho em hỏi về cách chấm điểm bài nộp cuối cùng hay bài nộp có điểm cao nhất ạ? Em lỡ nộp lại bài cũ.",
      answer: null,
      isPublic: false,
      askedBy: "Anh Nguyen",
      answeredBy: null,
      createdAt: "2025-03-05T11:05:00",
      answeredAt: null,
    },
    {
      clarificationId: "3",
      problemLabel: "C",
      question:
        "Thời gian thực thi của bài C là bao nhiêu giây? Đề bài ghi 1s nhưng em thấy bài tương tự thường là 2s.",
      answer:
        "Time limit 1.0s là chính xác. Thuật toán tối ưu có thể chạy trong khoảng 0.3s. Bạn hãy tối ưu lại cấu trúc dữ liệu.",
      isPublic: true,
      askedBy: "Le Quang Tu",
      answeredBy: "Admin - Technical Team",
      createdAt: "2025-03-05T09:15:00",
      answeredAt: "2025-03-05T09:20:00",
    },
  ];

  const isLoading = false;
  const clarifications = mockClarifications;
  const totalPages = 3;
  const totalElements = 24;

  const filteredClarifications = React.useMemo(() => {
    if (!searchQuery) return clarifications;

    return clarifications.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.problemLabel?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [clarifications, searchQuery]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateString;
    }
  };

  const getAuthorInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500">Đang tải câu hỏi...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Hỏi đáp & Giải thích</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gửi thắc mắc về đề bài cho Ban tổ chức</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Ask Question Button */}
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-blue-600 text-white shadow-md"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Đặt câu hỏi
              </Button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredClarifications.map((clarification) => (
              <Card key={clarification.clarificationId} className="overflow-hidden">
                <CardContent className="p-5">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {getAuthorInitials(clarification.askedBy)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {clarification.askedBy}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {formatTime(clarification.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs uppercase px-1.5 py-0.5">
                            {clarification.problemLabel ? `Bài ${clarification.problemLabel}` : "Chung"}
                          </Badge>
                          <Badge
                            variant={clarification.isPublic ? "default" : "outline"}
                            className={`text-xs uppercase px-1.5 py-0.5 flex items-center gap-1 ${
                              clarification.isPublic
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-0"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-0"
                            }`}
                          >
                            {clarification.isPublic ? (
                              <>
                                <Globe className="w-3 h-3" /> Công khai
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" /> Riêng tư
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={clarification.answer ? "default" : "secondary"}
                      className={`text-xs uppercase tracking-wider px-2.5 py-1 ${
                        clarification.answer
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-0"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-0"
                      }`}
                    >
                      {clarification.answer ? "Đã trả lời" : "Đang chờ"}
                    </Badge>
                  </div>

                  {/* Question Content */}
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{clarification.question}</p>

                  {/* Answer */}
                  {clarification.answer && clarification.answeredBy && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-emerald-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {clarification.answeredBy}
                          </span>
                        </div>
                        {clarification.answeredAt && (
                          <span className="text-xs text-slate-400 font-medium">
                            {formatTime(clarification.answeredAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">{clarification.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Đang xem {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} trên{" "}
              {totalElements} thắc mắc
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                isDisabled={currentPage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i ? "default" : "ghost"}
                  size="icon"
                  className={`w-8 h-8 ${currentPage === i ? "bg-primary text-white shadow-sm" : ""}`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                isDisabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreateClarificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contestId={contestId || ""}
        problems={mockProblems}
      />
    </>
  );
};

export default ContestQAContent;
