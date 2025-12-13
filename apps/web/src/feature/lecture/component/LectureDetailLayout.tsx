import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSectionsByCourse } from '../queries/useSection'
import { LectureType } from '../types/lecture.type'
import CourseSidebar from './CourseSidebar'
import QuizPlayer from './QuizPlayer'
import VideoPlayer from './VideoPlayer'

interface LectureDetailLayoutProps {
    courseId: number
    lectureId: number
}

const LectureDetailLayout: React.FC<LectureDetailLayoutProps> = ({ courseId, lectureId }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [currentLecture, setCurrentLecture] = useState<any>(null)

    const { data: sections, isLoading } = useSectionsByCourse(courseId)

    useEffect(() => {
        if (sections) {
            for (const section of sections) {
                console.log(lectureId)
                const lecture = section.lectures?.find(l => l.id === lectureId)
                if (lecture) {
                    setCurrentLecture({ ...lecture, sectionTitle: section.title })
                    break
                }
            }
        }
    }, [sections, lectureId])

    const getNextLecture = () => {
        if (!sections || !currentLecture) return null

        let foundCurrent = false
        for (const section of sections) {
            for (const lecture of section.lectures || []) {
                if (foundCurrent && !lecture.isDeleted) {
                    return lecture
                }
                if (lecture.id === currentLecture.id) {
                    foundCurrent = true
                }
            }
        }
        return null
    }

    const getPreviousLecture = () => {
        if (!sections || !currentLecture) return null

        let previousLecture = null
        for (const section of sections) {
            for (const lecture of section.lectures || []) {
                if (lecture.id === currentLecture.id) {
                    return previousLecture
                }
                if (!lecture.isDeleted) {
                    previousLecture = lecture
                }
            }
        }
        return null
    }

    const goToLecture = (newLectureId: number) => {
        window.location.href = `/lectures/${newLectureId}`
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-400">Đang tải bài học...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
                <div className="flex items-center gap-4">
                    <Link
                        to="/courses/$id"
                        params={{ id: String(courseId) }}
                        className="text-gray-400 transition-colors hover:text-white"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-semibold text-white">{currentLecture?.sectionTitle}</h1>
                        <p className="text-xs text-gray-400">{currentLecture?.title}</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-gray-400 hover:text-white lg:hidden"
                >
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 bg-black">
                        {currentLecture?.type === LectureType.VIDEO ? (
                            <VideoPlayer lectureId={lectureId} />
                        ) : currentLecture?.type === LectureType.QUIZ ? (
                            <QuizPlayer lectureId={lectureId} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                <p>Nội dung đang được cập nhật</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-800 bg-gray-950 px-6 py-4">
                        <Button
                            variant="outline"
                            isDisabled={!getPreviousLecture()}
                            onPress={() => {
                                const prev = getPreviousLecture()
                                if (prev) goToLecture(prev.id)
                            }}
                            className="border-gray-700 bg-gray-800 text-white"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Bài trước
                        </Button>

                        <Button
                            variant="outline"
                            isDisabled={!getNextLecture()}
                            onPress={() => {
                                const next = getNextLecture()
                                if (next) goToLecture(next.id)
                            }}
                            className="border-gray-700 bg-gray-800 text-white"
                        >
                            Bài tiếp theo
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <CourseSidebar
                    courseId={courseId}
                    lectureId={lectureId}
                    sections={sections}
                    isOpen={isSidebarOpen}
                    onNavigate={goToLecture}
                />
            </div>
        </div>
    )
}

export default LectureDetailLayout
