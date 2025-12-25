import { GameService } from '@/feature/game/api/GameService'
import type { GameSection } from '@/feature/game/types'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
import { Skeleton } from '@workspace/ui/components/Skeleton'
import { BookOpen, ChevronRight, Code, Gamepad2, Keyboard, Trophy } from 'lucide-react'

const GameTypeIcon = ({ type }: { type: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
        QUIZ: <BookOpen className="h-5 w-5" />,
        FILL_IN_BLANK: <Code className="h-5 w-5" />,
        TYPING: <Keyboard className="h-5 w-5" />,
        CODE_COMPLETION: <Code className="h-5 w-5" />,
    }
    return iconMap[type] || <Gamepad2 className="h-5 w-5" />
}

const GameCard = ({ game }: { game: any }) => (
    <Link to="/games/$id" params={{ id: String(game.id) }} className="group block">
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
)

const GameSection = ({ section }: { section: GameSection }) => (
    <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                    <GameTypeIcon type={section.type} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{section.sectionTitle}</h2>
                    <p className="text-muted-foreground text-sm">
                        {section.items.length} game{section.items.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>
            <Link to="/games/list" search={{ type: section.type }}>
                <Button variant="ghost" className="gap-2">
                    View All
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="relative">
            <div className="scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent overflow-x-auto pb-4">
                <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                    {section.items.map(game => (
                        <div key={game.id} className="w-[280px] flex-shrink-0">
                            <GameCard game={game} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

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
            {[1, 2, 3, 4, 5].map(i => (
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
)

export default function GameDashboardPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gameDashboard'],
        queryFn: async () => {
            const response = await GameService.getDashboardGames(10)
            return response.data.data
        },
    })

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="mb-12 text-center">
                <div className="mb-4 inline-flex items-center gap-2">
                    <Gamepad2 className="text-primary h-8 w-8" />
                    <h1 className="from-primary bg-gradient-to-r to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                        Game Center
                    </h1>
                </div>
                <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                    Challenge yourself with interactive games. Test your knowledge, improve your skills, and compete
                    with others!
                </p>
            </div>

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
                    <p className="text-destructive">Failed to load games. Please try again later.</p>
                </div>
            )}

            {/* Game Sections */}
            {data && data.length === 0 && (
                <div className="py-12 text-center">
                    <Gamepad2 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground">No games available at the moment.</p>
                </div>
            )}

            {data?.map(section => (
                <GameSection key={section.type} section={section} />
            ))}
        </div>
    )
}
