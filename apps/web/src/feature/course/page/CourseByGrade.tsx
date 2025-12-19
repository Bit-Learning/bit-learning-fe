import PageMeta from '@/shared/components/seo/page-meta'
import { useParams } from '@tanstack/react-router'
import React from 'react'
import CoursesByGradeComponent from '../component/CourseByGradeComponent'

const CoursesByGradePage: React.FC = () => {
    const { grade } = useParams({ strict: false }) as { grade: string }

    const getGradeLevel = (grade: number) => {
        if (grade <= 5) return 'Tiểu học'
        if (grade <= 9) return 'THCS'
        return 'THPT'
    }

    return (
        <>
            <PageMeta
                title={`Khóa học Tin học Lớp ${grade} - ${getGradeLevel(Number(grade))} - Bithub`}
                description={`Khám phá các khóa học tin học chất lượng cao cho học sinh lớp ${grade} tại Bithub Learning`}
            />
            <CoursesByGradeComponent />
        </>
    )
}

export default CoursesByGradePage
