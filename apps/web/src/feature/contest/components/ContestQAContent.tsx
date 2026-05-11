import React, { useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { Search, MessageSquarePlus, ShieldCheck, Lock, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Avatar, AvatarFallback } from "@workspace/ui/components/Avatar";
import CreateClarificationModal from "./CreateClarificationModal";
import { useClarifications } from "../queries/useContest";
import { useContestProblems } from "../queries/useContest";

const ContestQAContent: React.FC = () => {
  const { id: contestId } = useParams({ strict: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  const { data: clarificationsData, isLoading } = useClarifications(contestId || "", currentPage, pageSize);
  const { data: problemsData } = useContestProblems(contestId || "");

  const clarifications = clarificationsData?.data || [];
  const totalPages = clarificationsData?.page?.totalPages || 0;
  const totalElements = clarificationsData?.page?.totalElements || 0;
  const problems = problemsData?.data || [];

  const filteredClarifications = useMemo(() => {
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
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-md text-slate-800">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-full overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hỏi đáp & Giải thích</h2>
              <p className="text-md text-gray-500 mt-1">Gửi thắc mắc về đề bài cho Ban tổ chức</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-120">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-md text-md font-medium focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>

              <Button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-5 text-md"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Đặt câu hỏi
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredClarifications.map((clarification) => (
              <Card
                key={clarification.clarificationId}
                className="group transition-all duration-200 hover:shadow-md border border-gray-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-md bg-gray-100 text-gray-600">
                          {getAuthorInitials(clarification.askedBy)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-md font-semibold uppercase text-gray-900">{clarification.askedBy}</span>
                          <span className="text-sm text-gray-400">{formatTime(clarification.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                            {clarification.problemLabel ? `Bài ${clarification.problemLabel}` : "Chung"}
                          </Badge>

                          <Badge
                            className={`text-[11px] px-2 py-0.5 flex items-center gap-1 ${
                              clarification.isPublic ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
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

                    <Badge
                      className={`text-[11px] px-2 py-1 ${
                        clarification.answer ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {clarification.answer ? "Đã trả lời" : "Đang chờ"}
                    </Badge>
                  </div>

                  <p className="mt-3 text-md text-gray-800 leading-relaxed">{clarification.question}</p>

                  {clarification.answer && clarification.answeredBy && (
                    <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-700">{clarification.answeredBy}</span>
                        </div>

                        {clarification.answeredAt && (
                          <span className="text-sm text-gray-400">{formatTime(clarification.answeredAt)}</span>
                        )}
                      </div>

                      <p className="text-md text-gray-800">{clarification.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
              <div className="text-md text-gray-500">
                Đang xem {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} /{" "}
                {totalElements}
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
                    className={`w-8 h-8 ${currentPage === i ? "bg-blue-600 text-white" : ""}`}
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
          )}
        </div>
      </div>

      <CreateClarificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contestId={contestId || ""}
        problems={problems}
      />
    </>
  );
};

export default ContestQAContent;
