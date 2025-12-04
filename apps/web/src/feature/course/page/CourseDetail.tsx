import PageMeta from '@/shared/components/seo/page-meta'
import { useParams } from '@tanstack/react-router'
import React from 'react'
import CourseDetailContent from '../component/CourseDetailContent'

const CourseDetailPage: React.FC = () => {
    const { id } = useParams({ from: '/courses/$id' })

    return (
        <>
            <PageMeta
                title="Chi Tiết Khóa Học - Bithub Learning"
                description="Thông tin chi tiết về khóa học lập trình tại Bithub"
            />
            <CourseDetailContent courseId={id} />
        </>
    )
}

export default CourseDetailPage
