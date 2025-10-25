import PageMeta from '@/components/seo/page-meta'
import React from 'react'
import AllCoursesContent from '../component/AllCoursesContent'

const AllCoursesPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Tất Cả Khóa Học - Bithub"
                description="Khám phá tất cả khóa học lập trình chất lượng cao tại Bithub"
            />
            <AllCoursesContent />
        </>
    )
}

export default AllCoursesPage
