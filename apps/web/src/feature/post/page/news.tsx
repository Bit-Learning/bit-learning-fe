import PageMeta from '@/components/seo/page-meta'
import News from '@/features/post/component/News'
import React from 'react'

const NewsPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Tin tức lập trình - BithubLearning"
                description="Cập nhật những tin tức, xu hướng và kiến thức mới nhất trong lập trình. Bài viết chất lượng từ các chuyên gia tại BithubLearning."
                keywords="tin tức lập trình, blog lập trình, xu hướng công nghệ, mẹo lập trình, kiến thức lập trình, BithubLearning"
            />
            <News />
        </>
    )
}

export default NewsPage
