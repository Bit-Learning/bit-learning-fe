import PageMeta from '@/shared/components/seo/page-meta'
import { useParams } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import CourseDetailContent from '../component/CourseDetailContent'
import { useCourseActions } from '../queries/useCourse'

const CourseDetailPage: React.FC = () => {
    const { id } = useParams({ from: '/courses/$id' })
    const { selectCourse } = useCourseActions()

    useEffect(() => {
        selectCourse(Number(id))
    }, [id, selectCourse])

    return (
        <>
            <PageMeta
                title="Chi Tiết Khóa Học - Bithub Learning"
                description="Thông tin chi tiết về khóa học tin học tại Bithub"
            />
            <CourseDetailContent />
        </>
    )
}

export default CourseDetailPage
