import React from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, ListFilter, Star, ChevronLeft, ChevronRight, GraduationCap, LayoutDashboard } from "lucide-react";
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
  viewMode: "list" | "my-contests";
  selectedGrade: number;
  setSelectedGrade: (grade: number) => void;
}

export const ContestListContent: React.FC<ContestListContentProps> = ({
  contests,
  viewMode,
  selectedGrade,
  setSelectedGrade,
}) => {
  const grades: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11];

  const ongoingCount = contests.filter((c) => c.status === ContestStatus.RUNNING).length;
  const upcomingCount = contests.filter((c) => c.status === ContestStatus.UPCOMING).length;
  const endedCount = contests.filter((c) => c.status === ContestStatus.ENDED).length;

  const isMyContestsView = viewMode === "my-contests";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="max-w-360 mx-auto w-full px-6 lg:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-8">
            {/* Status Filters */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                Kỳ thi
              </h3>
              <div className="space-y-2">
                <Link to="/contests">
                  <button
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all font-medium ${
                      !isMyContestsView
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Tất cả kỳ thi</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        !isMyContestsView ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      24
                    </span>
                  </button>
                </Link>

                <Link to="/contests/my">
                  <button
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all font-medium ${
                      isMyContestsView
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Star className={`w-5 h-5 ${isMyContestsView ? "text-white" : "text-amber-500"}`} />
                      <span>Kỳ thi của tôi</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isMyContestsView ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      {contests.length}
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
                    className={`py-2 text-sm font-bold rounded-lg transition-all ${
                      selectedGrade === grade
                        ? "border-2 border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600"
                        : "border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:text-blue-600"
                    }`}
                  >
                    Lớp {grade}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="col-span-3 py-2 text-sm font-bold border-2 border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-600 hover:text-blue-600"
                >
                  Lớp 12 & Chuyên
                </Button>
              </div>
            </div>

            {/* Challenge Card */}
            <Card className="bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/30 border-0">
              <CardContent className="p-6">
                <Trophy className="w-10 h-10 opacity-50 mb-4" />
                <h4 className="text-xl font-bold mb-2">Thách thức bản thân!</h4>
                <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                  Tham gia các kỳ thi để tích lũy điểm thưởng và nâng cao thứ hạng trên bảng tổng sắp.
                </p>
                <Button className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-50">
                  Xem Bảng Xếp Hạng
                </Button>
              </CardContent>
            </Card>

            {isMyContestsView && (
              <Card className="bg-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <Trophy className="w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-2">Hành trình vinh quang</h4>
                  <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                    Tiếp tục nỗ lực để đạt được thứ hạng cao nhất trong các kỳ thi sắp tới.
                  </p>
                  <Button className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-50">
                    Xem Thành Tích
                  </Button>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Contest List */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isMyContestsView ? "Kỳ thi của tôi" : "Kỳ thi Tin học"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {isMyContestsView
                    ? "Quản lý các kỳ thi bạn đã đăng ký tham gia."
                    : "Nơi hội tụ của những tài năng lập trình trẻ. Sẵn sàng cho những thử thách đầy kịch tính!"}
                </p>
              </div>
              <div className="flex gap-2">
                {ongoingCount > 0 && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></span>
                    {ongoingCount} Đang diễn ra
                  </Badge>
                )}
                {upcomingCount > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    {upcomingCount} Sắp tới
                  </Badge>
                )}
                {isMyContestsView && endedCount > 0 && (
                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">
                    {endedCount} Đã kết thúc
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {contests.map((contest) => (
                <ContestCard key={contest.contestId} contest={contest} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-8">
              <nav className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold">1</Button>
                <Button variant="outline" className="w-10 h-10 rounded-lg font-bold">
                  2
                </Button>
                {!isMyContestsView && (
                  <>
                    <Button variant="outline" className="w-10 h-10 rounded-lg font-bold">
                      3
                    </Button>
                    <span className="px-2">...</span>
                    <Button variant="outline" className="w-10 h-10 rounded-lg font-bold">
                      12
                    </Button>
                  </>
                )}
                <Button variant="outline" size="icon" className="rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
