import { Badge } from '@workspace/ui/components/Badge'
import { CheckCircle, ChevronRight, Lock, PlayCircle } from 'lucide-react'
import React, { useState } from 'react'
import { SectionDetail } from '../types/section.type'

interface CourseSidebarProps {
    courseId: number
    lectureId: number
    sections?: SectionDetail[]
    isOpen: boolean
    onNavigate: (lectureId: number) => void
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ courseId, lectureId, sections, isOpen, onNavigate }) => {
    const [expandedSections, setExpandedSections] = useState<number[]>([])

    const toggleSection = (sectionId: number) => {
        setExpandedSections(prev =>
            prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId],
        )
    }

    React.useEffect(() => {
        if (sections) {
            for (const section of sections) {
                const hasCurrentLecture = section.lectures?.some(l => l.id === lectureId)
                if (hasCurrentLecture && !expandedSections.includes(section.id)) {
                    setExpandedSections(prev => [...prev, section.id])
                }
            }
        }
    }, [lectureId, sections])

    return (
        <div
            className={`${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            } absolute right-0 top-0 z-10 h-full w-full border-l border-gray-800 bg-gray-950 transition-transform duration-300 lg:relative lg:w-96 lg:translate-x-0`}
        >
            <div className="flex h-full flex-col">
                <div className="border-b border-gray-800 p-4">
                    <h2 className="font-semibold text-white">Nội dung khóa học</h2>
                    <p className="mt-1 text-sm text-gray-400">{sections?.length || 0} chương</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sections?.map((section, sectionIndex) => (
                        <div key={section.id} className="border-b border-gray-800">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-900"
                            >
                                <div className="flex-1">
                                    <h3 className="font-medium text-white">
                                        {sectionIndex + 1}. {section.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-400">
                                        {section.totalLectures} bài học • {Math.floor(section.totalDuration / 60)} phút
                                    </p>
                                </div>
                                <ChevronRight
                                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                                        expandedSections.includes(section.id) ? 'rotate-90' : ''
                                    }`}
                                />
                            </button>

                            {expandedSections.includes(section.id) && (
                                <div className="bg-gray-900/50">
                                    {section.lectures?.map((lecture, lectureIndex) => {
                                        const isActive = lecture.id === lectureId
                                        const isLocked = !lecture.isPreviewable
                                        const isCompleted = false

                                        return (
                                            <button
                                                key={lecture.id}
                                                onClick={() => !isLocked && onNavigate(lecture.id)}
                                                disabled={isLocked}
                                                className={`flex w-full cursor-pointer items-center gap-3 px-6 py-3 text-left transition-colors ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white'
                                                        : isLocked
                                                          ? 'cursor-not-allowed text-gray-600'
                                                          : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                            >
                                                <div className="shrink-0">
                                                    {isActive ? (
                                                        <PlayCircle className="h-5 w-5" />
                                                    ) : isCompleted ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : isLocked ? (
                                                        <Lock className="h-5 w-5" />
                                                    ) : (
                                                        <PlayCircle className="h-5 w-5" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {lectureIndex + 1}. {lecture.title}
                                                    </p>
                                                    {lecture.description && (
                                                        <p className="mt-1 truncate text-xs opacity-75">
                                                            {lecture.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    {lecture.isPreviewable && !isActive && (
                                                        <Badge className="bg-green-600 text-xs">Preview</Badge>
                                                    )}
                                                    {lecture.type && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-gray-700 text-xs text-gray-400"
                                                        >
                                                            {lecture.type}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CourseSidebar
