import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { Button } from '@workspace/ui/components/Button'
import { Clock, FileText, Loader2, Network } from 'lucide-react'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { useMindmapHistory } from '../hooks/useMindmapGeneration'
import { MindmapGenerationForm } from './MindmapGenerationForm'

interface MindmapTabProps {
    chatContext?: string
}

export const MindmapTab = ({ chatContext }: MindmapTabProps) => {
    const [activeView, setActiveView] = React.useState<'generate' | 'history'>('generate')

    const { userInfo } = useSelector(selectAuthStateInfo)
    const { data, isLoading, error } = useMindmapHistory(userInfo?.id || 0)

    return (
        <div className="flex h-full flex-col bg-gray-50">
            {/* Header with Tabs */}
            <div className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tạo Mind Map AI</h2>
                    <div className="flex gap-2">
                        <Button
                            variant={activeView === 'generate' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveView('generate')}
                            className="gap-2"
                        >
                            <Network className="h-4 w-4" />
                            Tạo mới
                        </Button>
                        <Button
                            variant={activeView === 'history' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveView('history')}
                            className="gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Lịch sử ({data?.length || 0})
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeView === 'generate' ? (
                    <MindmapGenerationForm chatContext={chatContext} />
                ) : (
                    <div className="mx-auto max-w-7xl">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : error ? (
                            <div className="flex h-64 items-center justify-center">
                                <p className="text-sm text-red-600">Không thể tải lịch sử</p>
                            </div>
                        ) : data && data.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center text-center">
                                <FileText className="mb-4 h-16 w-16 text-gray-300" />
                                <p className="mb-2 text-lg font-semibold text-gray-600">Chưa có mind map nào</p>
                                <p className="text-sm text-gray-500">Tạo mind map đầu tiên để bắt đầu</p>
                            </div>
                        ) : (
                            <>
                                {/* Mind Maps Grid */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {data?.map(mindmap => (
                                        <div
                                            key={mindmap.id}
                                            className="group rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                        >
                                            {/* Mind Map Icon */}
                                            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                                                <Network className="h-16 w-16 text-purple-500" />
                                            </div>

                                            {/* Mind Map Info */}
                                            <div className="mb-3">
                                                <h3 className="mb-1 truncate font-semibold text-gray-900">
                                                    {mindmap.title}
                                                </h3>
                                                <div className="space-y-1 text-xs text-gray-500">
                                                    <p>Code: {mindmap.code}</p>
                                                </div>
                                            </div>

                                            {/* Metadata */}
                                            <div className="mb-3 text-xs text-gray-500">
                                                {mindmap.createdAt && (
                                                    <span>
                                                        {new Date(mindmap.createdAt).toLocaleString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* View Button */}
                                            <Button
                                                size="sm"
                                                className="w-full gap-2"
                                                onClick={() =>
                                                    window.open(`/mindmaps/${userInfo?.id}/${mindmap.code}`, '_blank')
                                                }
                                            >
                                                <Network className="h-4 w-4" />
                                                Xem Mind Map
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
