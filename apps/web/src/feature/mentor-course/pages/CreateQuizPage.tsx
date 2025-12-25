import MentorLayout from '@/layouts/mentor-layout'
import PageMeta from '@/shared/components/seo/page-meta'
import { CreateQuizForm } from '../component/CreateQuizForm'

export default function CreateQuizPage() {
    return (
        <>
            <PageMeta title="Quản lý khóa học - Mentor" description="Danh sách khóa học của bạn" />
            <MentorLayout>
                <div className="p-6">
                    <CreateQuizForm />
                </div>
            </MentorLayout>
        </>
    )
}
