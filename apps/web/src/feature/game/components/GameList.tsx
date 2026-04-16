import PageMeta from "@/shared/components/seo/page-meta";
import useDebounce from "@/shared/hooks/use-debounce";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { featuredGame } from "../data/games";
import type { Game, GameCategoryWithGames } from "../services/gameService";
import gameService from "../services/gameService";
import Footer from "./Footer";
import styles from "./HomePage.module.css";
import { Navbar } from "./Navbar/Navbar";
import CategoryRow from "./CategoryRow";

interface Props {
	username: string | null;
}

const GAME_ROW_SKELETON_IDS = ["hero", "arcade", "focus", "speed"] as const;
const CATEGORY_ROW_SKELETONS = [
	{ id: "featured", descriptionWidth: "w-72" },
	{ id: "puzzle", descriptionWidth: "w-80" },
	{ id: "challenge", descriptionWidth: "w-64" },
] as const;

function GameHeroSkeleton() {
	return (
		<section className={styles.hero}>
			<div className="absolute inset-0 bg-[#1a0f12]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(236,19,55,0.12),_transparent_40%),radial-gradient(circle_at_left,_rgba(59,130,246,0.08),_transparent_35%)]" />
			<div className={styles.heroContent}>
				<div className={styles.heroInner}>
					<div className="flex items-center gap-3">
						<Skeleton className="h-6 w-28 rounded-full bg-white/12" />
						<Skeleton className="h-5 w-32 rounded-full bg-white/10" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-16 w-64 bg-white/12 sm:w-80" />
						<Skeleton className="h-16 w-52 bg-white/10 sm:w-72" />
						<Skeleton className="h-16 w-40 bg-white/10 sm:w-56" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-5 w-full max-w-xl bg-white/10" />
						<Skeleton className="h-5 w-full max-w-lg bg-white/10" />
						<Skeleton className="h-5 w-3/4 max-w-md bg-white/10" />
					</div>
					<div className="flex flex-wrap gap-4 pt-4">
						<Skeleton className="h-12 w-40 rounded-lg bg-white/12" />
						<Skeleton className="h-12 w-36 rounded-lg bg-white/10" />
					</div>
				</div>
			</div>
		</section>
	);
}

