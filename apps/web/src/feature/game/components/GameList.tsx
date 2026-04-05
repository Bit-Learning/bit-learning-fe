import useDebounce from "@/shared/hooks/use-debounce";
import { Link } from "@tanstack/react-router";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { featuredGame } from "../data/games";
import type { Game, GameCategory } from "../services/gameService";
import gameService from "../services/gameService";
import CategoryRow from "./CategoryRow";
import styles from "./HomePage.module.css";
import { Navbar } from "./Navbar/Navbar";
import Footer from "./Footer";

interface Props {
	username: string | null;
}

export default function GameList({ username }: Props) {
	const [categoriesWithGames, setCategoriesWithGames] = useState<
		GameCategory[]
	>([]);
	const [selectedGame, setSelectedGame] = useState<Game | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// State for Fullscreen
	const [isFullscreen, setIsFullscreen] = useState(false);
	const gameContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchCategoriesWithGames();

		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const fetchCategoriesWithGames = async () => {
		try {
			const data = await gameService.getCategoriesWithGames();
			console.log("Categories with games:", data);
			// Ensure data is an array before setting state
			if (Array.isArray(data)) {
				setCategoriesWithGames(data);
			} else {
				console.error("API returned non-array data:", data);
				setCategoriesWithGames([]);
			}
		} catch (error) {
			console.error("Failed to load categories with games", error);
			setCategoriesWithGames([]);
		}
	};

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

	// --- VIEW: Playing Game Screen ---
	if (selectedGame) {
		const gameUrl = `${selectedGame.playUrl}?gameId=${selectedGame.id}&userId=${encodeURIComponent(username || "")}`;

		return (
			<div className="fixed inset-0 z-50 bg-black flex flex-col">
				<div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSelectedGame(null)}
							className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
						>
							← Quay lại
						</button>
						<h2 className="font-bold text-lg">{selectedGame.title}</h2>
						{!username && (
							<span className="text-yellow-500 text-sm">
								⚠️ Chưa đăng nhập - tiến trình chơi sẽ không được lưu
							</span>
						)}
					</div>
					<button
						onClick={toggleFullscreen}
						className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors"
					>
						{isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
					</button>
				</div>
				<div className="flex-1 relative">
					<iframe
						ref={gameContainerRef as any}
						src={gameUrl}
						className="w-full h-full border-none"
						title="Game Play"
					/>
				</div>
			</div>
		);
	}

	// --- VIEW: Netflix-style Home ---
	const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();
	const filteredCategoriesWithGames = normalizedSearch
		? categoriesWithGames
				.map((category) => {
					const games = (category.games || []).filter((game) => {
						const title = game.title?.toLowerCase() || "";
						const description = game.description?.toLowerCase() || "";
						return (
							title.includes(normalizedSearch) ||
							description.includes(normalizedSearch)
						);
					});
					return { ...category, games } as GameCategory;
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
			<title>Bit Learning Game Center</title>
			<Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

			{/* Hero */}
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
							Thử thách kiến thức và tốc độ của bạn trong trò chơi quiz nhịp độ
							nhanh! Kiểm tra bản thân với thời gian và leo lên bảng xếp hạng.
							Bạn đã sẵn sàng chưa?
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
							<button className={styles.btnInfo}>
								<span className="material-icons" style={{ fontSize: 20 }}>
									info
								</span>
								THÔNG TIN
							</button>
						</div>
					</div>
				</div>
			</section>

			<main className={styles.main}>
				{/* Search info */}
				{isSearching && (
					<div className="px-8 text-sm text-slate-300 mb-2">
						Kết quả cho
						<span className="font-semibold"> "{debouncedSearchTerm}"</span>
						{totalSearchResults > 0 && (
							<span>{` (${totalSearchResults} trò chơi)`}</span>
						)}
					</div>
				)}

				{/* Categories with Games - Netflix Style */}
				{filteredCategoriesWithGames.length > 0 ? (
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
				) : (
					<Loader />
				)}
			</main>
			<Footer />
		</div>
	);
}
