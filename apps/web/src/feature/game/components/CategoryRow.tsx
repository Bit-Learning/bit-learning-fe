import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Game } from "../services/gameService";

interface CategoryRowProps {
	categoryName: string;
	categoryDescription: string;
	categoryIcon: string;
	games: Game[];
}

export default function CategoryRow({
	categoryName,
	categoryDescription,
	categoryIcon,
	games,
}: CategoryRowProps) {
	const navigate = useNavigate();
	const scrollContainerRef = useRef<HTMLDivElement>(null);

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
		<div className="mb-8">
			<h2 className="text-xl font-bold text-white px-8 flex items-center gap-2">
				<span>{categoryIcon}</span>
				<span>{categoryName}</span>
			</h2>
			<span className="text-gray-300 text-sm px-8 mb-4">
				{categoryDescription}
			</span>

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
							<div
								key={game.id}
								onClick={() =>
									navigate({
										to: "/games/$id",
										params: { id: String(game.id) },
									})
								}
								className="flex-none w-64 cursor-pointer transform transition-transform duration-300 hover:scale-105"
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
										<p className="text-white/80 text-xs truncate">
											{game.description}
										</p>
									</div>
								</div>
							</div>
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
		</div>
	);
}
