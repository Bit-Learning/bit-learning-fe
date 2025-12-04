import PageMeta from '@/shared/components/seo/page-meta'
import React from 'react'
import AboutUs from '../component/Aboutus'

const AboutUsPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Về chúng tôi - Bithub Learning"
                description="Tìm hiểu về Bithub Learning - Trung tâm đào tạo lập trình hàng đầu Việt Nam với hơn 5 năm kinh nghiệm, đào tạo hơn 1000 học viên thành công."
                keywords="BithubLearning, về chúng tôi, trung tâm đào tạo lập trình, khóa học lập trình, giảng viên lập trình"
            />
            <AboutUs />
        </>
    )
}

export default AboutUsPage
