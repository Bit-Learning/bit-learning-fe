import MentorLayout from '@/layouts/mentor-layout'
import PageMeta from '@/shared/components/seo/page-meta'
import { CoursesListView } from '../component/CourseListView'

export default function CoursesListPage() {
    return (
        <>
            <PageMeta title="Quản lý khóa học - Mentor" description="Danh sách khóa học của bạn" />
            <MentorLayout>
                <div className="p-6">
                    <CoursesListView />
                </div>
            </MentorLayout>
        </>
    )
}
