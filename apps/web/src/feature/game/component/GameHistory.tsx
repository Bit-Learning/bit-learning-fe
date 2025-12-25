import { format } from 'date-fns'
import { Calendar, Clock, Target } from 'lucide-react'
import React from 'react'
import { useGameLogs } from '../hooks/useGame'

interface GameHistoryProps {
    gameId: number
}

export const GameHistory: React.FC<GameHistoryProps> = ({ gameId }) => {
    const { data: logs, isLoading } = useGameLogs(gameId)

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Your History</h3>
                <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-24 rounded-lg bg-gray-200" />
                    ))}
                </div>
            </div>
        )
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Your History</h3>
                <p className="py-8 text-center text-gray-500">
                    You haven't played this game yet. Start playing to track your progress!
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">Your History</h3>

            <div className="space-y-4">
                {logs.map((log, index) => (
                    <div
                        key={log.id}
                        className="rounded-xl border-2 border-gray-200 p-4 transition-colors hover:border-indigo-300"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={16} />
                                {format(new Date(log.playedAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                            <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 font-bold text-white">
                                {log.score}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Target size={18} className="text-green-600" />
                                <div>
                                    <div className="text-xs text-gray-500">Accuracy</div>
                                    <div className="font-bold text-gray-900">{log.details.accuracy.toFixed(1)}%</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-blue-600" />
                                <div>
                                    <div className="text-xs text-gray-500">Time</div>
                                    <div className="font-bold text-gray-900">{log.details.totalTime}s</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="text-xs text-gray-500">Correct</div>
                                    <div className="font-bold text-gray-900">
                                        {log.details.history.filter(h => h.correct).length}/{log.details.history.length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {index === 0 && logs.length > 1 && (
                            <div className="mt-2 text-xs font-semibold text-green-600">⭐ Best Score</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
