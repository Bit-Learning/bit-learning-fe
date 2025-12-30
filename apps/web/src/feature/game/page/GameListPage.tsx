import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Spinner } from '@workspace/ui/components/Spinner'
import { CheckCircle, ChevronRight, Filter, Trophy } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useGames } from '../hooks/useGame'

const gameTypes = [
    { value: '', label: 'All Games' },
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'FILL_IN_BLANK', label: 'Fill in Blank' },
    { value: 'TYPING', label: 'Typing' },
    { value: 'CODE_COMPLETION', label: 'Code Completion' },
]

export const GameListPage: React.FC = () => {
    const search = useSearch({ from: '/_headerOnly/games/list' })
    const navigate = useNavigate({ from: '/games/list' })
    const typeFilter = (search as any)?.type || ''
    const [page, setPage] = useState(0)
    const [selectedType, setSelectedType] = useState(typeFilter)
    const { data, isLoading, error } = useGames(page, 12, selectedType)

    // Sync URL params with state
    useEffect(() => {
        setSelectedType(typeFilter)
        setPage(0)
    }, [typeFilter])

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Spinner />
            </div>
        )
    }

    if (error) {
        throw error
    }

    const handleTypeChange = (type: string) => {
        // Navigate with search params instead of just updating state
        navigate({
            to: '/games/list',
            search: type ? { type } : {},
        })
    }

    const currentTypeLabel = gameTypes.find(t => t.value === selectedType)?.label || 'All Games'

    return (
        <div className="bg-linear-to-br min-h-screen from-indigo-50 via-white to-purple-50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-gray-900">🎮 {currentTypeLabel}</h1>
                    <p className="text-lg text-gray-600">Test your knowledge and compete with others!</p>
                </div>

                {/* Filter Section */}
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="h-4 w-4" />
                        <span>Filter by type:</span>
                    </div>
                    {gameTypes.map(type => (
                        <Button
                            key={type.value}
                            variant={selectedType === type.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleTypeChange(type.value)}
                            className="transition-all"
                        >
                            {type.label}
                        </Button>
                    ))}
                </div>

                {/* Results Count */}
                {data && (
                    <div className="mb-6 text-center text-sm text-gray-600">
                        Showing {data.content.length} of {data.totalElements} games
                    </div>
                )}

                {/* Games Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data?.content.map(game => (
                        <Link key={game.id} to="/games/$id" params={{ id: String(game.id) }} className="group">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl">
                                {/* Thumbnail */}
                                <div className="bg-linear-to-br relative h-48 overflow-hidden from-indigo-500 to-purple-600">
                                    {game.thumbnailUrl ? (
                                        <img
                                            src={game.thumbnailUrl}
                                            alt={game.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-6xl text-white">
                                            🎯
                                        </div>
                                    )}

                                    {/* Played Badge */}
                                    {game.isPlayed && (
                                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                                            <CheckCircle size={14} />
                                            Played
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                            {game.topic}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                            {game.type.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>

                                    <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                                        {game.title}
                                    </h3>

                                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{game.description}</p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-4">
                                            {game.isPlayed && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Trophy size={16} className="text-yellow-500" />
                                                    <span className="font-semibold text-gray-700">
                                                        {game.bestScore}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight
                                            size={20}
                                            className="text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-indigo-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {data && data.content.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-gray-500">No games found for the selected filter.</p>
                        <Button variant="link" onClick={() => handleTypeChange('')} className="mt-2">
                            Clear filter
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="rounded-lg bg-indigo-600 px-4 py-2 text-white">
                            {page + 1} / {data.totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                            disabled={page >= data.totalPages - 1}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
