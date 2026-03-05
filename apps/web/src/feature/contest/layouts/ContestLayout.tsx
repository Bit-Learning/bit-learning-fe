import React from "react";
import { Outlet, useParams, useLocation } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Timer, ListChecks, Trophy, MessageSquare, Bell, Terminal, Users } from "lucide-react";
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
  // const { data: contest, isLoading: contestLoading } = useContestDetail(id || "");

  const mockContest = {
    id: id || "",
    title: "Olympic Tin học Trẻ 2025",
    slug: "olympic-tin-hoc-tre-2025",
    description: "Cuộc thi lập trình cho học sinh THCS và THPT",
    status: "RUNNING",
    startTime: "2025-03-05T08:00:00",
    endTime: "2025-03-05T12:00:00",
    durationMinutes: 240,
    problemCount: 5,
    participantCount: 250,
    isRegistered: true,
    myRank: 42,
    createdAt: "2025-03-01T00:00:00",
  };

  const contest = mockContest;
  const contestLoading = false;

  if (contestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500">Đang tải cuộc thi...</div>
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

  const timeLeft = "02:45:12";
  const myRank = contest.myRank || null;

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
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
            <Link to="/" className="flex items-center relative z-50">
              <img
                src="/Logo.png"
                alt="Bithub Learning"
                className={cn("object-contain transition-all duration-300", "h-10 w-36")}
              />
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex flex-col">
              <span className="text-xs uppercase font-bold tracking-wider text-primary">{contest.title}</span>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{timeLeft}</span>
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
            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary">
              <Bell className="w-5 h-5" />
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

      <main className="flex-1 overflow-hidden">{children || <Outlet />}</main>

      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 shrink-0">
        <div className="max-w-400 mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">Contest Running</span>
            </span>
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold text-slate-300">02:45:12 remaining</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{contest.participantCount} participants</span>
            </span>
            <span className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              <span>{contest.problemCount} problems</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="font-bold text-slate-400">Bitlearning Contest Platform</span>
            <span className="hidden md:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">Enter</kbd>
              <span className="ml-1">to submit</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
