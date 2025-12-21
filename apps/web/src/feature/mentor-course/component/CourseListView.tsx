import { useCoursesByGrade, useCourseState } from '@/feature/course/queries/useCourse'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { BookOpen, Edit, Eye, EyeOff, Plus, Search, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useDeleteCourse, useHideOrShowCourse } from '../queries/useCourse'

export const CoursesListView = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const { pagination } = useCourseState()
    const { data: coursesData, isLoading } = useCoursesByGrade(10)
    const deleteMutation = useDeleteCourse()
    const hideMutation = useHideOrShowCourse()

    const courses = Array.isArray(coursesData?.data) ? coursesData.data : []

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa khóa học này?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleToggleHide = (id: number, isHidden: boolean) => {
        hideMutation.mutate({ id, isHidden: !isHidden })
    }

    const filteredCourses = courses.filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Khóa học của tôi</h1>
                    <p className="mt-1 text-gray-600">Quản lý và chỉnh sửa các khóa học</p>
                </div>
                <Link to="/mentor/course/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo khóa học mới
                    </Button>
                </Link>
            </div>

            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm khóa học..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {isLoading ? (
                <div className="py-12 text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <Card className="p-12 text-center">
                    <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <h3 className="mb-2 text-xl font-semibold">Chưa có khóa học nào</h3>
                    <p className="mb-6 text-gray-600">Hãy tạo khóa học đầu tiên của bạn</p>
                    <Link to="/mentor/course/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo khóa học mới
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map(course => (
                        <Card key={course.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                            <div className="bg-linear-to-br flex aspect-video items-center justify-center from-blue-500 to-indigo-600">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <BookOpen className="h-16 w-16 text-white/50" />
                                )}
                            </div>

                            <div className="space-y-3 p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="line-clamp-2 text-lg font-semibold">{course.title}</h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{course.subtitle}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>0 học viên</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Lớp {course.grade}</span>
                                    </div>
                                </div>

                                <div className="text-2xl font-bold text-blue-600">
                                    {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} ₫`}
                                </div>

                                <div className="flex items-center gap-2 border-t pt-3">
                                    <Link to="/mentor/course/$id" params={{ id: course.id }} className="flex-1">
                                        <Button variant="outline" className="w-full" size="sm">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Chi tiết
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleHide(course.id, course.isHidden)}
                                    >
                                        {course.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(course.id)}
                                        isDisabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
