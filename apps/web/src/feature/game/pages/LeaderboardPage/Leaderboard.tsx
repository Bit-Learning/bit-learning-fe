import { useEffect, useState } from "react";
import gameService, {
	type LeaderboardEntry,
	type LeaderboardGameType,
	type Page,
} from "../../services/gameService";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const DEFAULT_LEADERBOARD_TAB = {
	value: "QUIZ" as const,
	label: "Quiz",
	description: "Xếp hạng theo tổng điểm quiz cao nhất của từng người chơi.",
};

const LEADERBOARD_TABS: Array<{
	value: LeaderboardGameType;
	label: string;
	description: string;
}> = [
	DEFAULT_LEADERBOARD_TAB,
	{
		value: "MATCHING",
		label: "Matching",
		description: "Xếp hạng riêng cho game ghép cặp, không gộp với quiz.",
	},
];

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

function Avatar({
	userId,
	username,
	avatar,
}: {
	userId: number;
	username: string;
	avatar?: string | null;
}) {
	if (avatar) {
		return (
			<img
				src={avatar}
				alt={username}
				className="w-10 h-10 rounded-full object-cover flex-shrink-0"
			/>
		);
	}
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
			<button
				type="button"
				className={`relative rounded-2xl p-4 text-center cursor-pointer transition-transform hover:-translate-y-1 ${s.card}`}
				onClick={onClick}
			>
				<span
					className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black px-3 py-0.5 rounded-full ${badge}`}
				>
					#{rank}
				</span>
				<span className="text-4xl block mb-1">{s.medal}</span>
				{entry.avatar ? (
					<div className="w-30 h-30 mx-auto mb-1 overflow-hidden rounded-full">
						<img
							src={entry.avatar}
							alt={entry.username}
							className="w-full h-full object-cover"
						/>
					</div>
				) : (
					<div
						className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white mx-auto mb-1"
						style={{
							background: AVATAR_COLORS[entry.userId % AVATAR_COLORS.length],
						}}
					>
						{entry.username.slice(0, 2).toUpperCase()}
					</div>
				)}
				<div className="text-sm font-black text-gray-800 mb-0.5 truncate">
					{entry.username}
				</div>
				<div className={`text-xl font-black mb-1 ${s.scoreColor}`}>
					{entry.totalScore.toLocaleString("vi-VN")}
				</div>
				<div className="text-[11px] text-gray-500">
					{entry.totalAttempts} lượt chơi
				</div>
			</button>
		</div>
	);
}

// ─── Main Leaderboard ───────────────────────────────────────────────────────
export default function LeaderboardPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_layout/leaderboard" });
	const activeGameType = search.gameType ?? "QUIZ";
	const [leaderboard, setLeaderboard] = useState<Page<LeaderboardEntry> | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadLeaderboard = async () => {
			try {
				setLoading(true);
				const data = await gameService.getLeaderboard(
					currentPage,
					pageSize,
					activeGameType,
				);
				setLeaderboard(data);
			} catch (error) {
				console.error("Không thể tải bảng xếp hạng", error);
			} finally {
				setLoading(false);
			}
		};

		void loadLeaderboard();
	}, [activeGameType, currentPage, pageSize]);

	const handleViewProfile = (username: string) => {
		navigate({
			to: "/profile/$username",
			params: { username },
		});
	};

	const handleChangeGameType = (gameType: LeaderboardGameType) => {
		setCurrentPage(0);
		navigate({
			to: "/leaderboard",
			search: { gameType },
		});
	};

	if (loading) return <Loader />;

	const maxScore = leaderboard?.content[0]?.totalScore ?? 1;

	// On page 0: podium = top 3 (if 3+), table = rest
	// If fewer than 3 on page 0: no podium, show all in table
	// On other pages: no podium, table = all entries
	const hasPodium =
		currentPage === 0 && (leaderboard?.content.length ?? 0) >= 3;
	const podiumEntries = hasPodium
		? (leaderboard?.content.slice(0, 3) ?? [])
		: [];
	const tableEntries = hasPodium
		? (leaderboard?.content.slice(3) ?? [])
		: (leaderboard?.content ?? []);
	const activeTab =
		LEADERBOARD_TABS.find((tab) => tab.value === activeGameType) ??
		DEFAULT_LEADERBOARD_TAB;
	const orderedPodiumEntries = hasPodium
		? [
				{ entry: podiumEntries[1], rank: 2 as const },
				{ entry: podiumEntries[0], rank: 1 as const },
				{ entry: podiumEntries[2], rank: 3 as const },
			].filter(
				(
					item,
				): item is {
					entry: LeaderboardEntry;
					rank: 1 | 2 | 3;
				} => Boolean(item.entry),
			)
		: [];

	return (
		<div className="min-h-screen max-w-3xl mx-auto px-4 py-8">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-black tracking-tight text-gray-900">
					<span
						className="bg-clip-text text-transparent"
						style={{
							backgroundImage:
								"linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)",
						}}
					>
						Bảng xếp hạng
					</span>
				</h1>
			</div>

			<div className="mb-8 rounded-3xl border border-gray-200 bg-white/90 p-2 shadow-sm">
				<div className="grid grid-cols-2 gap-2">
					{LEADERBOARD_TABS.map((tab) => {
						const isActive = tab.value === activeGameType;
						return (
							<button
								key={tab.value}
								type="button"
								onClick={() => handleChangeGameType(tab.value)}
								className={`rounded-2xl px-4 py-3 text-left transition-all ${
									isActive
										? "text-white shadow-[0_12px_30px_rgba(239,68,68,0.18)]"
										: "bg-gray-50 text-gray-600 hover:bg-gray-100"
								}`}
								style={
									isActive
										? {
												background:
													"linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)",
											}
										: undefined
								}
							>
								<div className="text-sm font-black">{tab.label}</div>
								<div
									className={`mt-1 text-xs leading-5 ${
										isActive ? "text-white/80" : "text-gray-500"
									}`}
								>
									{tab.description}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* <div className="mb-8 rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4 text-left">
				<div className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
					Đang xem
				</div>
				<h2 className="mt-2 text-2xl font-black text-gray-900">
					Bảng xếp hạng {activeTab.label}
				</h2>
				<p className="mt-2 text-sm leading-6 text-gray-600">
					{activeTab.description} Hệ thống không xếp hạng `TYPING` và `OTHER` vì
					hai loại này đang được cấu hình không tính điểm.
				</p>
			</div> */}

			{hasPodium && (
				<div className="flex items-end justify-center gap-3 mb-10">
					{orderedPodiumEntries.map(({ entry, rank }) => (
						<PodiumCard
							key={entry.userId}
							entry={entry}
							rank={rank}
							onClick={() => handleViewProfile(entry.username)}
						/>
					))}
				</div>
			)}

			<div className="flex flex-col gap-2">
				{tableEntries.map((entry, index) => {
					const globalRank =
						currentPage * pageSize + (hasPodium ? 3 : 0) + index;
					return (
						<button
							key={entry.userId}
							type="button"
							className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer transition-all hover:translate-x-1 hover:bg-white hover:shadow-md"
							style={{ animationDelay: `${index * 0.04}s` }}
							onClick={() => handleViewProfile(entry.username)}
						>
							{/* Rank */}
							<span className="text-base font-black text-gray-400 min-w-[36px] text-center">
								#{globalRank + 1}
							</span>

							{/* Avatar */}
							<Avatar
								userId={entry.userId}
								username={entry.username}
								avatar={entry.avatar}
							/>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="text-sm font-bold text-gray-900 truncate">
									{entry.username}
								</div>
								<div className="text-xs text-gray-500">
									{entry.totalAttempts} lượt chơi
								</div>
							</div>

							{/* Score + bar */}
							<ScoreBar
								score={entry.totalScore}
								maxScore={maxScore}
								userId={entry.userId}
							/>

							<div className="flex items-center gap-2 flex-shrink-0">
								<span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600">
									<Eye className="w-3.5 h-3.5" />
									Xem
								</span>
							</div>
						</button>
					);
				})}
			</div>

			{(!leaderboard || leaderboard.content.length === 0) && (
				<div className="text-center py-16 text-gray-400">
					<div className="text-5xl mb-3">🎮</div>
					<p className="font-semibold">
						Chưa có dữ liệu xếp hạng cho {activeTab.label}.
					</p>
					<p className="text-sm mt-1">
						Khi có lượt chơi đủ điều kiện tính điểm, bảng xếp hạng sẽ xuất hiện
						ở đây.
					</p>
				</div>
			)}

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
							type="button"
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
							type="button"
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
