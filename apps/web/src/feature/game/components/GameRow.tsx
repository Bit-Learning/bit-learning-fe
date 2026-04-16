import type { GamePreview } from "../services/gameService";
import { useNavigate } from "@tanstack/react-router";
import { parseMatchingMetaFromTitle } from "../utils";
import type { TopicCode } from "../data";

interface Props {
	game: GamePreview;
	categoryName: string;
}

const GameCard = ({ game, categoryName }: Props) => {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={() => {
				if (categoryName === "MATCHING") {
					// Parse grade & topic from title like: "Lớp 3 - B: ..."
					const parsed = parseMatchingMetaFromTitle(game.title);
					const grade = parsed?.grade ?? 3;
					const topic = parsed?.topic ?? ("A" as TopicCode);
					navigate({
						to: "/matching/game",
						search: { grade, topic },
					});
				} else {
					navigate({
						to: "/games/$id",
						params: { id: String(game.id) },
					});
				}
			}}
			className="flex-none w-64 cursor-pointer transform transition-transform duration-300 hover:scale-105 text-left"
		>
			<div className="relative aspect-video rounded-md overflow-hidden bg-linear-to-br from-purple-600 to-blue-500 shadow-lg">
				{game.thumbnailUrl ? (
					<img
						src={game.thumbnailUrl}
						alt={game.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-5xl">
						🎮
					</div>
				)}
				<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
					<h3 className="text-white font-bold text-sm truncate">
						{game.title}
					</h3>
					<p className="text-white/80 text-xs truncate">{game.description}</p>
				</div>
			</div>
		</button>
	);
};

export default GameCard;
