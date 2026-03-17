import React from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, Star, ChevronLeft, ChevronRight, GraduationCap, LayoutDashboard } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { ContestCard } from "./ContestCard";
import { ContestListDTO, ContestStatus } from "../types/contest.type";

interface ContestListContentProps {
  contests: (ContestListDTO & {
    description?: string;
    durationMinutes?: number;
    progress?: number;
    timeLeft?: string;
    countdown?: {
      d?: number;
      h?: number;
      m?: number;
      s?: number;
    };
    myRank?: number | null;
    myScore?: {
      current: number;
      total: number;
    };
  })[];
  totalContests: number;
  viewMode: "list" | "my-contests";
  selectedGrade: number;
  setSelectedGrade: (grade: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ContestListContent: React.FC<ContestListContentProps> = ({
  contests,
  totalContests,
  viewMode,
  selectedGrade,
  setSelectedGrade,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const grades: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11];

  const ongoingCount = contests.filter((c) => c.status === ContestStatus.RUNNING).length;
  const upcomingCount = contests.filter((c) => c.status === ContestStatus.UPCOMING).length;
  const endedCount = contests.filter((c) => c.status === ContestStatus.ENDED).length;

  const isMyContestsView = viewMode === "my-contests";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-360 mx-auto w-full px-6 lg:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Status Filters */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                Kỳ thi
              </h3>
              <div className="space-y-2">
                <Link to="/contests">
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all font-medium ${
                      !isMyContestsView
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Tất cả kỳ thi</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        !isMyContestsView ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {totalContests}
                    </span>
                  </button>
                </Link>

                <Link to="/contests/my">
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all font-medium ${
                      isMyContestsView
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Star className={`w-5 h-5 ${isMyContestsView ? "text-white" : "text-yellow-500"}`} />
                      <span>Kỳ thi của tôi</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isMyContestsView ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {totalContests}
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Grade Filters */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Khối lớp
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {grades.map((grade) => (
                  <Button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    variant="outline"
                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                      selectedGrade === grade
                        ? "border-2 border-blue-600 bg-blue-50 text-blue-600"
                        : "border border-gray-200 hover:border-blue-600 hover:text-blue-600"
                    }`}
                  >
                    Lớp {grade}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="col-span-3 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:border-blue-600 hover:text-blue-600"
                >
                  Lớp 12 & Chuyên
                </Button>
              </div>
            </div>

            {/* Challenge Card */}
            <Card className="bg-blue-600 text-white border-0">
              <CardContent className="p-6">
                <Trophy className="w-10 h-10 opacity-80 mb-4" />
                <h4 className="text-xl font-bold mb-2">Thách thức bản thân!</h4>
                <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                  Tham gia các kỳ thi để tích lũy điểm thưởng và nâng cao thứ hạng.
                </p>
                <Button className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50">
                  Xem Bảng Xếp Hạng
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Contest List */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {isMyContestsView ? "Kỳ thi của tôi" : "Kỳ thi Tin học"}
                </h1>
                <p className="text-gray-500 mt-2">
                  {isMyContestsView
                    ? "Quản lý các kỳ thi bạn đã đăng ký tham gia."
                    : "Nơi hội tụ của những tài năng lập trình trẻ."}
                </p>
              </div>
              <div className="flex gap-2">
                {ongoingCount > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></span>
                    {ongoingCount} Đang diễn ra
                  </Badge>
                )}
                {upcomingCount > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 border-0">{upcomingCount} Sắp tới</Badge>
                )}
                {isMyContestsView && endedCount > 0 && (
                  <Badge className="bg-gray-100 text-gray-700 border-0">{endedCount} Đã kết thúc</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {contests.map((contest) => (
                <ContestCard key={contest.contestId} contest={contest} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <nav className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    isDisabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    isDisabled={currentPage >= totalPages - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
