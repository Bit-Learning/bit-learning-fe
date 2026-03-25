import { useEffect, useState } from "react";
import gameService, {
	type LeaderboardEntry,
	type Page,
} from "../services/gameService";
import {
	ChevronLeft,
	ChevronRight,
	UserPlus,
	UserMinus,
	Eye,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
	useFollowUser,
	useUnfollowUser,
	useFollowStats,
} from "@/feature/user/queries/useUser";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

// ─── Avatar ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
	"#6366F1",
	"#EC4899",
	"#10B981",
	"#F59E0B",
	"#3B82F6",
	"#EF4444",
	"#8B5CF6",
	"#06B6D4",
	"#F97316",
	"#14B8A6",
];

function Avatar({ userId, username }: { userId: number; username: string }) {
	const bg = AVATAR_COLORS[userId % AVATAR_COLORS.length];
	const initials = username.slice(0, 2).toUpperCase();
	return (
		<div
			className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
			style={{ background: bg }}
		>
			{initials}
		</div>
	);
}

// ─── Score Bar ──────────────────────────────────────────────────────────────
function ScoreBar({
	score,
	maxScore,
	userId,
}: {
	score: number;
	maxScore: number;
	userId: number;
}) {
	const pct = Math.round((score / maxScore) * 100);
	const color = AVATAR_COLORS[userId % AVATAR_COLORS.length];
	return (
		<div className="flex flex-col items-end gap-1 min-w-[64px]">
			<span className="text-base font-black text-gray-800">
				{score.toLocaleString("vi-VN")}
			</span>
			<div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-500"
					style={{ width: `${pct}%`, background: color }}
				/>
			</div>
		</div>
	);
}

// ─── Follow Button ──────────────────────────────────────────────────────────
function FollowButton({ userId }: { userId: number }) {
	const { data: stats, isLoading } = useFollowStats(userId);
	const followMutation = useFollowUser();
	const unfollowMutation = useUnfollowUser();
	const auth = useSelector((state: RootState) => state.auth);
	const currentUserId = auth.userInfo?.id;

	if (isLoading || currentUserId === userId) return null;

	const isFollowing = stats?.isFollowing ?? false;

	return (
		<button
			onClick={(e) => {
				e.stopPropagation();
				isFollowing
					? unfollowMutation.mutate(userId)
					: followMutation.mutate(userId);
			}}
			disabled={followMutation.isPending || unfollowMutation.isPending}
			className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
				isFollowing
					? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200"
					: "text-white hover:opacity-90 hover:scale-95"
			}`}
			style={
				!isFollowing
					? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }
					: undefined
			}
		>
			{isFollowing ? (
				<UserMinus className="w-3.5 h-3.5" />
			) : (
				<UserPlus className="w-3.5 h-3.5" />
			)}
			{isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
		</button>
	);
}

// ─── Podium Card ────────────────────────────────────────────────────────────
const PODIUM_STYLES = {
	1: {
		wrapper: "order-2 pb-6",
		card: "bg-gradient-to-br from-amber-50 to-yellow-200 border-2 border-amber-400 shadow-[0_8px_24px_rgba(245,158,11,0.25)]",
		scoreColor: "text-amber-700",
		medal: "🥇",
	},
	2: {
		wrapper: "order-1 pb-2",
		card: "bg-gradient-to-br from-slate-50 to-slate-200 border-2 border-slate-400 shadow-[0_6px_16px_rgba(148,163,184,0.25)]",
		scoreColor: "text-slate-600",
		medal: "🥈",
	},
	3: {
		wrapper: "order-3 pb-2",
		card: "bg-gradient-to-br from-orange-50 to-orange-200 border-2 border-orange-400 shadow-[0_6px_16px_rgba(205,127,50,0.25)]",
		scoreColor: "text-orange-700",
		medal: "🥉",
	},
} as const;

const PODIUM_BADGE_STYLES = {
	1: "bg-amber-400 text-white",
	2: "bg-slate-400 text-white",
	3: "bg-orange-400 text-white",
} as const;

function PodiumCard({
	entry,
	rank,
	onClick,
}: {
	entry: LeaderboardEntry;
	rank: 1 | 2 | 3;
	onClick: () => void;
}) {
	const s = PODIUM_STYLES[rank];
	const badge = PODIUM_BADGE_STYLES[rank];
	return (
		<div className={`flex-1 max-w-[200px] ${s.wrapper}`}>
			<div
				className={`relative rounded-2xl p-4 text-center cursor-pointer transition-transform hover:-translate-y-1 ${s.card}`}
				onClick={onClick}
			>
				<span
					className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black px-3 py-0.5 rounded-full ${badge}`}
				>
					#{rank}
				</span>
				<span className="text-4xl block mb-1">{s.medal}</span>
				<div className="text-sm font-black text-gray-800 mb-0.5 truncate">
					{entry.username}
				</div>
				<div className={`text-xl font-black mb-1 ${s.scoreColor}`}>
					{entry.totalScore.toLocaleString("vi-VN")}
				</div>
				<div className="text-[11px] text-gray-500">
					{entry.gamesPlayed} trận
				</div>
			</div>
		</div>
	);
}

