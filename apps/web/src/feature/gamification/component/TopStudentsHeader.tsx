import { useGlobalLeaderboard } from "../hooks/useGamification";

export function TopStudentsHeader() {
	const { data: leaderboard } = useGlobalLeaderboard(5);

	if (!leaderboard || leaderboard.length === 0) return null;

	return (
		<div className="flex items-center gap-3 rounded-full bg-slate-900/60 px-4 py-1 text-xs text-slate-100 shadow-sm">
			<span className="font-semibold uppercase tracking-wide text-amber-300">
				Top students
			</span>
			<div className="flex flex-wrap gap-3">
				{leaderboard.map((entry, index) => {
					const name =
						entry.firstName || entry.lastName
							? `${entry.firstName ?? ""} ${entry.lastName ?? ""}`.trim() ||
								entry.username
							: entry.username;

					return (
						<div
							key={entry.userId}
							className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5"
						>
							<span className="text-[10px] font-semibold text-amber-400">
								#{index + 1}
							</span>
							<span className="max-w-[120px] truncate text-[11px] font-medium">
								{name}
							</span>
							<span className="text-[10px] text-slate-300">
								Lv. {entry.level}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
