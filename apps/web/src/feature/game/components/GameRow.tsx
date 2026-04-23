import type { GamePreview } from "../services/gameService";
import { useNavigate } from "@tanstack/react-router";
import type { MatchingGameLinkTarget } from "../services/matchingGameService";
import styles from "./GameRow.module.css";

interface Props {
	game: GamePreview;
	categoryKey: string;
	matchingTarget?: MatchingGameLinkTarget;
}

const GameCard = ({ game, categoryKey, matchingTarget }: Props) => {
	const navigate = useNavigate();
	const likes = game.likes ?? 0;
	const views = game.views ?? 0;

	return (
		<button
			type="button"
			onClick={() => {
				if (matchingTarget || categoryKey === "MATCHING") {
					navigate({
						to: "/matching/game",
						search: {
							gameId: game.id,
							grade: matchingTarget?.grade,
							topic: matchingTarget?.topicCode,
						},
					});
				} else {
					navigate({
						to: "/games/$id",
						params: { id: String(game.id) },
					});
				}
			}}
			className={styles.card}
		>
			<div className={styles.mediaFrame}>
				{game.thumbnailUrl ? (
					<img
						src={game.thumbnailUrl}
						alt={game.title}
						className={styles.media}
					/>
				) : (
					<div className={styles.mediaFallback}>🎮</div>
				)}

				<div className={styles.overlay}>
					<div className={styles.statPill}>
						👁 {views.toLocaleString("vi-VN")}
					</div>
					<div className={styles.statPill}>
						❤ {likes.toLocaleString("vi-VN")}
					</div>
					{/* <div className={styles.statPill}>
            {views + likes * 5 > 0 ? "Đang được chú ý" : "Mới lên kệ"}
          </div> */}
				</div>
			</div>
			<div className={styles.copy}>
				<h3 className={styles.title}>{game.title}</h3>
				<p className={styles.description}>{game.description}</p>
			</div>
		</button>
	);
};

export default GameCard;
