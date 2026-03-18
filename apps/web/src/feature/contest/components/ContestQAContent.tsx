import React, { useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { Search, MessageSquarePlus, ShieldCheck, Lock, Globe, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hỏi đáp & Giải thích</h2>
              <p className="text-sm text-gray-500 mt-1">Gửi thắc mắc về đề bài cho Ban tổ chức</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Ask Question Button */}
              <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                        <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                          {getAuthorInitials(clarification.askedBy)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{clarification.askedBy}</span>
                          <span className="text-xs text-gray-400 font-medium">
                            {formatTime(clarification.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {clarification.problemLabel ? `Bài ${clarification.problemLabel}` : "Chung"}
                          </Badge>
                          <Badge
                            variant={clarification.isPublic ? "default" : "outline"}
                            className={`text-xs px-1.5 py-0.5 flex items-center gap-1 ${
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

                    {/* Status Badge */}
                    <Badge
                      variant={clarification.answer ? "default" : "secondary"}
                      className={`text-xs px-2.5 py-1 ${
                        clarification.answer ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {clarification.answer ? "Đã trả lời" : "Đang chờ"}
                    </Badge>
                  </div>

                  {/* Question Content */}
                  <p className="text-sm text-gray-700 leading-relaxed">{clarification.question}</p>

                  {/* Answer */}
                  {clarification.answer && clarification.answeredBy && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-semibold text-gray-700">{clarification.answeredBy}</span>
                        </div>
                        {clarification.answeredAt && (
                          <span className="text-xs text-gray-400 font-medium">
                            {formatTime(clarification.answeredAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 italic">{clarification.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
              <div className="text-sm text-gray-500">
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
