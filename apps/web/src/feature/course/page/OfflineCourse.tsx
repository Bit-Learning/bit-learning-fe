import PageMeta from '@/components/seo/page-meta'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
import {
    ArrowLeft,
    Award,
    BookOpen,
    Building,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Play,
    Star,
    Users,
} from 'lucide-react'
import React, { useState } from 'react'
import OfflineCourseForm from '../component/OfflineCourseForm'

interface Course {
    id: string
    name: string
    duration: string
    price: string
    originalPrice: string
    schedule: string
    location: string
    maxStudents: number
    rating: number
    description: string
    features: string[]
    instructor: string
    image: string
    level: string
}

interface NewsPost {
    id: string
    title: string
    excerpt: string
    date: string
    category: string
    image: string
}

const courses: Course[] = [
    {
        id: 'web-dev-basic',
        name: 'Lập trình Web Cơ bản',
        duration: '8 tuần',
        price: '3.500.000đ',
        originalPrice: '5.000.000đ',
        schedule: 'Thứ 2, 4, 6 (18:00 - 21:00)',
        location: '62/22 Trương Công Định, Phường 14, Tân Bình, Hồ Chí Minh',
        maxStudents: 15,
        rating: 4.8,
        description: 'Khóa học lập trình web từ cơ bản đến nâng cao, phù hợp cho người mới bắt đầu.',
        features: ['HTML/CSS', 'JavaScript', 'React.js', 'Node.js', 'Database', 'Deployment'],
        instructor: 'Nguyễn Ngọc Lâm',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        level: 'Cơ bản',
    },
    {
        id: 'mobile-dev',
        name: 'Lập trình Mobile với React Native',
        duration: '10 tuần',
        price: '4.200.000đ',
        originalPrice: '6.000.000đ',
        schedule: 'Thứ 3, 5, 7 (18:00 - 21:00)',
        location: '62/22 Trương Công Định, Phường 14, Tân Bình, Hồ Chí Minh',
        maxStudents: 12,
        rating: 4.9,
        description: 'Học phát triển ứng dụng di động cross-platform với React Native.',
        features: ['React Native', 'JavaScript', 'Redux', 'Navigation', 'APIs'],
        instructor: 'Nguyễn Ngọc Lâm',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        level: 'Trung cấp',
    },
    {
        id: 'backend-dev',
        name: 'Lập trình Backend với Node.js',
        duration: '12 tuần',
        price: '4.800.000đ',
        originalPrice: '6.500.000đ',
        schedule: 'Thứ 2, 4, 6 (19:00 - 22:00)',
        location: '62/22 Trương Công Định, Phường 14, Tân Bình, Hồ Chí Minh',
        maxStudents: 18,
        rating: 4.7,
        description: 'Khóa học phát triển backend toàn diện với Node.js và các công nghệ database.',
        features: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'REST API', 'Authentication'],
        instructor: 'Nguyễn Ngọc Lâm',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        level: 'Nâng cao',
    },
    {
        id: 'data-science',
        name: 'Data Science & AI với Python',
        duration: '14 tuần',
        price: '6.500.000đ',
        originalPrice: '8.500.000đ',
        schedule: 'Thứ 3, 5, 7 (19:00 - 22:00)',
        location: '62/22 Trương Công Định, Phường 14, Tân Bình, Hồ Chí Minh',
        maxStudents: 10,
        rating: 4.6,
        description: 'Khóa học khoa học dữ liệu và trí tuệ nhân tạo với Python.',
        features: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Deep Learning'],
        instructor: 'Nguyễn Ngọc Lâm',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        level: 'Nâng cao',
    },
]

