import MentorLayout from '@/layouts/mentor-layout'
import PageMeta from '@/shared/components/seo/page-meta'
import { useParams } from '@tanstack/react-router'
import { CourseDetailView } from '../component/CourseDetailView'

export default function CourseDetailPage() {
    const { id } = useParams({ from: '/mentor/course/$id' })

    return (
        <>
            <PageMeta title="Chi tiết khóa học - Mentor" description="Quản lý chương và bài học" />
            <MentorLayout>
                <div className="p-6">
                    <CourseDetailView courseId={parseInt(id)} />
                </div>
            </MentorLayout>
        </>
    )
}
