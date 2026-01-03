import CourseCurriculum from '@/feature/course/component/CourseCurriculum'
import CourseQA from '@/feature/course/component/CourseQA'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { toast } from '@workspace/ui/components/Sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/update/tabs'
import {
    Award,
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Clock,
    Download,
    Heart,
    Loader2,
    MessageCircle,
    Play,
    Share2,
    Star,
    Users,
    Video,
} from 'lucide-react'
import React, { useState } from 'react'
import { useCourseDetail } from '../queries/useCourse'
import { useCourseAccess, useCourseProgress, useEnrollCourse } from '../queries/useEnroll'

const CourseDetailContent: React.FC = () => {
    const [isLiked, setIsLiked] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

    const { data: course, isLoading, error } = useCourseDetail()
    const { data: hasAccess } = useCourseAccess(course?.id || 0)
    const { data: progress } = useCourseProgress(course?.id || 0, hasAccess === true)
    const { mutate: enroll, isPending } = useEnrollCourse()

    const handleEnroll = () => {
        if (course?.id) enroll(course.id)
    }

    const handleLike = () => {
        setIsLiked(!isLiked)
        toast.success({ title: isLiked ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích' })
    }

    const handleShare = () => {
        if (navigator.share && course) {
            navigator.share({
                title: course.title,
                text: course.description,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast.success({ title: 'Đã copy link khóa học' })
        }
    }

    if (isLoading) {
        return (
            <div className="bg-linear-to-br min-h-screen from-gray-50 to-blue-50">
                <div className="container mx-auto max-w-7xl px-4 py-8">
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700"></div>
                            <p className="text-gray-600">Đang tải thông tin khóa học...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !course) {
        return (
            <div className="bg-linear-to-br min-h-screen from-gray-50 to-blue-50">
                <div className="container mx-auto max-w-7xl px-4 py-8">
                    <div className="py-12 text-center">
                        <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">Không tìm thấy khóa học</h3>
                        <p className="mb-4 text-gray-600">{error ? (error as Error).message : ''}</p>
                        <Link to="/courses">
                            <Button className="bithub-button-primary">Về trang khóa học</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-linear-to-br min-h-screen from-gray-50 to-blue-50">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-md mb-6 flex items-center gap-2">
                    <Link
                        to="/courses/grade/$grade"
                        className="mb-4 inline-flex items-center text-gray-600 transition-colors hover:text-blue-700"
                        params={{ grade: String(course.grade) }}
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" />
                        Lớp {course.grade}
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                            <div className="relative h-64 md:h-80">
                                <img
                                    src={course.thumbnailUrl}
                                    alt={course.title}
                                    className="h-full w-full object-cover"
                                />
                                <div className="bg-linear-to-t absolute inset-0 from-black/60 to-transparent"></div>

                                <div className="absolute left-4 top-4 flex gap-2">
                                    <Badge className="bg-blue-700 text-white">Lớp {course.grade}</Badge>
                                    <Badge className="bg-orange-600 text-white">{course.level}</Badge>
                                    {hasAccess && (
                                        <Badge className="bg-green-600 text-white">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Đã đăng ký
                                        </Badge>
                                    )}
                                    {hasAccess && progress !== undefined && (
                                        <Badge className="bg-green-600 text-white">{Math.round(progress)}/100%</Badge>
                                    )}
                                </div>

                                <div className="absolute bottom-4 left-4">
                                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30">
                                        <Play className="ml-1 h-5 w-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex-1">
                                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{course.title}</h1>
                                        <p className="text-lg text-gray-600">{course.subtitle}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleLike}
                                            className={`rounded-full p-2 transition-colors ${
                                                isLiked
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                                            }`}
                                        >
                                            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
                                        >
                                            <Share2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-gray-700">
                                        Giảng viên:{' '}
                                        <span className="font-semibold text-blue-700">{course.instructorName}</span>
                                    </p>
                                </div>

                                <div className="mb-6 flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                        <span className="text-gray-700">{course.totalDuration} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-current text-yellow-500" />
                                        <span className="text-gray-700">
                                            {course.ratingStar}/5.0 ({course.ratingCount})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-gray-500" />
                                        <span className="text-gray-700">{course.totalSections} chương</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Video className="h-5 w-5 text-gray-500" />
                                        <span className="text-gray-700">{course.totalLectures} bài học</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <Badge variant="outline" className="text-sm">
                                        Ngôn ngữ: {course.language}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white shadow-lg">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="border-b border-gray-200">
                                    <TabsList className="grid w-full grid-cols-4 bg-transparent">
                                        <TabsTrigger
                                            value="overview"
                                            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                        >
                                            Tổng quan
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="curriculum"
                                            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                        >
                                            Nội dung
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="qa"
                                            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                        >
                                            <MessageCircle className="mr-1 h-4 w-4" />
                                            Q&A
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="instructor"
                                            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                        >
                                            Giảng viên
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-6">
                                    <TabsContent value="overview" className="space-y-6">
                                        <div>
                                            <h3 className="mb-4 text-xl font-bold text-gray-900">Mô tả khóa học</h3>
                                            <p className="leading-relaxed text-gray-700">{course.description}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <h4 className="mb-3 text-lg font-semibold text-gray-900">
                                                    Bạn sẽ học được gì?
                                                </h4>
                                                <div className="space-y-2">
                                                    {course.outcome.split('\n').map((item, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                                            <span className="text-gray-700">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="mb-3 text-lg font-semibold text-gray-900">Yêu cầu</h4>
                                                <div className="space-y-2">
                                                    {course.requirement.split('\n').map((item, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                                            <span className="text-gray-700">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="mb-3 text-lg font-semibold text-gray-900">
                                                Khóa học này dành cho ai?
                                            </h4>
                                            <p className="leading-relaxed text-gray-700">{course.audience}</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="curriculum" className="space-y-4">
                                        <CourseCurriculum courseId={course.id} />
                                    </TabsContent>

                                    <TabsContent value="qa" className="space-y-4">
                                        {hasAccess ? (
                                            <CourseQA lectureId={course.id} />
                                        ) : (
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
                                                <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                                <p className="mb-4 text-gray-600">
                                                    Bạn cần đăng ký khóa học để tham gia thảo luận
                                                </p>
                                                <Button
                                                    onClick={handleEnroll}
                                                    isDisabled={isPending}
                                                    className="bg-blue-700 text-white hover:bg-blue-800"
                                                >
                                                    Đăng ký ngay
                                                </Button>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="instructor" className="space-y-6">
                                        <h3 className="mb-4 text-xl font-bold text-gray-900">Giảng viên</h3>
                                        <div className="flex items-start gap-6">
                                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
                                                <Users className="h-12 w-12 text-blue-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="mb-1 text-xl font-bold text-gray-900">
                                                    {course.instructorName}
                                                </h4>
                                                <p className="mb-2 font-medium text-blue-600">
                                                    ID: {course.instructorId}
                                                </p>
                                                <p className="leading-relaxed text-gray-700">
                                                    Giảng viên giàu kinh nghiệm trong lĩnh vực tin học, đã có nhiều năm
                                                    giảng dạy và đào tạo học sinh.
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-orange-600" />
                                    Đăng ký khóa học
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-blue-700">
                                        {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Video className="h-4 w-4" />
                                        <span>Học trực tuyến mọi lúc, mọi nơi</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Download className="h-4 w-4" />
                                        <span>Tài liệu học tập đầy đủ</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>Hỗ trợ 24/7 từ giảng viên</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Award className="h-4 w-4" />
                                        <span>Chứng chỉ được công nhận</span>
                                    </div>
                                </div>

                                {hasAccess ? (
                                    <Button isDisabled className="w-full bg-green-600 py-3 font-semibold text-white">
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Đã đăng ký
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleEnroll}
                                        isDisabled={isPending}
                                        className="bg-linear-to-r w-full rounded-lg from-blue-700 to-blue-800 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl disabled:opacity-50"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Đăng ký ngay'
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin khóa học</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cấp độ:</span>
                                    <span className="font-semibold text-gray-900">{course.level}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lớp:</span>
                                    <span className="font-semibold text-gray-900">Lớp {course.grade}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngôn ngữ:</span>
                                    <span className="font-semibold text-gray-900">{course.language}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số chương:</span>
                                    <span className="font-semibold text-gray-900">{course.totalSections}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số bài học:</span>
                                    <span className="font-semibold text-gray-900">{course.totalLectures}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Thời lượng:</span>
                                    <span className="font-semibold text-gray-900">{course.totalDuration} phút</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseDetailContent
