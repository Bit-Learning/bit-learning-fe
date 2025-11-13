import { Button } from '@workspace/ui/components/Button'
import { ChevronLeft, ChevronRight, Clock, Download, FileText, Loader2, Presentation } from 'lucide-react'
import * as React from 'react'
import { useSlideHistory } from '../hooks'
import { SlideService } from '../service/SlideService'
import { SlideGenerationPanel } from './SlideGenerationPanel'

interface SlideTabProps {
    chatContext?: string
}

export const SlideTab = ({ chatContext }: SlideTabProps) => {
    const [activeView, setActiveView] = React.useState<'generate' | 'history'>('generate')
    const [page, setPage] = React.useState(0)
    const pageSize = 9 // 3x3 grid

    const { data, isLoading, error } = useSlideHistory(page, pageSize, 'generatedAt', 'desc')

    const handleDownload = async (url: string, filename: string) => {
        try {
            await SlideService.downloadFromUrl(url, filename)
        } catch (error) {
            console.error('Failed to download:', error)
        }
    }

    return (
        <div className="flex h-full flex-col bg-gray-50">
            {/* Header with Tabs */}
            <div className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tạo Slide AI</h2>
                    <div className="flex gap-2">
                        <Button
                            variant={activeView === 'generate' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveView('generate')}
                            className="gap-2"
                        >
                            <Presentation className="h-4 w-4" />
                            Tạo mới
                        </Button>
                        <Button
                            variant={activeView === 'history' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveView('history')}
                            className="gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Lịch sử ({data?.totalElements || 0})
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeView === 'generate' ? (
                    <SlideGenerationPanel chatContext={chatContext} />
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
                        ) : data && data.content.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center text-center">
                                <FileText className="mb-4 h-16 w-16 text-gray-300" />
                                <p className="mb-2 text-lg font-semibold text-gray-600">Chưa có slide nào</p>
                                <p className="text-sm text-gray-500">Tạo slide đầu tiên để bắt đầu</p>
                            </div>
                        ) : (
                            <>
                                {/* Slides Grid */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {data?.content.map(slide => (
                                        <div
                                            key={slide.id}
                                            className="group rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                        >
                                            {/* Slide Icon */}
                                            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                                                <Presentation className="h-16 w-16 text-blue-500" />
                                            </div>

                                            {/* Slide Info */}
                                            <div className="mb-3">
                                                <h3 className="mb-1 truncate font-semibold text-gray-900">
                                                    {slide.topic}
                                                </h3>
                                                <p className="text-xs text-gray-500">Template: {slide.templateName}</p>
                                                {slide.grade && (
                                                    <p className="text-xs text-gray-500">Lớp {slide.grade}</p>
                                                )}
                                            </div>

                                            {/* Metadata */}
                                            <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                                                <span>{slide.slideCount} slides</span>
                                                {slide.generatedAt && (
                                                    <span>
                                                        {new Date(slide.generatedAt).toLocaleString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Download Button */}
                                            <Button
                                                size="sm"
                                                onClick={() => handleDownload(slide.cloudinaryUrl, slide.filename)}
                                                className="w-full gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Tải xuống
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {data && data.totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                                        <p className="text-sm text-gray-600">
                                            Trang {page + 1} / {data.totalPages} • {data.totalElements} slides
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                                isDisabled={page === 0}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Trước
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => p + 1)}
                                                isDisabled={page >= data.totalPages - 1}
                                            >
                                                Sau
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
