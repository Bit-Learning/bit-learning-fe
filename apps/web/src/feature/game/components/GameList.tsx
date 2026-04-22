import PageMeta from "@/shared/components/seo/page-meta";
import useDebounce from "@/shared/hooks/use-debounce";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Flame, Heart, Sparkles } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
	FeaturedGame,
	FeaturedReason,
	GamePreview,
	GameCategoryWithGames,
} from "../services/gameService";
import gameService from "../services/gameService";
import matchingGameService, {
	type CurriculumMapping,
	type MatchingGameLinkTarget,
} from "../services/matchingGameService";
import Footer from "./Footer";
import styles from "./HomePage.module.css";
import { Navbar } from "./Navbar/Navbar";
import CategoryRow from "./CategoryRow";
import { CategoryRowSkeleton } from "./CategoryRowSkeleton";
import { GameHeroSkeleton } from "./GameHeroSkeleton";

const CATEGORY_ROW_SKELETONS = [
	{ id: "featured", descriptionWidth: "w-72" },
	{ id: "puzzle", descriptionWidth: "w-80" },
	{ id: "challenge", descriptionWidth: "w-64" },
] as const;

function GameNavigationLink({
	gameId,
	categoryName,
	matchingTargetsByGameId,
	className,
	children,
}: {
	gameId: number;
	categoryName?: string | null;
	matchingTargetsByGameId: ReadonlyMap<number, MatchingGameLinkTarget>;
	className?: string;
	children: ReactNode;
}) {
	const matchingTarget =
		categoryName === "MATCHING"
			? matchingTargetsByGameId.get(gameId)
			: undefined;

	if (matchingTarget) {
		return (
			<Link
				to="/matching/game"
				search={{
					gameId,
					grade: matchingTarget.grade,
					topic: matchingTarget.topicCode,
				}}
				className={className}
			>
				{children}
			</Link>
		);
	}

	if (categoryName === "MATCHING") {
		return (
			<Link to="/matching/game" search={{ gameId }} className={className}>
				{children}
			</Link>
		);
	}

	return (
		<Link to="/games/$id" params={{ id: String(gameId) }} className={className}>
			{children}
		</Link>
	);
}

function convertCategorNameToDisplayName(categoryName: string) {
	switch (categoryName) {
		case "QUIZ":
			return "Trắc nghiệm, chọn đáp án chính xác";
		case "TYPING":
			return "Gõ chữ, luyện phản xạ và tốc độ gõ phím";
		case "MATCHING":
			return "Ghép đôi, rèn luyện tư duy logic và phân loại";
		case "OTHERS":
			return "Trò chơi khác, đa dạng thể loại và cơ chế chơi";
		default:
			return categoryName;
	}
}

function formatCompactNumber(value: number) {
	return new Intl.NumberFormat("vi-VN", {
		notation: "compact",
		maximumFractionDigits: value >= 1000 ? 1 : 0,
	}).format(value);
}

function getFeaturedReasonLabel(reason?: FeaturedReason | null) {
	switch (reason) {
		case "MANUAL_BOOST":
			return "Được đẩy thủ công";
		case "TOP_LIKED":
			return "Nhiều lượt thích nhất";
		case "TOP_VIEWED":
			return "Nhiều lượt xem nhất";
		default:
			return "Đang tăng nhiệt";
	}
}

function resolveIsScored(game: GamePreview) {
	if (typeof game.isScored === "boolean") return game.isScored;
	if (game.scoringModel) return game.scoringModel !== "NO_SCORE";
	return false;
}

