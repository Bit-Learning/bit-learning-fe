import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import { ArrowUpRight, BookOpen, Eye, Users } from 'lucide-react'
import { CoursePerformance } from '../types/dashboard.type'

interface TopCoursesTableProps {
    courses: CoursePerformance[]
}

export const TopCoursesTable = ({ courses }: TopCoursesTableProps) => {
    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Top khóa học</h2>
                <Link to="/mentor/course/list">
                    <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                        Xem tất cả <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="pb-3 text-left text-sm font-semibold text-gray-600">Khóa học</th>
                            <th className="pb-3 text-center text-sm font-semibold text-gray-600">Học viên</th>
                            <th className="pb-3 text-center text-sm font-semibold text-gray-600">Đánh giá</th>
                            <th className="pb-3 text-center text-sm font-semibold text-gray-600">Hoàn thành</th>
                            <th className="pb-3 text-right text-sm font-semibold text-gray-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {courses.map((course, index) => (
                            <CourseRow key={index} course={course} />
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

interface CourseRowProps {
    course: CoursePerformance
}

const CourseRow = ({ course }: CourseRowProps) => {
    return (
        <tr className="hover:bg-gray-50">
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="bg-linear-to-br flex h-10 w-10 items-center justify-center rounded-lg from-blue-500 to-indigo-600">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                </div>
            </td>
            <td className="py-4 text-center">
                <span className="inline-flex items-center gap-1 text-gray-700">
                    <Users className="h-4 w-4 text-gray-400" />
                    {course.students}
                </span>
            </td>
            <td className="py-4 text-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-sm font-medium text-yellow-700">
                    ⭐ {course.rating}
                </span>
            </td>
            <td className="py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${course.completion}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{course.completion}%</span>
                </div>
            </td>
            <td className="py-4 text-right">
                <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    )
}
