import { Post, ReactionSummary, ReactionType } from "../types/forum.type";

const REACTIONS: { type: ReactionType; label: string; icon: string }[] = [
	{ type: "LIKE", label: "Like", icon: "👍" },
	{ type: "LOVE", label: "Love", icon: "❤️" },
	{ type: "HAHA", label: "Haha", icon: "😂" },
	{ type: "WOW", label: "Wow", icon: "😮" },
	{ type: "SAD", label: "Sad", icon: "😢" },
	{ type: "ANGRY", label: "Angry", icon: "😡" },
];

function formatCompactNumber(value: number) {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
	}
	return String(value);
}

function getTopReactionIcons(reactionSummary: ReactionSummary) {
	return Object.entries(reactionSummary)
		.filter(([, count]) => count > 0)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(
			([type]) =>
				REACTIONS.find((reaction) => reaction.type === type)?.icon ?? "👍",
		);
}

function getReactionIcon(type?: ReactionType | null) {
	return REACTIONS.find((reaction) => reaction.type === type)?.icon ?? "👍";
}

export default function ReactionButton({
	post,
	onReact,
	disabled,
}: {
	post: Post;
	onReact: (reactionType: ReactionType) => void;
	disabled?: boolean;
}) {
	const topReactionIcons = getTopReactionIcons(post.reactionSummary);
	const activeReaction = post.currentUserReaction;

	return (
		<div className="group relative">
			<button
				type="button"
				disabled={disabled}
				onClick={() => onReact("LIKE")}
				className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
					activeReaction
						? "border-blue-200 bg-blue-50 text-blue-700"
						: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
				}`}
			>
				<span className="text-base">{getReactionIcon(activeReaction)}</span>
				{/* <span>{activeReaction ? activeReaction.toLowerCase() : "Like"}</span> */}
				{post.totalReactions > 0 && (
					<span className="flex items-center gap-1 text-slate-500">
						{topReactionIcons.length > 0 && (
							<span className="flex -space-x-1">
								{topReactionIcons.map((icon) => (
									<span key={icon} className="rounded-full text-2xl">
										{icon}
									</span>
								))}
							</span>
						)}
						{formatCompactNumber(post.totalReactions)}
					</span>
				)}
			</button>

			<div className="pointer-events-none absolute bottom-full left-0 z-20 flex translate-y-2 gap-1 rounded-full border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
				{REACTIONS.map((reaction) => (
					<button
						key={reaction.type}
						type="button"
						title={reaction.label}
						className="flex h-12 w-12 items-center justify-center rounded-full text-3xl transition hover:-translate-y-1 hover:bg-slate-100"
						onClick={() => onReact(reaction.type)}
					>
						<span className="leading-none">{reaction.icon}</span>
					</button>
				))}
			</div>
		</div>
	);
}
