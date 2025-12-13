import { selectSelectedCourseId } from '@/feature/course/store/course.store'
import { useParams } from '@tanstack/react-router'
import React from 'react'
import { useSelector } from 'react-redux'
import LectureDetailLayout from '../component/LectureDetailLayout'

const LecturePlayerPage: React.FC = () => {
    const { id } = useParams({ strict: false }) as { id: string }
    const courseId = useSelector(selectSelectedCourseId)

    if (!courseId) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="text-center">
                    <p className="text-gray-400">Không tìm thấy thông tin khóa học</p>
                    <a href="/courses" className="mt-4 text-blue-500 hover:underline">
                        Quay lại trang khóa học
                    </a>
                </div>
            </div>
        )
    }

    return <LectureDetailLayout courseId={courseId} lectureId={Number(id)} />
}

export default LecturePlayerPage
