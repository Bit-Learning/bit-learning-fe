import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useKidsBlocklyLeaderboard } from "../queries/useKidsBlockly";
import type { KidsBlocklyLeaderboardEntry } from "../types/kid-blockly.types";

interface Props {
	pageSize?: number;
}

const AVATAR_COLORS = [
	"#7F77DD",
	"#1D9E75",
	"#D85A30",
	"#378ADD",
	"#D4537E",
	"#BA7517",
	"#639922",
	"#E24B4A",
];

const PODIUM: Record<
	1 | 2 | 3,
	{
		ring: string;
		block: string;
		blockH: string;
		avatarSize: string;
		medal: string;
	}
> = {
	1: {
		ring: "#FFD700",
		block: "bg-gradient-to-b from-yellow-400 to-amber-500",
		blockH: "h-[88px]",
		avatarSize: "72px",
		medal: "🥇",
	},
	2: {
		ring: "#CBD5E1",
		block: "bg-gradient-to-b from-slate-300 to-slate-400",
		blockH: "h-16",
		avatarSize: "58px",
		medal: "🥈",
	},
	3: {
		ring: "#D97706",
		block: "bg-gradient-to-b from-amber-500 to-amber-700",
		blockH: "h-12",
		avatarSize: "52px",
		medal: "🥉",
	},
};

const RANK_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((w) => w[0])
		.slice(-2)
		.join("")
		.toUpperCase();
}

function getAvatarFallbackColor(userId: number): string {
	return AVATAR_COLORS[(userId - 1) % AVATAR_COLORS.length]!;
}

function Avatar({
	user,
	size,
	textSize,
}: {
	user: KidsBlocklyLeaderboardEntry;
	size: string;
	textSize: string;
}) {
	const [imgError, setImgError] = useState(false);

	if (user.avatar && !imgError) {
		return (
			<img
				src={user.avatar}
				alt={user.displayName}
				onError={() => setImgError(true)}
				className="rounded-full object-cover shrink-0"
				style={{ width: size, height: size }}
			/>
		);
	}

	return (
		<div
			className={`rounded-full flex items-center justify-center font-extrabold text-white shrink-0 ${textSize}`}
			style={{
				width: size,
				height: size,
				background: getAvatarFallbackColor(user.userId),
			}}
		>
			{getInitials(user.displayName)}
		</div>
	);
}

function PodiumCard({
	user,
	rank,
}: {
	user: KidsBlocklyLeaderboardEntry;
	rank: 1 | 2 | 3;
}) {
	const p = PODIUM[rank];
	return (
		<div className="flex flex-col items-center">
			<span className={rank === 1 ? "text-3xl mb-1.5" : "text-2xl mb-1.5"}>
				{p.medal}
			</span>
			<div
				className="rounded-full p-0.75"
				style={{
					background: p.ring,
					boxShadow: rank === 1 ? `0 0 0 3px ${p.ring}40` : undefined,
				}}
			>
				<Avatar
					user={user}
					size={p.avatarSize}
					textSize={rank === 1 ? "text-xl" : "text-sm"}
				/>
			</div>
			<p className="mt-2 text-sm font-extrabold max-w-22.5 text-center truncate text-blue-600">
				{user.displayName.split(" ").slice(-1)[0]}
			</p>
			<p className="text-xs font-bold text-slate-500 mt-0.5">
				⭐ {user.totalStars}
			</p>
			<div
				className={`w-25 mt-2 ${p.blockH} ${p.block} rounded-t-xl flex items-center justify-center text-2xl font-black text-white`}
			>
				{rank}
			</div>
		</div>
	);
}

function LeaderboardRow({ entry }: { entry: KidsBlocklyLeaderboardEntry }) {
	const isTop3 = entry.rank <= 3;
	return (
		<div
			className={`grid items-center gap-2 px-3.5 py-3 rounded-2xl cursor-default ${isTop3 ? "bg-blue-100" : "bg-slate-50"}`}
			style={{ gridTemplateColumns: "44px 1fr 80px 52px" }}
		>
			<div
				className={`text-center font-black ${isTop3 ? "text-xl" : "text-base"} text-slate-800`}
			>
				{RANK_EMOJI[entry.rank] ?? entry.rank}
			</div>

			<div className="flex items-center gap-2.5 overflow-hidden">
				<Avatar user={entry} size="42px" textSize="text-sm" />
				<div className="overflow-hidden">
					<p className="text-md font-extrabold truncate text-blue-600 m-0">
						{entry.displayName}
					</p>
					<p className="text-xs font-semibold text-slate-400 m-0">
						@{entry.username}
					</p>
				</div>
			</div>

			<div className="flex justify-end">
				<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-extrabold bg-yellow-100 text-amber-700">
					⭐ {entry.totalStars}
				</span>
			</div>

			<div className="text-right text-md font-extrabold text-slate-500">
				{entry.completedLevels}
			</div>
		</div>
	);
}

