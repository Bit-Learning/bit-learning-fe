import MentorLayout from '@/layouts/mentor-layout'
import PageMeta from '@/shared/components/seo/page-meta'
import { CoursePerformanceChart } from '../components/CoursePerformanceChart'
import { RecentQuestions } from '../components/RecentQuestion'
import { RevenueChart } from '../components/RevenueChart'
import { StatsCards } from '../components/StatCards'
import { StudentDistributionChart } from '../components/StudentDistributionChart'
import { TopCoursesTable } from '../components/TopCoursesTable'
import {
    mockCoursePerformance,
    mockRecentQuestions,
    mockRevenueData,
    mockStats,
    mockStudentDistribution,
} from '../data/data'

export default function DashboardPage() {
    return (
        <>
            <PageMeta title="Trang thống kê- Mentor" description="Dashboard" />
            <MentorLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Trang thống kê</h1>
                            <p className="mt-1 text-gray-600">Xin chào! Đây là tổng quan hoạt động của bạn.</p>
                        </div>
                    </div>

                    <StatsCards stats={mockStats} />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <RevenueChart data={mockRevenueData} />
                        <StudentDistributionChart data={mockStudentDistribution} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <CoursePerformanceChart data={mockCoursePerformance} />
                        <RecentQuestions questions={mockRecentQuestions} />
                    </div>
                    <TopCoursesTable courses={mockCoursePerformance} />
                </div>
            </MentorLayout>
        </>
    )
}
