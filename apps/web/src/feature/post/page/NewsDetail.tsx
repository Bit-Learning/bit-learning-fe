import PageMeta from '@/components/seo/page-meta'
import NewsDetail from '@/features/post/component/NewsDetail'
import React from 'react'

const NewsDetailPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Chi tiết tin tức - Bithub Learning"
                description="Đọc chi tiết tin tức lập trình mới nhất từ BithubLearning. Bài viết chất lượng với nội dung chuyên sâu về công nghệ và lập trình."
                keywords="tin tức lập trình, bài viết lập trình, chi tiết tin tức, Bithub Learning, công nghệ, lập trình"
            />
            <NewsDetail />
        </>
    )
}

export default NewsDetailPage