const newsPosts: NewsPost[] = [
    {
        id: '1',
        title: 'Lịch khai giảng tháng 12/2025 - Các khóa học lập trình mới',
        excerpt:
            'Thông báo lịch khai giảng các khóa học lập trình offline trong tháng 12/2025 với nhiều ưu đãi hấp dẫn.',
        date: '15/5/2025',
        category: 'Lịch khai giảng',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '2',
        title: 'Cơ sở đào tạo mới tại Tân Bình - Thiết bị hiện đại',
        excerpt: 'Trung tâm BithubLearning khai trương cơ sở đào tạo mới với đầy đủ thiết bị hiện đại phục vụ học tập.',
        date: '10/5/2025',
        category: 'Cơ sở đào tạo',
        image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '3',
        title: 'Chương trình ưu đãi đặc biệt - Giảm 30% học phí',
        excerpt:
            'Nhân dịp khai trương cơ sở mới, BithubLearning áp dụng chương trình ưu đãi giảm 30% học phí cho tất cả khóa học.',
        date: '5/5/2025',
        category: 'Ưu đãi',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
]

const OfflineCoursePage: React.FC = () => {
    const [showForm, setShowForm] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<string>('')

    const handleRegister = (courseId: string) => {
        setSelectedCourse(courseId)
        console.log(selectedCourse)
        setShowForm(true)
    }

    const handleBackToList = () => {
        setShowForm(false)
        setSelectedCourse('')
    }

    if (showForm) {
        return (
            <>
                <PageMeta
                    title="Đăng Ký Khóa Học Offline - BithubLearning"
                    description="Đăng ký các khóa học offline chất lượng cao tại BithubLearning"
                />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="mb-8">
                            <Button
                                variant="ghost"
                                onClick={handleBackToList}
                                className="mb-4 text-gray-600 hover:text-blue-700"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại danh sách khóa học
                            </Button>
                        </div>
                        <OfflineCourseForm />
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <PageMeta
                title="Khóa Học Offline - BithubLearning"
                description="Tham gia các khóa học lập trình offline chất lượng cao với giảng viên chuyên nghiệp tại BithubLearning"
            />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 py-20 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 flex items-center justify-center space-x-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">BithubLearning</span>
                        </div>
                        <h1 className="mb-6 text-5xl leading-tight font-bold">Khóa Học Lập Trình Offline</h1>
                        <p className="mb-8 text-xl leading-relaxed opacity-90">
                            Học trực tiếp với giảng viên chuyên nghiệp, tương tác và thực hành ngay tại lớp học. Xây
                            dựng nền tảng vững chắc cho sự nghiệp lập trình của bạn.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Button
                                size="lg"
                                className="bithub-button-secondary px-8 py-4 text-lg"
                                onClick={() =>
                                    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
                                }
                            >
                                Xem khóa học
                            </Button>
                            <Button
                                size="lg"
                                className="bithub-button-primary px-8 py-4 text-lg"
                                onClick={() => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Tin tức mới nhất
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Tại sao chọn khóa học offline?</h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            Trải nghiệm học tập tương tác và hiệu quả với những ưu điểm vượt trội
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">Học trực tiếp</h3>
                            <p className="text-gray-600">Tương tác trực tiếp với giảng viên và bạn học</p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                <CheckCircle className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">Thực hành ngay</h3>
                            <p className="text-gray-600">Làm project thực tế trong suốt khóa học</p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Award className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">Chứng chỉ</h3>
                            <p className="text-gray-600">Nhận chứng chỉ được công nhận sau khi hoàn thành</p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                <GraduationCap className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">Hỗ trợ 24/7</h3>
                            <p className="text-gray-600">Tư vấn và hỗ trợ trong 6 tháng sau khóa học</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Các Khóa Học Offline</h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            Chọn khóa học phù hợp với nhu cầu và lịch trình của bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                        {courses.map(course => (
                            <Card
                                key={course.id}
                                className="group overflow-hidden p-0 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.image}
                                        alt={course.name}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-orange-600 text-white">{course.level}</Badge>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                                            {course.duration}
                                        </Badge>
                                    </div>
                                    <div className="absolute right-4 bottom-4 left-4">
                                        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30">
                                            <Play className="ml-1 h-5 w-5 text-white" />
                                        </button>
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <div className="mb-3 flex items-start justify-between">
                                        <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                                            {course.name}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                                            <span className="text-sm font-medium">{course.rating}</span>
                                        </div>
                                    </div>

                                    <p className="mb-4 line-clamp-2 text-gray-600">{course.description}</p>

                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span className="truncate">Tân Bình, TP.HCM</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="h-4 w-4" />
                                            <span>Tối đa {course.maxStudents} học viên</span>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {course.features.slice(0, 3).map(feature => (
                                            <Badge key={feature} variant="outline" className="text-xs">
                                                {feature}
                                            </Badge>
                                        ))}
                                        {course.features.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{course.features.length - 3} more
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {/* <div>
                      <span className="text-2xl font-bold text-blue-700">{course.price}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">{course.originalPrice}</span>
                    </div> */}
                                        <Button
                                            onClick={() => handleRegister(course.id)}
                                            className="bithub-button-primary"
                                        >
                                            Đăng ký ngay
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section id="news" className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Tin Tức & Cập Nhật</h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            Cập nhật thông tin mới nhất về lịch khai giảng, cơ sở đào tạo và các chương trình ưu đãi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {newsPosts.map(post => (
                            <Card
                                key={post.id}
                                className="group overflow-hidden p-0 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-blue-600 text-white">{post.category}</Badge>
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>{post.date}</span>
                                    </div>

                                    <h3 className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                                        {post.title}
                                    </h3>

                                    <p className="mb-4 line-clamp-3 text-gray-600">{post.excerpt}</p>

                                    <Button variant="ghost" className="h-auto p-0 text-blue-600 hover:text-blue-700">
                                        Đọc thêm <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Training Center Section */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900">Cơ Sở Đào Tạo</h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            Trung tâm đào tạo hiện đại với đầy đủ trang thiết bị phục vụ học tập
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        <div>
                            <div className="relative h-96 overflow-hidden rounded-xl shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Cơ sở đào tạo BithubLearning"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="mb-4 text-2xl font-bold text-gray-900">Trung tâm BithubLearning</h3>
                                <p className="mb-6 text-gray-600">
                                    Cơ sở đào tạo hiện đại tại trung tâm thành phố với đầy đủ trang thiết bị phục vụ học
                                    tập và thực hành lập trình.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Địa chỉ</h4>
                                        <p className="text-gray-600">
                                            62/22 Trương Công Định, Phường 14, Tân Bình, Hồ Chí Minh
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                        <Building className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Cơ sở vật chất</h4>
                                        <p className="text-gray-600">
                                            Phòng học máy lạnh, máy tính hiện đại, bảng thông minh
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Tiện ích</h4>
                                        <p className="text-gray-600">
                                            Bãi xe rộng rãi, wifi tốc độ cao, khu vực nghỉ ngơi
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button className="bithub-button-primary">
                                    <Phone className="mr-2 h-4 w-4" />
                                    Gọi ngay: 0767666299
                                </Button>
                                <Button variant="outline" className="bithub-button-outline">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email: lamnhungoc@gmail.com
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-700 to-orange-600 py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-6 text-4xl font-bold">Sẵn sàng bắt đầu hành trình lập trình?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
                        Tham gia cộng đồng hơn 5,000+ học viên đã thành công với các khóa học của BithubLearning
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="bithub-button-secondary px-8 py-4 text-lg"
                            onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Xem tất cả khóa học
                        </Button>
                        <Button
                            size="lg"
                            className="bithub-button-primary px-8 py-4 text-lg"
                            onClick={() => handleRegister('all')}
                        >
                            Đăng ký ngay
                        </Button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default OfflineCoursePage
