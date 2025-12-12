import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { ChevronDown, ChevronUp, PlayCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useSectionsByCourse } from '../../lecture/queries/useSection'

interface CourseCurriculumProps {
    courseId: number
}

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ courseId }) => {
    const [expandedSections, setExpandedSections] = useState<number[]>([])
    const { data: sections, isLoading, error } = useSectionsByCourse(courseId)

    const toggleSection = (sectionId: number) => {
        setExpandedSections(prev =>
            prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId],
        )
    }

    const expandAll = () => {
        if (sections) {
            setExpandedSections(sections.map(s => s.id))
        }
    }

    const collapseAll = () => {
        setExpandedSections([])
    }

    const isSectionExpanded = (sectionId: number) => {
        return expandedSections.includes(sectionId)
    }

    if (isLoading) {
        return (
            <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
                <p className="mt-4 text-gray-600">Đang tải nội dung khóa học...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-red-600">Lỗi: {(error as Error).message}</p>
            </div>
        )
    }

    if (!sections || sections.length === 0) {
        return <div className="py-8 text-center text-gray-500">Chưa có nội dung khóa học</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Nội dung khóa học</h3>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onPress={expandAll}>
                        Mở tất cả
                    </Button>
                    <Button variant="ghost" size="sm" onPress={collapseAll}>
                        Thu gọn
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {sections.map(section => {
                    const isExpanded = isSectionExpanded(section.id)

                    return (
                        <div
                            key={section.id}
                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="flex w-full items-center justify-between bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 shrink-0 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 shrink-0 text-gray-600" />
                                    )}
                                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="divide-y divide-gray-100 bg-white">
                                    {section.lectures && section.lectures.length > 0 ? (
                                        section.lectures.map((lecture, index) => (
                                            <div
                                                key={lecture.id}
                                                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <PlayCircle className="h-5 w-5 shrink-0 text-orange-500" />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">{index + 1}</span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {lecture.title}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {lecture.isPreviewable && (
                                                        <Badge className="bg-blue-600 text-xs text-white">
                                                            PREVIEW
                                                        </Badge>
                                                    )}
                                                    <span className="text-sm text-gray-600">00:00:00</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">Chưa có bài học</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CourseCurriculum
