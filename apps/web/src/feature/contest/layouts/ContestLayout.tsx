import React, { useEffect, useState } from "react";
import { Outlet, useParams, useLocation } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
	Timer,
	ListChecks,
	Trophy,
	MessageSquare,
	Bell,
	Users,
} from "lucide-react";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@workspace/ui/components/Avatar";
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
	const { data: contestData, isLoading: contestLoading } = useContestDetail(
		id || "",
	);

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
						<Link to="/" className="flex items-center relative z-50">
							<img
								src="/Logo.png"
								alt="Bit Learning"
								className={cn(
									"object-contain transition-all duration-300",
									"h-10 w-36",
								)}
							/>
						</Link>

						<div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

						<div className="flex items-center gap-3">
							<span className="text-xl uppercase font-bold tracking-wider text-primary">
								{contest.title}
							</span>
							<div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
								<div className="flex items-center gap-2">
									<Timer className="w-6 h-6" />
									<div className="flex items-center gap-2">
										<span
											className={cn(
												"text-md font-bold px-2 py-0.5 rounded",
												contest.status === "RUNNING" &&
													"bg-blue-100 text-blue-600",
												contest.status === "UPCOMING" &&
													"bg-green-100 text-green-600",
												contest.status === "ENDED" &&
													"bg-gray-200 text-gray-800",
											)}
										>
											{getStatusText()}
										</span>

										{contest.status === "RUNNING" && (
											<span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
												{timeLeft}
											</span>
										)}
									</div>{" "}
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
								<p className="text-xs text-slate-500">
									{myRank ? `Rank: ${myRank}` : "Chưa xếp hạng"}
								</p>
							</div>
							<Avatar className="h-10 w-10 border-2 border-primary">
								<AvatarImage
									src={userProfile?.avatar}
									alt={`${userProfile?.firstName} ${userProfile?.lastName}`}
								/>
								<AvatarFallback>
									{userProfile?.firstName?.charAt(0).toUpperCase() || "U"}
								</AvatarFallback>
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
							<span className="font-mono font-bold text-slate-300">
								{timeLeft || "00:00:00"}
							</span>
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
						<span className="font-bold text-slate-400">
							Bitlearning Contest Platform
						</span>
						<span className="hidden md:flex items-center gap-1.5">
							<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
								Ctrl
							</kbd>
							<span>+</span>
							<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
								Enter
							</kbd>
							<span className="ml-1">to submit</span>
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
};