function SkeletonRow() {
	return (
		<div
			className="grid items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-100 animate-pulse"
			style={{ gridTemplateColumns: "44px 1fr 80px 52px" }}
		>
			<div className="w-6 h-4 rounded mx-auto bg-slate-200" />
			<div className="flex items-center gap-2.5">
				<div className="w-10 h-10 rounded-full shrink-0 bg-slate-200" />
				<div className="flex-1 flex flex-col gap-1.5">
					<div className="h-3.5 rounded w-3/4 bg-slate-200" />
					<div className="h-2.5 rounded w-2/5 bg-slate-300" />
				</div>
			</div>
			<div className="h-5 rounded-full w-14 ml-auto bg-slate-200" />
			<div className="h-4 rounded w-6 ml-auto bg-slate-200" />
		</div>
	);
}

export default function KidsBlocklyLeaderboard({ pageSize = 10 }: Props) {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const { data, isLoading, isError } = useKidsBlocklyLeaderboard(
		page,
		pageSize,
	);

	const items = data?.items ?? [];
	const pagination = data?.pagination;
	const totalPages = pagination?.totalPages ?? 0;

	const top3 = items.slice(0, 3);
	const podiumOrder = [top3[1], top3[0], top3[2]];
	const podiumRanks = [2, 1, 3] as const;

	return (
		<div className="bg-[linear-gradient(180deg,#f7fffb_0%,#eef8ff_48%,#f8fafc_100%)]">
			<div className="flex flex-col gap-4 w-full max-w-xl mx-auto py-6 px-4 min-h-screen">
				<div className="relative flex items-center justify-center pb-1">
					<button
						type="button"
						onClick={() => void navigate({ to: "/kids-blockly" })}
						className="absolute left-0 flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
					>
						← Quay lại
					</button>
					<h1 className="text-2xl font-black tracking-tight text-blue-600 m-0">
						🏆 Bảng Xếp Hạng
					</h1>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-end gap-4 py-6">
						{([72, 88, 60] as const).map((h, i) => (
							<div
								key={i}
								className="flex flex-col items-center gap-2 animate-pulse"
							>
								<div className="w-14 h-4 rounded bg-slate-200" />
								<div
									className="rounded-full bg-slate-200"
									style={{ width: h - 16, height: h - 16 }}
								/>
								<div
									className="w-25 rounded-t-xl bg-slate-200"
									style={{ height: h }}
								/>
							</div>
						))}
					</div>
				) : top3.length > 0 ? (
					<div className="flex justify-center items-end gap-4 py-4">
						{podiumOrder.map((u, i) =>
							u ? (
								<PodiumCard key={u.userId} user={u} rank={podiumRanks[i]!} />
							) : null,
						)}
					</div>
				) : null}

				<div
					className="grid text-md not-last:font-extrabold uppercase tracking-widest text-slate-800 px-3.5 pb-1"
					style={{ gridTemplateColumns: "55px 1fr 70px 60px" }}
				>
					<span className="text-center">#</span>
					<span>Người chơi</span>
					<span className="text-right">Sao</span>
					<span className="text-right">Màn</span>
				</div>

				<div className="flex flex-col gap-1.5">
					{isLoading ? (
						Array.from({ length: pageSize }).map((_, i) => (
							<SkeletonRow key={i} />
						))
					) : isError ? (
						<p className="text-center py-8 text-sm text-slate-400">
							Không tải được bảng xếp hạng.
						</p>
					) : (
						items.map((e) => <LeaderboardRow key={e.userId} entry={e} />)
					)}
				</div>

				{totalPages > 1 && (
					<div className="flex justify-center items-center gap-3 pt-2">
						<button
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={page === 0 || pagination?.first}
							className="px-4 py-2 rounded-xl text-sm font-extrabold border border-slate-200 bg-slate-50 text-blue-600 disabled:opacity-40 cursor-pointer"
						>
							← Trước
						</button>
						<span className="text-sm font-bold text-slate-400">
							{page + 1} / {totalPages}
						</span>
						<button
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							disabled={pagination?.last}
							className="px-4 py-2 rounded-xl text-sm font-extrabold border border-slate-200 bg-slate-50 text-blue-600 disabled:opacity-40 cursor-pointer"
						>
							Sau →
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
