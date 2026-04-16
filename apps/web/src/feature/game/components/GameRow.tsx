import type { GamePreview } from "../services/gameService";
import { useNavigate } from "@tanstack/react-router";
import { parseMatchingMetaFromTitle } from "../utils";
import type { TopicCode } from "../data";
import styles from "./GameRow.module.css";

interface Props {
	game: GamePreview;
	categoryName: string;
}

const GameCard = ({ game, categoryName }: Props) => {
	const navigate = useNavigate();
	const likes = game.likes ?? 0;
	const views = game.views ?? 0;

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
				</div>
			</div>
			<div className={styles.copy}>
				<h3 className={styles.title}>{game.title}</h3>
				<p className={styles.description}>{game.description}</p>
				<div className={styles.footer}>
					<span className={styles.categoryTag}>{categoryName}</span>
					<span className={styles.trendText}>
						{views + likes * 5 > 0 ? "Đang được chú ý" : "Mới lên kệ"}
					</span>
				</div>
			</div>
		</button>
	);
};

export default GameCard;
