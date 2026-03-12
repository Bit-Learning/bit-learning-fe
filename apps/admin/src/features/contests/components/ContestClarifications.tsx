import React, { useState } from "react";
// import { useClarifications, useAnswerClarification } from "../queries/useContest";
import { Search, MessageSquare, Lock, Globe, MoreHorizontal, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContestClarificationsProps {
  contestId: string;
}

const MOCK_CLARIFICATIONS = [
  {
    clarificationId: "1",
    problemLabel: "A",
    question: "Em có thể sử dụng thư viện math trong Python cho bài tập này không ạ?",
    answer: null,
    isPublic: false,
    askedBy: "Trần Minh Quân",
    answeredBy: null,
    createdAt: "2026-03-12T10:20:00",
    answeredAt: null,
    avatar: null,
  },
  {
    clarificationId: "2",
    problemLabel: "B",
    question: "Cho em hỏi input có chứa dấu cách không ạ?",
    answer: "Dòng input chỉ chứa các số nguyên, phân tách nhau bởi duy nhất một dấu cách nhé.",
    isPublic: true,
    askedBy: "Lê Văn Nam",
    answeredBy: "Admin",
    createdAt: "2026-03-12T09:15:00",
    answeredAt: "2026-03-12T09:35:00",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDg2kjjvYYvpFPbClap9Q6rI_N5NuPtNlc0wSEDs-3dS6C2RfdlxpL12yzM5PkHarum9wruz_Dc1ibkaLChJojfUacZZzD_Is5XGqZcY6hJD52_EZaT0sOhIW3dGbMg9pKwXocNSIr6YhXEQ1Fb-XBOVSGRTO0QKJ5kYXglWOrQVJiNuLEto7Kmeyr82JKV5g4dv6HEv8xxqGU7CTwHtU6pIQAybSZwkvFW8ZhPd2wkQyZoiDfvWs1FZE3yT56M5ZCVpBPJZx62ckhK",
  },
  {
    clarificationId: "3",
    problemLabel: "C",
    question: "Tại sao code của em bị Time Limit Exceeded ở testcase 5 ạ?",
    answer:
      "Admin không giải đáp các thắc mắc về logic thuật toán hoặc lý do code không đạt điểm tối đa trong quá trình thi. Bạn vui lòng kiểm tra lại độ phức tạp của thuật toán.",
    isPublic: false,
    askedBy: "Hoàng Phan",
    answeredBy: "Admin",
    createdAt: "2026-03-12T08:45:00",
    answeredAt: "2026-03-12T08:52:00",
    avatar: null,
  },
];

export const ContestClarifications: React.FC<ContestClarificationsProps> = ({ contestId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [problemFilter, setProblemFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClarification, setSelectedClarification] = useState<any>(null);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isPublicAnswer, setIsPublicAnswer] = useState(false);

  // const { data: clarifications, isLoading } = useClarifications(contestId);
  // const { mutate: answerClarification, isPending } = useAnswerClarification();

  const clarifications = MOCK_CLARIFICATIONS;
  const isLoading = false;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAnswerClick = (clarification: any) => {
    setSelectedClarification(clarification);
    setAnswerText("");
    setIsPublicAnswer(false);
    setIsAnswerDialogOpen(true);
  };

  const handleSubmitAnswer = () => {
    console.log("Submit answer:", {
      clarificationId: selectedClarification.clarificationId,
      answer: answerText,
      isPublic: isPublicAnswer,
    });
    // answerClarification({
    //   contestId,
    //   clarificationId: selectedClarification.clarificationId,
    //   request: {
    //     answer: answerText,
    //     isPublic: isPublicAnswer,
    //   },
    // }, {
    //   onSuccess: () => {
    //     setIsAnswerDialogOpen(false);
    //   },
    // });

    setIsAnswerDialogOpen(false);
  };

  const filteredClarifications = clarifications.filter((c) => {
    const matchesSearch =
      c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.askedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProblem = problemFilter === "all" || c.problemLabel === problemFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "answered" && c.answer) ||
      (statusFilter === "unanswered" && !c.answer);
    return matchesSearch && matchesProblem && matchesStatus;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-360 mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={problemFilter} onValueChange={setProblemFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tất cả bài tập" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bài tập</SelectItem>
              <SelectItem value="A">Bài tập A</SelectItem>
              <SelectItem value="B">Bài tập B</SelectItem>
              <SelectItem value="C">Bài tập C</SelectItem>
              <SelectItem value="D">Bài tập D</SelectItem>
              <SelectItem value="E">Bài tập E</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="unanswered">Chưa trả lời</SelectItem>
              <SelectItem value="answered">Đã trả lời</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="shadow-lg shadow-blue-500/20">
          <MessageSquare className="h-4 w-4 mr-2" />
          Phát thông báo
        </Button>
      </div>

      <div className="space-y-4">
        {filteredClarifications.map((clarification) => (
          <Card key={clarification.clarificationId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-5 border-b border-slate-50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={clarification.avatar || undefined} />
                    <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800">
                      {clarification.askedBy.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{clarification.askedBy}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{formatDateTime(clarification.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs font-semibold text-primary">Bài tập {clarification.problemLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {clarification.isPublic ? (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800"
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Công khai
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Lock className="w-3 h-3 mr-1" />
                      Riêng tư
                    </Badge>
                  )}
                  {clarification.answer ? (
                    <Badge className="bg-green-500 uppercase text-[10px]">Đã trả lời</Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase text-[10px]"
                    >
                      Chưa trả lời
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              {clarification.answer ? (
                <div className="p-5 bg-slate-50/30 dark:bg-slate-800/20">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 italic">"{clarification.question}"</p>
                  <div className="pl-4 border-l-2 border-primary/30">
                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-3">
                      {clarification.answer}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-[10px] text-white font-bold">
                        A
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {clarification.answeredBy}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Phản hồi lúc {formatDateTime(clarification.answeredAt!)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-5">
                    {clarification.question}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button onClick={() => handleAnswerClick(clarification)}>
                      <Send className="h-4 w-4 mr-2" />
                      Trả lời
                    </Button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Edit footer for answered */}
              {clarification.answer && (
                <div className="px-5 py-3 border-t border-slate-50 dark:border-slate-800/50 flex justify-end">
                  <button className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
                    Chỉnh sửa phản hồi
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hiển thị{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">1-{filteredClarifications.length}</span>{" "}
          trong <span className="font-semibold text-slate-900 dark:text-slate-100">24</span> yêu cầu
        </p>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons-round">chevron_left</span>
          </button>
          <button className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-sm font-bold shadow-sm">1</button>
          <button className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            2
          </button>
          <button className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            8
          </button>
          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Answer Dialog */}
      <Dialog open={isAnswerDialogOpen} onOpenChange={setIsAnswerDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Trả lời câu hỏi từ {selectedClarification?.askedBy}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Câu hỏi từ bài tập
                </span>
                <Badge className="text-[10px]">{selectedClarification?.problemLabel}. TWO SUM</Badge>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                "{selectedClarification?.question}"
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Câu trả lời của bạn
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                className="h-40"
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <Checkbox
                id="isPublicAnswer"
                checked={isPublicAnswer}
                onCheckedChange={(checked) => setIsPublicAnswer(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="isPublicAnswer" className="flex flex-col cursor-pointer">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Công khai câu trả lời cho tất cả thí sinh
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Các thí sinh khác có thể xem câu hỏi này và câu trả lời của bạn trong phần "Thông báo chung".
                </span>
              </label>
            </div>
          </div>

          <DialogFooter className="bg-slate-50/30 dark:bg-slate-900/50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
            <Button variant="outline" onClick={() => setIsAnswerDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitAnswer} disabled={!answerText.trim()}>
              Gửi phản hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
