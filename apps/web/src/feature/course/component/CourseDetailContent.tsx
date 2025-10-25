import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ChevronLeft,
    Clock,
    Users,
    Star,
    Play,
    BookOpen,
    Award,
    CheckCircle,
    Heart,
    Share2,
    Video,
    MessageCircle,
    Download,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

interface Course {
    id: string
    title: string
    description: string
    longDescription: string
    instructor: string
    duration: string
    students: number
    rating: number
    price: string
    originalPrice: string
    image: string
    category: string
    level: string
    features: string[]
    curriculum: CurriculumItem[]
    requirements: string[]
    outcomes: string[]
    reviews: Review[]
    instructorInfo: InstructorInfo
}

interface CurriculumItem {
    id: string
    title: string
    duration: string
    lessons: number
    description: string
    isPreview?: boolean
}

interface Review {
    id: string
    name: string
    rating: number
    date: string
    comment: string
    avatar: string
}

interface InstructorInfo {
    name: string
    title: string
    avatar: string
    bio: string
    experience: string
    skills: string[]
    education: string
}

const courses: Course[] = [
    {
        id: 'web-dev-fullstack',
        title: 'Lập trình Web Fullstack với React & Node.js',
        description:
            'Khóa học toàn diện về phát triển web từ frontend đến backend, giúp bạn trở thành fullstack developer chuyên nghiệp.',
        longDescription:
            'Khóa học Lập trình Web Fullstack với React & Node.js là chương trình đào tạo toàn diện dành cho những ai muốn trở thành lập trình viên fullstack chuyên nghiệp.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '12 tuần',
        students: 1250,
        rating: 4.8,
        price: '2.500.000đ',
        originalPrice: '4.000.000đ',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Lập trình',
        level: 'Trung cấp',
        features: ['React.js', 'Node.js', 'MongoDB', 'REST API', 'Deployment'],
        curriculum: [
            {
                id: '1',
                title: 'Giới thiệu và Cài đặt môi trường',
                duration: '2 giờ',
                lessons: 5,
                description: 'Tìm hiểu về khóa học và cài đặt các công cụ cần thiết',
                isPreview: true,
            },
            {
                id: '2',
                title: 'HTML, CSS và JavaScript cơ bản',
                duration: '8 giờ',
                lessons: 12,
                description: 'Nền tảng web development với HTML5, CSS3 và JavaScript ES6+',
            },
        ],
        requirements: [
            'Có kiến thức cơ bản về máy tính',
            'Thiết bị có kết nối internet ổn định',
            'Tinh thần học tập và thực hành cao',
        ],
        outcomes: [
            'Thành thạo HTML, CSS, JavaScript và React.js',
            'Xây dựng được ứng dụng web fullstack hoàn chỉnh',
            'Hiểu và áp dụng được các best practices trong web development',
        ],
        reviews: [
            {
                id: '1',
                name: 'Nguyễn Văn A',
                rating: 5,
                date: '2024-01-15',
                comment: 'Khóa học rất hay và thực tế. Giảng viên dạy rất dễ hiểu và có nhiều kinh nghiệm thực tế.',
                avatar: 'https://lh3.googleusercontent.com/a/ACg8ocK6rUnqnVhC_yZB9ba3SB34-1aTiPiRcUJ1lOCELFHfUJIzRZUB=s192-c',
            },
        ],
        instructorInfo: {
            name: 'Nguyễn Ngọc Lâm',
            title: 'Giảng viên - Chuyên gia Lập trình',
            avatar: 'https://lh3.googleusercontent.com/a/ACg8ocK6rUnqnVhC_yZB9ba3SB34-1aTiPiRcUJ1lOCELFHfUJIzRZUB=s192-c',
            bio: 'Với hơn 8 năm kinh nghiệm trong lĩnh vực phát triển phần mềm và giảng dạy lập trình.',
            experience: '8+ năm kinh nghiệm',
            skills: ['React.js', 'Node.js', 'Python', 'Java', 'DevOps'],
            education: 'Cử nhân Công nghệ Thông tin - Đại học Bách Khoa TP.HCM',
        },
    },
]