export default function GameList() {
	const [categoriesWithGames, setCategoriesWithGames] = useState<
		GameCategoryWithGames[]
	>([]);
	const [featuredGames, setFeaturedGames] = useState<FeaturedGame[]>([]);
	const [matchingMappings, setMatchingMappings] = useState<CurriculumMapping[]>(
		[],
	);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	useEffect(() => {
		const fetchCategoriesWithGames = async () => {
			setIsLoading(true);
			setLoadError(null);
			try {
				const [categoryData, featuredData, matchingMappingsData] =
					await Promise.all([
						gameService.getCategoriesWithGames(),
						gameService.getFeaturedGames(5),
						matchingGameService.getCurriculumMappings().catch((error) => {
							console.error(
								"Failed to load matching curriculum mappings",
								error,
							);
							return [];
						}),
					]);
				if (Array.isArray(categoryData)) {
					setCategoriesWithGames(categoryData);
					setFeaturedGames(Array.isArray(featuredData) ? featuredData : []);
					setMatchingMappings(
						Array.isArray(matchingMappingsData) ? matchingMappingsData : [],
					);
				} else {
					console.error("API returned non-array data:", categoryData);
					setCategoriesWithGames([]);
					setFeaturedGames([]);
					setMatchingMappings([]);
					setLoadError("Dữ liệu trò chơi hiện chưa sẵn sàng.");
				}
			} catch (error) {
				console.error("Failed to load categories with games", error);
				setCategoriesWithGames([]);
				setFeaturedGames([]);
				setMatchingMappings([]);
				setLoadError(
					"Chưa thể tải danh sách trò chơi lúc này. Vui lòng thử lại.",
				);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchCategoriesWithGames();

		return undefined;
	}, []);

	const matchingTargetsByGameId = useMemo(
		() =>
			new Map(
				matchingMappings.map((mapping) => [
					mapping.gameId,
					{
						grade: mapping.grade,
						topicCode: mapping.topicCode,
					} satisfies MatchingGameLinkTarget,
				]),
			),
		[matchingMappings],
	);

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
	const groupedByScore = useMemo(() => {
		const scored: GamePreview[] = [];
		const notScored: GamePreview[] = [];

		for (const category of filteredCategoriesWithGames) {
			for (const game of category.games ?? []) {
				if (resolveIsScored(game)) {
					scored.push(game);
				} else {
					notScored.push(game);
				}
			}
		}

		return { scored, notScored };
	}, [filteredCategoriesWithGames]);

	const totalSearchResults = filteredCategoriesWithGames.reduce(
		(sum, category) => sum + (category.games?.length ?? 0),
		0,
	);
	const fallbackSpotlightGames = filteredCategoriesWithGames
		.flatMap((category) =>
			(category.games ?? []).map((game) => ({
				...game,
				categoryName: category.name,
				categoryDescription: category.description,
				trendScore: game.trendScore ?? 0,
				featuredReason: "TRENDING" as FeaturedReason,
			})),
		)
		.sort((left, right) => {
			if (right.trendScore !== left.trendScore) {
				return right.trendScore - left.trendScore;
			}

			return (right.likes ?? 0) - (left.likes ?? 0);
		});
	const spotlightGames =
		featuredGames.length > 0
			? featuredGames.map((game) => ({
					...game,
					categoryName: game.categoryName ?? "Khác",
					categoryDescription: game.categoryDescription ?? "",
					trendScore: game.trendScore ?? 0,
					featuredReason: (game.featuredReason ?? "TRENDING") as FeaturedReason,
				}))
			: fallbackSpotlightGames;
	const featuredGame = spotlightGames[0] ?? null;
	const risingGames = spotlightGames.slice(1, 5);
	const totalViews = spotlightGames.reduce(
		(sum, game) => sum + (game.views ?? 0),
		0,
	);
	const totalLikes = spotlightGames.reduce(
		(sum, game) => sum + (game.likes ?? 0),
		0,
	);
	const totalGames = spotlightGames.length;
	const heroBackdrop = featuredGame?.thumbnailUrl || "/game-center-banner.jpg";

	return (
		<div className={styles.pageShell}>
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
							src={heroBackdrop}
							alt={featuredGame?.title ?? "Game Hero"}
							className={styles.heroBgImg}
						/>
						<div className={styles.heroGradient} />
					</div>
					<div className={styles.heroContent}>
						<div className={styles.heroInner}>
							<div className={styles.heroBadges}>
								<span className={styles.badge}>Trò chơi nổi bật</span>
								{/* <span className={styles.badgeSub}>
									{featuredGame
										? `${featuredGame.categoryName} · xu hướng ${formatCompactNumber(
												featuredGame.trendScore,
											)}`
										: "Kho game Bit Learning"}
								</span> */}
							</div>
							<h1 className={styles.heroTitle}>
								{featuredGame?.title ?? "Bit Learning Game Center"}
							</h1>
							<p className={styles.heroDesc}>
								{featuredGame?.description ??
									"Chọn một trò chơi, vào nhịp học nhanh và khám phá những thử thách đang được học sinh chơi nhiều nhất."}
							</p>
							<div className={styles.heroMetaRow}>
								<div className={styles.metricPill}>
									<Flame size={16} />
									<span>
										{featuredGame
											? getFeaturedReasonLabel(featuredGame.featuredReason)
											: "Luôn cập nhật"}
									</span>
								</div>
								<div className={styles.metricPill}>
									<Heart size={16} />
									<span>
										{formatCompactNumber(featuredGame?.likes ?? totalLikes)}{" "}
										lượt yêu thích
									</span>
								</div>
								<div className={styles.metricPill}>
									<span>👁</span>
									<span>
										{formatCompactNumber(featuredGame?.views ?? totalViews)}{" "}
										lượt xem
									</span>
								</div>
							</div>
							<div className={styles.heroActions}>
								{featuredGame ? (
									<>
										<GameNavigationLink
											gameId={featuredGame.id}
											categoryName={featuredGame.categoryName}
											matchingTargetsByGameId={matchingTargetsByGameId}
											className={styles.btnPlay}
										>
											<span className="material-icons">play_arrow</span>
											MỞ GAME
										</GameNavigationLink>
										<GameNavigationLink
											gameId={featuredGame.id}
											categoryName={featuredGame.categoryName}
											matchingTargetsByGameId={matchingTargetsByGameId}
											className={styles.btnInfo}
										>
											<ArrowUpRight size={18} />
											XEM CHI TIẾT
										</GameNavigationLink>
									</>
								) : (
									<div className={styles.emptyHeroState}>
										Chưa có game nào đủ dữ liệu để lên vị trí nổi bật.
									</div>
								)}
							</div>
						</div>
						<div className={styles.heroAside}>
							<div className={styles.asideCard}>
								<div className={styles.asideLabel}>
									<Sparkles size={16} />
									Tâm điểm
								</div>
								<div className={styles.asideStats}>
									<div>
										<strong>{formatCompactNumber(totalGames)}</strong>
										<span>game đang mở</span>
									</div>
									<div>
										<strong>{formatCompactNumber(totalViews)}</strong>
										<span>lượt xem</span>
									</div>
									<div>
										<strong>{formatCompactNumber(totalLikes)}</strong>
										<span>lượt thích</span>
									</div>
								</div>
								<div className={styles.asideDivider} />
								<div className={styles.asideList}>
									{risingGames.length > 0 ? (
										risingGames.map((game, index) => (
											<GameNavigationLink
												key={game.id}
												gameId={game.id}
												categoryName={game.categoryName}
												matchingTargetsByGameId={matchingTargetsByGameId}
												className={styles.asideItem}
											>
												<span className={styles.asideRank}>
													{String(index + 2).padStart(2, "0")}
												</span>
												<div>
													<div className={styles.asideTitle}>{game.title}</div>
													<div className={styles.asideMeta}>
														{getFeaturedReasonLabel(game.featuredReason)} ·{" "}
														{formatCompactNumber(game.trendScore)} xu hướng
													</div>
												</div>
											</GameNavigationLink>
										))
									) : (
										<div className={styles.asideEmpty}>
											Dải trò chơi nổi bật sẽ hiện khi có thêm game.
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</section>
			)}

			<main className={styles.main}>
				{!isLoading && spotlightGames.length > 0 && (
					<section className={styles.spotlightSection}>
						<div className={styles.spotlightHeader}>
							<div>
								<p className={styles.kicker}>Được chọn để tạo đà</p>
								<h2 className={styles.spotlightTitle}>Đang được chú ý nhất</h2>
								<p className={styles.spotlightCopy}>
									Xếp theo tổ hợp lượt xem và lượt yêu thích, những trò chơi này
									đang được cộng đồng quan tâm nhiều nhất. Hãy thử trải nghiệm
									và đánh giá để giúp chúng tôi cải thiện hơn nữa!
								</p>
							</div>
						</div>
						<div className={styles.spotlightGrid}>
							{spotlightGames.slice(0, 4).map((game, index) => (
								<GameNavigationLink
									key={game.id}
									gameId={game.id}
									categoryName={game.categoryName}
									matchingTargetsByGameId={matchingTargetsByGameId}
									className={styles.spotlightCard}
								>
									<div className={styles.spotlightMedia}>
										{game.thumbnailUrl ? (
											<img
												src={game.thumbnailUrl}
												alt={game.title}
												className={styles.spotlightImage}
											/>
										) : (
											<div className={styles.spotlightFallback}>🎮</div>
										)}
										<div className={styles.spotlightOverlay} />
										<div className={styles.spotlightRank}>
											#{String(index + 1).padStart(2, "0")}
										</div>
									</div>
									<div className={styles.spotlightBody}>
										<div className={styles.spotlightTopLine}>
											<span>{getFeaturedReasonLabel(game.featuredReason)}</span>
											{/* <span>{formatCompactNumber(game.trendScore)} trend</span> */}
										</div>
										<h3>{game.title}</h3>
										<p>{game.description}</p>
										<div className={styles.spotlightStats}>
											<span>❤ {formatCompactNumber(game.likes ?? 0)}</span>
											<span>👁 {formatCompactNumber(game.views ?? 0)}</span>
										</div>
									</div>
								</GameNavigationLink>
							))}
						</div>
					</section>
				)}

				{isSearching && (
					<div className="mb-2 px-8 text-sm text-slate-300">
						Kết quả cho
						<span className="font-semibold"> "{debouncedSearchTerm}"</span>
						{totalSearchResults > 0 && (
							<span>{` (${totalSearchResults} trò chơi)`}</span>
						)}
					</div>
				)}

				{!isLoading &&
					(groupedByScore.scored.length > 0 ||
						groupedByScore.notScored.length > 0) && (
						<div className="mb-5 px-8">
							<h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
								Phân loại theo cơ chế tính điểm
							</h2>
							<p className="mt-2 text-sm md:text-base text-slate-300">
								Nhóm nhanh các trò chơi có cộng điểm và không cộng điểm.
							</p>
						</div>
					)}

				{!isLoading &&
					(groupedByScore.scored.length > 0 ||
						groupedByScore.notScored.length > 0) && (
						<section className="space-y-10 mb-10">
							{groupedByScore.scored.length > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
								>
									<CategoryRow
										categoryName="Trò chơi có điểm số"
										categoryDescription="Các trò chơi có điểm số được tính vào tiến trình hoặc bảng xếp hạng"
										games={groupedByScore.scored}
										matchingTargetsByGameId={matchingTargetsByGameId}
									/>
								</motion.div>
							)}

							{groupedByScore.notScored.length > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
								>
									<CategoryRow
										categoryName="Trò chơi giải trí"
										categoryDescription="Các trò chơi luyện tập giải trí, không cộng điểm vào bảng xếp hạng"
										games={groupedByScore.notScored}
										matchingTargetsByGameId={matchingTargetsByGameId}
									/>
								</motion.div>
							)}
						</section>
					)}

				{!isLoading && filteredCategoriesWithGames.length > 0 && (
					<div className="mb-5 px-8">
						<h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
							Tất cả game theo thể loại
						</h2>
						<p className="mt-2 text-sm md:text-base text-slate-300">
							Danh sách đầy đủ theo từng danh mục hiện có.
						</p>
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
									categoryName={convertCategorNameToDisplayName(category.name)}
									categoryDescription={category.description}
									games={category.games || []}
									matchingTargetsByGameId={matchingTargetsByGameId}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				) : isSearching ? (
					<div className="px-8 text-sm text-slate-400">
						Không tìm thấy trò chơi phù hợp.
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
