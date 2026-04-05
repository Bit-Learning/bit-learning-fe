import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Game } from "../services/gameService";
import { useAudio } from "../contexts/AudioProvider";
import GameCard from "./GameRow";
import styles from "./GameRow.module.css";

interface CategoryRowProps {
	categoryName: string;
	categoryDescription: string;
	games: Game[];
}

export default function CategoryRow({
	categoryName,
	categoryDescription,
	games,
}: CategoryRowProps) {
	const navigate = useNavigate();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { playSound } = useAudio();

	const handleViewMore = () => {
		switch (categoryName) {
			case "MATCHING":
				// Start background music on explicit user action
				playSound("game-background-music", { loop: true });
				navigate({ to: "/matching" });
				break;
			default:
				navigate({ to: "/games" });
				break;
		}
	};

	const scroll = (direction: "left" | "right") => {
		if (scrollContainerRef.current) {
			const scrollAmount = 400;
			const newScrollLeft =
				scrollContainerRef.current.scrollLeft +
				(direction === "right" ? scrollAmount : -scrollAmount);
			scrollContainerRef.current.scrollTo({
				left: newScrollLeft,
				behavior: "smooth",
			});
		}
	};

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h2 className="text-xl font-bold text-white px-8 flex flex-col items-start gap-2">
					<div className="flex items-center gap-2">
						<span className={styles.accent} />
						{categoryName}
					</div>
					<span className="text-gray-300 text-sm">{categoryDescription}</span>
				</h2>
				<button className={styles.viewAll} onClick={() => handleViewMore()}>
					{" "}
					Xem tất cả{" "}
				</button>
			</div>
			{games.length === 0 ? (
				<div className="px-8">
					<div className="bg-gray-800/30 rounded-lg p-8 text-center border border-gray-700/50">
						<p className="text-gray-400 text-sm">
							No games in this category yet
						</p>
					</div>
				</div>
			) : (
				<div className="relative group/row">
					{/* Left scroll button */}
					<button
						type="button"
						onClick={() => scroll("left")}
						className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:from-black/90"
						aria-label="Scroll left"
					>
						<ChevronLeft className="w-8 h-8 text-white" />
					</button>

					{/* Scrollable container */}
					<div
						ref={scrollContainerRef}
						className="flex gap-2 overflow-x-auto scrollbar-hide px-8 scroll-smooth"
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{games.map((game) => (
							<GameCard game={game} categoryName={categoryName} key={game.id} />
						))}
					</div>

					{/* Right scroll button */}
					<button
						onClick={() => scroll("right")}
						className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:from-black/90"
						aria-label="Scroll right"
					>
						<ChevronRight className="w-8 h-8 text-white" />
					</button>
				</div>
			)}
		</section>
	);
}
