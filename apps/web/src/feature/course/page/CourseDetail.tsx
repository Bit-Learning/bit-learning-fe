import CourseDetailContent from '../component/CourseDetailContent'
import PageMeta from '@/components/seo/page-meta'
import { useParams } from '@tanstack/react-router'
import React from 'react'

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>()

    return (
        <>
            <PageMeta
                title="Chi Tiết Khóa Học - Bithub Learning"
                description="Thông tin chi tiết về khóa học lập trình tại Bithub"
            />
            <CourseDetailContent courseId={courseId} />
        </>
    )
}

export default CourseDetailPage
