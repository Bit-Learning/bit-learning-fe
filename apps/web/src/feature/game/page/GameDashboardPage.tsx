import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { motion } from "framer-motion";
import { BookOpen, Code, Gamepad2, Keyboard, Trophy } from "lucide-react";
import { GameService } from "@/feature/game/api/GameService";
import type { TGameSection } from "@/feature/game/types";
import SeeMoreButton from "@/shared/components/button/SeeMoreButton";
import PresentationBanner from "@/shared/components/PresentationBanner";
import Contact from "../component/Contact";

const fadeInUp = {
	hidden: { opacity: 0, y: 40 },
	visible: { opacity: 1, y: 0 },
};

const GameTypeIcon = ({ type }: { type: string }) => {
	const iconMap: Record<string, React.ReactNode> = {
		QUIZ: <BookOpen className="h-5 w-5 text-orange-500" />,
		FILL_IN_BLANK: <Code className="h-5 w-5 text-orange-500" />,
		TYPING: <Keyboard className="h-5 w-5 text-orange-500" />,
		CODE_COMPLETION: <Code className="h-5 w-5 text-orange-500" />,
	};
	return iconMap[type] || <Gamepad2 className="h-5 w-5 text-orange-500" />;
};

const GameCard = ({ game }: { game: any }) => (
	<Link
		to="/games/$id"
		params={{ id: String(game.id) }}
		className="group block"
	>
		<Card className="hover:border-primary/50 h-full overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
			<div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/10">
				<img
					src={game.thumbnailUrl}
					alt={game.title}
					className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
				/>
				{game.isPlayed && (
					<div className="absolute right-2 top-2 rounded-full bg-green-500 p-1 text-white">
						<Trophy className="h-4 w-4" />
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
				<div className="absolute bottom-2 left-2 right-2">
					<Badge variant="default" className="mb-1 text-xs">
						{game.topic}
					</Badge>
				</div>
			</div>
			<CardContent className="p-4">
				<h3 className="group-hover:text-primary mb-2 line-clamp-2 font-semibold transition-colors">
					{game.title}
				</h3>
				{game.bestScore > 0 && (
					<div className="text-muted-foreground flex items-center gap-2 text-sm">
						<Trophy className="h-4 w-4 text-yellow-500" />
						<span>Best: {game.bestScore} pts</span>
					</div>
				)}
			</CardContent>
		</Card>
	</Link>
);

const GameSection = ({ section }: { section: TGameSection }) => (
	<div className="mb-12">
		<div className="mb-6 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<div className="rounded-lg bg-gray-100 p-4">
					<GameTypeIcon type={section.type} />
				</div>
				<div>
					<h2 className="text-2xl font-bold">{section.sectionTitle}</h2>
					<p className="text-muted-foreground text-sm">
						{section.items.length} game
					</p>
				</div>
			</div>
			<Link to="/games/list" search={{ type: section.type }}>
				<SeeMoreButton />
			</Link>
		</div>

		{/* Horizontal Scrolling Container */}
		<div className="relative">
			<div className="scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-primary/50 overflow-x-auto pb-4">
				<div
					className="flex min-w-max gap-4"
					style={{ minWidth: "min-content" }}
				>
					{section.items.map((game) => (
						<div key={game.id} className="w-[280px] flex-shrink-0">
							<GameCard game={game} />
						</div>
					))}
				</div>
			</div>
		</div>
	</div>
);

const LoadingSkeleton = () => (
	<div className="mb-12">
		<div className="mb-6 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<Skeleton className="h-12 w-12 rounded-lg" />
				<div>
					<Skeleton className="mb-2 h-8 w-48" />
					<Skeleton className="h-4 w-32" />
				</div>
			</div>
			<Skeleton className="h-10 w-24" />
		</div>
		<div className="flex gap-4 overflow-hidden">
			{[1, 2, 3, 4, 5].map((i) => (
				<div key={i} className="w-[280px] flex-shrink-0">
					<Card>
						<Skeleton className="aspect-video" />
						<CardContent className="p-4">
							<Skeleton className="mb-2 h-6 w-full" />
							<Skeleton className="h-4 w-24" />
						</CardContent>
					</Card>
				</div>
			))}
		</div>
	</div>
);

export default function GameDashboardPage() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["gameDashboard"],
		queryFn: async () => {
			const response = await GameService.getDashboardGames(10);
			return response.data.data;
		},
	});

	return (
		<motion.div
			className="flex min-h-screen flex-col"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
		>
			{/* Hero Section */}

			<motion.div
				variants={fadeInUp}
				initial="hidden"
				whileInView="visible"
				transition={{ duration: 0.6 }}
				viewport={{ once: true, amount: 0.3 }}
			>
				<PresentationBanner />
			</motion.div>

			<main className="container mx-auto flex-1 overflow-hidden bg-[#FFFFFF] px-4 py-8">
				{/* Loading State */}
				{isLoading && (
					<>
						<LoadingSkeleton />
						<LoadingSkeleton />
					</>
				)}

				{/* Error State */}
				{error && (
					<div className="py-12 text-center">
						<p className="text-destructive">
							Failed to load games. Please try again later.
						</p>
					</div>
				)}

				{/* Game Sections */}
				{data && data.length === 0 && (
					<div className="py-12 text-center">
						<Gamepad2 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
						<p className="text-muted-foreground">
							No games available at the moment.
						</p>
					</div>
				)}

				{data?.map((section) => (
					<GameSection key={section.type} section={section} />
				))}
			</main>

			<motion.div
				variants={fadeInUp}
				initial="hidden"
				whileInView="visible"
				transition={{ duration: 0.6, delay: 0.2 }}
				viewport={{ once: true, amount: 0.3 }}
			>
				<Contact />
			</motion.div>
		</motion.div>
	);
}