// ─── Main Leaderboard ───────────────────────────────────────────────────────
export default function Leaderboard() {
	const navigate = useNavigate();
	const [leaderboard, setLeaderboard] = useState<Page<LeaderboardEntry> | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchLeaderboard(currentPage, pageSize);
	}, [currentPage, pageSize]);

	const fetchLeaderboard = async (page: number, size: number) => {
		try {
			setLoading(true);
			const data = await gameService.getLeaderboard(page, size);
			setLeaderboard(data);
		} catch (error) {
			console.error("Failed to load leaderboard", error);
		} finally {
			setLoading(false);
		}
	};

	const handleViewProfile = (userId: number) => {
		navigate({ to: "/profile/$userId", params: { userId: String(userId) } });
	};

	if (loading) return <Loader />;

	const maxScore = leaderboard?.content[0]?.totalScore ?? 1;

	// On page 0: podium = top 3, table = rest (index 3+)
	// On other pages: no podium, table = all entries
	const podiumEntries =
		currentPage === 0 ? (leaderboard?.content.slice(0, 3) ?? []) : [];
	const tableEntries =
		currentPage === 0
			? (leaderboard?.content.slice(3) ?? [])
			: (leaderboard?.content ?? []);

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="text-center mb-8">
				<h2 className="text-3xl font-black tracking-tight text-gray-900">
					🏆{" "}
					<span
						className="bg-clip-text text-transparent"
						style={{
							backgroundImage:
								"linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)",
						}}
					>
						Bảng xếp hạng
					</span>
				</h2>
				<p className="text-sm text-gray-500 mt-1">
					Top người chơi xuất sắc nhất
				</p>
			</div>

			{/* Podium — only on page 0 */}
			{podiumEntries.length === 3 && (
				<div className="flex items-end justify-center gap-3 mb-10">
					{[
						{ entry: podiumEntries[1]!, rank: 2 as const },
						{ entry: podiumEntries[0]!, rank: 1 as const },
						{ entry: podiumEntries[2]!, rank: 3 as const },
					].map(({ entry, rank }) => (
						<PodiumCard
							key={entry.userId}
							entry={entry}
							rank={rank}
							onClick={() => handleViewProfile(entry.userId)}
						/>
					))}
				</div>
			)}

			{/* Table rows */}
			<div className="flex flex-col gap-2">
				{tableEntries.map((entry, index) => {
					const globalRank =
						currentPage * pageSize + (currentPage === 0 ? 3 : 0) + index;
					return (
						<div
							key={entry.userId}
							className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer transition-all hover:translate-x-1 hover:bg-white hover:shadow-md"
							style={{ animationDelay: `${index * 0.04}s` }}
							onClick={() => handleViewProfile(entry.userId)}
						>
							{/* Rank */}
							<span className="text-base font-black text-gray-400 min-w-[36px] text-center">
								#{globalRank + 1}
							</span>

							{/* Avatar */}
							<Avatar userId={entry.userId} username={entry.username} />

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="text-sm font-bold text-gray-900 truncate">
									{entry.username}
								</div>
								<div className="text-xs text-gray-500">
									{entry.gamesPlayed} trận đã chơi
								</div>
							</div>

							{/* Score + bar */}
							<ScoreBar
								score={entry.totalScore}
								maxScore={maxScore}
								userId={entry.userId}
							/>

							{/* Actions */}
							<div
								className="flex items-center gap-2 flex-shrink-0"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									onClick={() => handleViewProfile(entry.userId)}
									className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
								>
									<Eye className="w-3.5 h-3.5" />
									Xem
								</button>
								<FollowButton userId={entry.userId} />
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty state */}
			{(!leaderboard || leaderboard.content.length === 0) && (
				<div className="text-center py-16 text-gray-400">
					<div className="text-5xl mb-3">🎮</div>
					<p className="font-semibold">Chưa có người chơi nào.</p>
					<p className="text-sm mt-1">Hãy là người đầu tiên!</p>
				</div>
			)}

			{/* Pagination */}
			{leaderboard && leaderboard.totalElements > 0 && (
				<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
					<p className="text-xs text-gray-500">
						Hiển thị{" "}
						<span className="font-bold text-gray-800">
							{currentPage * pageSize + 1}–
							{Math.min(
								(currentPage + 1) * pageSize,
								leaderboard.totalElements,
							)}
						</span>{" "}
						/{" "}
						<span className="font-bold text-gray-800">
							{leaderboard.totalElements}
						</span>{" "}
						người chơi
					</p>

					<div className="flex items-center gap-2">
						<button
							onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
							disabled={leaderboard.first}
							className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
								leaderboard.first
									? "bg-gray-100 text-gray-300 cursor-not-allowed"
									: "text-white hover:opacity-90"
							}`}
							style={
								!leaderboard.first
									? { background: "linear-gradient(135deg, #F59E0B, #EF4444)" }
									: undefined
							}
						>
							<ChevronLeft className="w-4 h-4" />
							Trước
						</button>

						<span className="text-xs text-gray-500 px-2">
							<span className="font-bold text-gray-800">{currentPage + 1}</span>{" "}
							/ {leaderboard.totalPages}
						</span>

						<button
							onClick={() =>
								setCurrentPage((p) =>
									Math.min(leaderboard.totalPages - 1, p + 1),
								)
							}
							disabled={leaderboard.last}
							className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
								leaderboard.last
									? "bg-gray-100 text-gray-300 cursor-not-allowed"
									: "text-white hover:opacity-90"
							}`}
							style={
								!leaderboard.last
									? { background: "linear-gradient(135deg, #F59E0B, #EF4444)" }
									: undefined
							}
						>
							Tiếp
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
