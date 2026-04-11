import React, { useEffect, useState } from "react";
import { Outlet, useParams, useLocation, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Timer, ListChecks, Trophy, MessageSquare, Bell, Users, Home } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/Avatar";
import { useContestDetail } from "../queries/useContest";
import { useUserProfile } from "@/feature/user/queries/useUser";
import { cn } from "@workspace/ui/lib/utils";

interface ContestLayoutProps {
  children?: React.ReactNode;
}

export const ContestLayout: React.FC<ContestLayoutProps> = ({ children }) => {
  const { id } = useParams({ strict: false });
  const location = useLocation();
  const { data: userProfile } = useUserProfile();
  const { data: contestData, isLoading: contestLoading } = useContestDetail(id || "");
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

  const contest = contestData?.data;

  useEffect(() => {
    if (!contest?.endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(contest.endTime).getTime();

      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const format = (n: number) => n.toString().padStart(2, "0");

      setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [contest?.endTime]);

  if (contestLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10px)] bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-md text-slate-800">Đang tải cuộc thi...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500">Không tìm thấy cuộc thi</div>
      </div>
    );
  }

  const myRank = contest.myRank || null;

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const getStatusText = () => {
    switch (contest.status) {
      case "RUNNING":
        return "Đang diễn ra";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "ENDED":
        return "Đã kết thúc";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <style>{`
        .bg-primary { background-color: #0d7ff2; }
        .text-primary { color: #0d7ff2; }
        .border-primary { border-color: #0d7ff2; }
        .ring-primary { --tw-ring-color: #0d7ff2; }
        .shadow-primary\\/20 { box-shadow: 0 10px 15px -3px rgba(13, 127, 242, 0.2); }
      `}</style>

      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shrink-0">
        <div className="max-w-400 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center relative z-50 mb-2">
              <img
                src="/Logo.png"
                alt="Bit Learning"
                className={cn("object-contain transition-all duration-300", "h-10 w-30")}
              />
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-3">
              <span className="text-lg uppercase font-bold tracking-wider text-primary">{contest.title}</span>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {contest.status === "RUNNING" ? (
                        <>
                          <Timer className="w-5 h-5" />
                          <span className="text-md font-mono font-bold text-slate-900 dark:text-slate-100">
                            {timeLeft}
                          </span>
                        </>
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-bold px-2 py-0.5 rounded",
                            contest.status === "UPCOMING" && "bg-green-100 text-green-600",
                            contest.status === "ENDED" && "bg-gray-200 text-gray-800",
                          )}
                        >
                          {getStatusText()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              to="/contests/$id/problems"
              params={{ id: id || "" }}
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors",
                isActive("/problems")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium",
              )}
            >
              <ListChecks className="w-5 h-5" />
              Bài tập
            </Link>
            <Link
              to="/contests/$id/leaderboard"
              params={{ id: id || "" }}
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors",
                isActive("/leaderboard")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium",
              )}
            >
              <Trophy className="w-5 h-5" />
              Bảng xếp hạng
            </Link>
            <Link
              to="/contests/$id/submissions"
              params={{ id: id || "" }}
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors",
                isActive("/submissions")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium",
              )}
            >
              <ListChecks className="w-5 h-5" />
              Bài nộp của tôi
            </Link>
            <Link
              to="/contests/$id/qa"
              params={{ id: id || "" }}
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors",
                isActive("/qa")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium",
              )}
            >
              <MessageSquare className="w-5 h-5" />
              Hỏi đáp
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/" })}
              className="relative rounded-xl p-2
               hover:bg-gray-100 dark:hover:bg-gray-800
               transition-all duration-200
               group cursor-pointer"
            >
              <Home
                className="h-7 w-7
                 text-gray-600 dark:text-gray-300
                 group-hover:text-primary
                 dark:group-hover:text-blue-400
                 transition-colors"
              />

              <span
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2
                 whitespace-nowrap
                 px-3 py-1.5
                 text-sm font-semibold
                 text-white bg-gray-900
                 rounded-lg shadow-lg
                 opacity-0 group-hover:opacity-100
                 transition-all duration-200"
              >
                Trang chủ
              </span>
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">
                  {userProfile?.firstName && userProfile?.lastName
                    ? `${userProfile.firstName} ${userProfile.lastName}`
                    : "User"}
                </p>
                <p className="text-xs text-slate-500">{myRank ? `Rank: ${myRank}` : "Chưa xếp hạng"}</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={userProfile?.avatar} alt={`${userProfile?.firstName} ${userProfile?.lastName}`} />
                <AvatarFallback>{userProfile?.firstName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-gray-50">{children || <Outlet />}</main>

      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 shrink-0">
        <div className="max-w-400 mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-300 text-sm">
          <div className="flex items-center gap-6 text-base">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold">Cuộc thi đang diễn ra</span>
            </span>
            <span className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span className="font-mono font-bold text-slate-100 text-lg">{timeLeft || "00:00:00"}</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-base">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{contest.participantCount} thí sinh</span>
            </span>
            <span className="flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              <span>{contest.problemCount} bài tập</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-semibold text-base">Nền tảng thi lập trình Bitlearning</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