function CategoryRowSkeleton({
	descriptionWidth,
}: {
	descriptionWidth: string;
}) {
	return (
		<section className="space-y-5">
			<div className="px-8">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<Skeleton className="h-3 w-3 rounded-full bg-white/25" />
							<Skeleton className="h-7 w-40 bg-white/15" />
						</div>
						<Skeleton className={`h-4 bg-white/10 ${descriptionWidth}`} />
					</div>
					<Skeleton className="hidden h-5 w-20 bg-white/10 md:block" />
				</div>
			</div>
			<div className="flex gap-3 overflow-hidden px-8">
				{GAME_ROW_SKELETON_IDS.map((cardId) => (
					<div key={cardId} className="w-64 flex-none space-y-3">
						<Skeleton className="aspect-video w-full rounded-md bg-white/10" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-5/6 bg-white/10" />
							<Skeleton className="h-3 w-2/3 bg-white/10" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export default function GameList({ username }: Props) {
	const [categoriesWithGames, setCategoriesWithGames] = useState<
		GameCategoryWithGames[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [selectedGame, setSelectedGame] = useState<Game | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	const [isFullscreen, setIsFullscreen] = useState(false);
	const gameContainerRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const fetchCategoriesWithGames = async () => {
			setIsLoading(true);
			setLoadError(null);
			try {
				const data = await gameService.getCategoriesWithGames();
				if (Array.isArray(data)) {
					setCategoriesWithGames(data);
				} else {
					console.error("API returned non-array data:", data);
					setCategoriesWithGames([]);
					setLoadError("Game data is unavailable right now.");
				}
			} catch (error) {
				console.error("Failed to load categories with games", error);
				setCategoriesWithGames([]);
				setLoadError("Unable to load games right now. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		void fetchCategoriesWithGames();

		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const toggleFullscreen = () => {
		if (!gameContainerRef.current) return;

		if (!document.fullscreenElement) {
			gameContainerRef.current.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	};

	if (selectedGame) {
		const gameUrl = `${selectedGame.playUrl}?gameId=${selectedGame.id}&userId=${encodeURIComponent(username || "")}`;

		return (
			<div className="fixed inset-0 z-50 flex flex-col bg-black">
				<div className="flex items-center justify-between bg-gray-900 p-4 text-white shadow-lg">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => setSelectedGame(null)}
							className="rounded bg-gray-800 px-6 py-2 font-bold transition-colors hover:bg-gray-700"
						>
							← Quay lại
						</button>
						<h2 className="text-lg font-bold">{selectedGame.title}</h2>
						{!username && (
							<span className="text-sm text-yellow-500">
								⚠️ Chưa đăng nhập - tiến trình chơi sẽ không được lưu
							</span>
						)}
					</div>
					<button
						type="button"
						onClick={toggleFullscreen}
						className="rounded bg-red-600 px-6 py-2 font-bold transition-colors hover:bg-red-700"
					>
						{isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
					</button>
				</div>
				<div className="relative flex-1">
					<iframe
						ref={gameContainerRef}
						src={gameUrl}
						className="h-full w-full border-none"
						title="Game Play"
					/>
				</div>
			</div>
		);
	}

	const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();
	const filteredCategoriesWithGames = normalizedSearch
		? categoriesWithGames
				.map((category) => {
					const games = (category.games ?? []).filter((game) => {
						const title = game.title?.toLowerCase() || "";
						const description = game.description?.toLowerCase() || "";
						return (
							title.includes(normalizedSearch) ||
							description.includes(normalizedSearch)
						);
					});
					return { ...category, games } as GameCategoryWithGames;
				})
				.filter(
					(category) =>
						(category.games && category.games.length > 0) ||
						category.name.toLowerCase().includes(normalizedSearch),
				)
		: categoriesWithGames;

	const isSearching = normalizedSearch.length > 0;
	const totalSearchResults = filteredCategoriesWithGames.reduce(
		(sum, category) => sum + (category.games?.length ?? 0),
		0,
	);

	return (
		<div className="min-h-screen bg-[#12080a] text-white">
			<PageMeta
				title="Bit Learning Game Center"
				description="Khám phá kho trò chơi học tập giúp học sinh luyện tư duy logic, tin học và phản xạ trên Bit Learning."
			/>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link
				rel="preconnect"
				href="https://fonts.gstatic.com"
				crossOrigin="anonymous"
			/>
			<link
				href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap"
				rel="stylesheet"
			/>
			<link
				href="https://fonts.googleapis.com/icon?family=Material+Icons"
				rel="stylesheet"
			/>
			<Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

			{isLoading ? (
				<GameHeroSkeleton />
			) : (
				<section className={styles.hero}>
					<div className={styles.heroBg}>
						<img
							src="/game-center-banner.jpg"
							alt="Game Hero"
							className={styles.heroBgImg}
						/>
						<div className={styles.heroGradient} />
					</div>
					<div className={styles.heroContent}>
						<div className={styles.heroInner}>
							<div className={styles.heroBadges}>
								<span className={styles.badge}>Game nổi bật</span>
								<span className={styles.badgeSub}>#1 Xu hướng Quiz</span>
							</div>
							<h1 className={styles.heroTitle}>
								Uma
								<br />
								Quiz
								<br />
								<span className={styles.heroAccent}>Run</span>
							</h1>
							<p className={styles.heroDesc}>
								Thử thách kiến thức và tốc độ của bạn trong trò chơi quiz nhịp
								độ nhanh! Kiểm tra bản thân với thời gian và leo lên bảng xếp
								hạng. Bạn đã sẵn sàng chưa?
							</p>
							<div className={styles.heroActions}>
								<Link
									to="/games/$id"
									params={{ id: featuredGame.id }}
									className={styles.btnPlay}
								>
									<span className="material-icons">play_arrow</span>
									CHƠI NGAY
								</Link>
								<button type="button" className={styles.btnInfo}>
									<span className="material-icons" style={{ fontSize: 20 }}>
										info
									</span>
									THÔNG TIN
								</button>
							</div>
						</div>
					</div>
				</section>
			)}

			<main className={styles.main}>
				{isSearching && (
					<div className="mb-2 px-8 text-sm text-slate-300">
						Kết quả cho
						<span className="font-semibold"> "{debouncedSearchTerm}"</span>
						{totalSearchResults > 0 && (
							<span>{` (${totalSearchResults} trò chơi)`}</span>
						)}
					</div>
				)}

				{isLoading ? (
					<div className="space-y-10">
						{CATEGORY_ROW_SKELETONS.map((row) => (
							<CategoryRowSkeleton
								key={row.id}
								descriptionWidth={row.descriptionWidth}
							/>
						))}
					</div>
				) : filteredCategoriesWithGames.length > 0 ? (
					<AnimatePresence mode="popLayout">
						{filteredCategoriesWithGames.map((category) => (
							<motion.div
								key={category.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
							>
								<CategoryRow
									categoryName={category.name}
									categoryDescription={category.description}
									games={category.games || []}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				) : isSearching ? (
					<div className="px-8 text-sm text-slate-400">
						Không tìm thấy game phù hợp.
					</div>
				) : loadError ? (
					<div className="px-8">
						<div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100">
							{loadError}
						</div>
					</div>
				) : (
					<div className="px-8">
						<div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
							Chưa có trò chơi nào để hiển thị.
						</div>
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
}
