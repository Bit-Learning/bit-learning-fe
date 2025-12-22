import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import MentorLayout from '@/layouts/mentor-layout'
import PageMeta from '@/shared/components/seo/page-meta'
import { useSelector } from 'react-redux'
import { CoursesListView } from '../component/CourseListView'

export default function CoursesListPage() {
    const { userInfo } = useSelector(selectAuthStateInfo)
    return (
        <>
            <PageMeta title="Quản lý khóa học - Mentor" description="Danh sách khóa học của bạn" />
            <MentorLayout>
                <div className="p-6">
                    <CoursesListView instructorId={userInfo?.id || 0} />
                </div>
            </MentorLayout>
        </>
    )
}