const CourseDetailContent: React.FC<{ courseId?: string }> = ({ courseId }) => {
    const [isLiked, setIsLiked] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

    const course = courses.find(c => c.id === courseId) || courses[0]

    const handleEnroll = () => {
        toast.success('Đăng ký khóa học thành công!')
    }

    const handleLike = () => {
        setIsLiked(!isLiked)
        toast.success(isLiked ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-blue-700"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Trang chủ
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Course Header */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                            <div className="relative h-64 md:h-80">
                                <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute left-4 top-4">
                                    <Badge variant="secondary" className="bg-orange-600 text-white">
                                        {course.category}
                                    </Badge>
                                </div>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="secondary" className="bg-blue-700 text-white">
                                        {course.level}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30">
                                        <Play className="ml-1 h-5 w-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{course.title}</h1>
                                        <p className="text-lg leading-relaxed text-gray-600">{course.description}</p>
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
                                        <button className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600">
                                            <Share2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Course Stats */}
                                <div className="mb-6 flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                        <span className="text-gray-700">{course.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-gray-500" />
                                        <span className="text-gray-700">
                                            {course.students.toLocaleString()} học viên
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-current text-yellow-500" />
                                        <span className="text-gray-700">{course.rating}/5.0</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-gray-500" />
                                        <span className="text-gray-700">{course.curriculum.length} chương</span>
                                    </div>
                                </div>

                                {/* Course Features */}
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {course.features.map(feature => (
                                        <Badge key={feature} variant="outline" className="text-sm">
                                            {feature}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Course Tabs */}
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
                                            value="instructor"
                                            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                        >
                                            Giảng viên
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="reviews"
                                            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                        >
                                            Đánh giá
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-6">
                                    <TabsContent value="overview" className="space-y-6">
                                        <div>
                                            <h3 className="mb-4 text-xl font-bold text-gray-900">Mô tả khóa học</h3>
                                            <p className="leading-relaxed text-gray-700">{course.longDescription}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <h4 className="mb-3 text-lg font-semibold text-gray-900">
                                                    Bạn sẽ học được gì?
                                                </h4>
                                                <ul className="space-y-2">
                                                    {course.outcomes.map((outcome, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                                            <span className="text-gray-700">{outcome}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="mb-3 text-lg font-semibold text-gray-900">Yêu cầu</h4>
                                                <ul className="space-y-2">
                                                    {course.requirements.map((requirement, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <span className="text-gray-700">{requirement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="curriculum" className="space-y-4">
                                        <h3 className="mb-4 text-xl font-bold text-gray-900">Nội dung khóa học</h3>
                                        <div className="space-y-3">
                                            {course.curriculum.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {item.title}
                                                                </h4>
                                                                {item.isPreview && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="bg-green-100 text-xs text-green-700"
                                                                    >
                                                                        Preview
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="mb-2 text-sm text-gray-600">
                                                                {item.description}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4" />
                                                                    {item.duration}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Video className="h-4 w-4" />
                                                                    {item.lessons} bài học
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {item.isPreview && (
                                                            <Button variant="outline" size="sm">
                                                                <Play className="mr-1 h-4 w-4" />
                                                                Xem thử
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="instructor" className="space-y-6">
                                        <h3 className="mb-4 text-xl font-bold text-gray-900">Giảng viên</h3>
                                        <div className="flex items-start gap-6">
                                            <img
                                                src={course.instructorInfo.avatar}
                                                alt={course.instructorInfo.name}
                                                className="h-24 w-24 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4 className="mb-1 text-xl font-bold text-gray-900">
                                                    {course.instructorInfo.name}
                                                </h4>
                                                <p className="mb-2 font-medium text-blue-600">
                                                    {course.instructorInfo.title}
                                                </p>
                                                <p className="mb-4 leading-relaxed text-gray-700">
                                                    {course.instructorInfo.bio}
                                                </p>

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <h5 className="mb-2 font-semibold text-gray-900">
                                                            Kinh nghiệm
                                                        </h5>
                                                        <p className="text-gray-700">
                                                            {course.instructorInfo.experience}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h5 className="mb-2 font-semibold text-gray-900">Học vấn</h5>
                                                        <p className="text-gray-700">
                                                            {course.instructorInfo.education}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <h5 className="mb-2 font-semibold text-gray-900">
                                                        Kỹ năng chuyên môn
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {course.instructorInfo.skills.map(skill => (
                                                            <Badge key={skill} variant="outline" className="text-sm">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="reviews" className="space-y-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-gray-900">Đánh giá từ học viên</h3>
                                            <div className="flex items-center gap-2">
                                                <Star className="h-5 w-5 fill-current text-yellow-500" />
                                                <span className="font-semibold">{course.rating}/5.0</span>
                                                <span className="text-gray-500">
                                                    ({course.reviews.length} đánh giá)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {course.reviews.map(review => (
                                                <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                                                    <div className="mb-3 flex items-start gap-3">
                                                        <img
                                                            src={review.avatar}
                                                            alt={review.name}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {review.name}
                                                                </h4>
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`h-4 w-4 ${
                                                                                i < review.rating
                                                                                    ? 'fill-current text-yellow-500'
                                                                                    : 'text-gray-300'
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{review.date}</p>
                                                        </div>
                                                    </div>
                                                    <p className="leading-relaxed text-gray-700">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Enrollment Card */}
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-orange-600" />
                                    Đăng ký khóa học
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-700">{course.price}</span>
                  <span className="text-lg text-gray-500 line-through">{course.originalPrice}</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Giảm 37%
                  </Badge>
                </div> */}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Video className="h-4 w-4" />
                                        <span>Học trực tuyến mọi lúc, mọi nơi</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Download className="h-4 w-4" />
                                        <span>Tài liệu và source code đầy đủ</span>
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

                                <Button
                                    onClick={handleEnroll}
                                    className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-800 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl"
                                >
                                    Đăng ký ngay
                                </Button>

                                <Link to="/offline-course">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-lg border-2 border-orange-600 py-3 font-semibold text-orange-600 transition-all duration-200 hover:bg-orange-600 hover:text-white"
                                    >
                                        Đăng ký lớp Offline
                                    </Button>
                                </Link>

                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        Hoặc gọi <span className="font-semibold text-blue-700">0767666299</span> để tư
                                        vấn
                                    </p>
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
