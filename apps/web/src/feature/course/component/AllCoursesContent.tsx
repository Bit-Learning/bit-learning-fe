import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import {
    Search,
    Filter,
    Star,
    Play,
    ChevronLeft,
    BookOpen,
    Code,
    Globe,
    Smartphone,
    Database,
    Shield,
    Zap,
    TrendingUp,
    Award,
    Target,
} from 'lucide-react'
import React, { useState, useMemo } from 'react'

interface Course {
    id: string
    title: string
    description: string
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
    isBestseller?: boolean
    isNew?: boolean
    isHot?: boolean
    language: string
    lastUpdated: string
}

const courses: Course[] = [
    {
        id: 'web-dev-fullstack',
        title: 'Lập trình Web Fullstack với React & Node.js',
        description:
            'Khóa học toàn diện về phát triển web từ frontend đến backend, giúp bạn trở thành fullstack developer chuyên nghiệp.',
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
        isBestseller: true,
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-15',
    },
    {
        id: 'ui-ux-design',
        title: 'Thiết kế UI/UX Chuyên nghiệp',
        description:
            'Học thiết kế giao diện người dùng hiện đại và tạo trải nghiệm người dùng tuyệt vời với Figma và Adobe XD.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '8 tuần',
        students: 890,
        rating: 4.9,
        price: '1.800.000đ',
        originalPrice: '3.200.000đ',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Thiết kế',
        level: 'Cơ bản',
        features: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design System'],
        isHot: true,
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-10',
    },
    {
        id: 'digital-marketing',
        title: 'Digital Marketing & SEO',
        description:
            'Khóa học marketing số toàn diện bao gồm SEO, Google Ads, Facebook Ads và chiến lược marketing online.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '10 tuần',
        students: 1560,
        rating: 4.7,
        price: '2.200.000đ',
        originalPrice: '3.500.000đ',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Marketing',
        level: 'Cơ bản',
        features: ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Analytics'],
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-08',
    },
    {
        id: 'blockchain-dev',
        title: 'Blockchain & Smart Contracts',
        description: 'Tìm hiểu về công nghệ blockchain, cryptocurrency và phát triển smart contracts với Solidity.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '14 tuần',
        students: 650,
        rating: 4.6,
        price: '3.500.000đ',
        originalPrice: '5.000.000đ',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Blockchain',
        level: 'Nâng cao',
        features: ['Solidity', 'Ethereum', 'Smart Contracts', 'DeFi', 'NFTs'],
        isNew: true,
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-20',
    },
    {
        id: 'mobile-app-dev',
        title: 'Phát triển Mobile App với React Native',
        description: 'Học cách xây dựng ứng dụng di động cross-platform với React Native và Expo.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '10 tuần',
        students: 980,
        rating: 4.7,
        price: '2.800.000đ',
        originalPrice: '4.200.000đ',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Mobile',
        level: 'Trung cấp',
        features: ['React Native', 'Expo', 'JavaScript', 'Mobile UI', 'APIs'],
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-12',
    },
    {
        id: 'python-data-science',
        title: 'Python cho Data Science & Machine Learning',
        description: 'Khóa học Python từ cơ bản đến nâng cao, tập trung vào data science và machine learning.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '16 tuần',
        students: 1200,
        rating: 4.8,
        price: '3.200.000đ',
        originalPrice: '4.800.000đ',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Data Science',
        level: 'Trung cấp',
        features: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow'],
        isBestseller: true,
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-18',
    },
    {
        id: 'java-spring-boot',
        title: 'Java Spring Boot - Phát triển Backend',
        description: 'Học Java Spring Boot để xây dựng các ứng dụng backend mạnh mẽ và scalable.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '12 tuần',
        students: 750,
        rating: 4.6,
        price: '2.600.000đ',
        originalPrice: '3.900.000đ',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Backend',
        level: 'Trung cấp',
        features: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'Security'],
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-14',
    },
    {
        id: 'devops-aws',
        title: 'DevOps với AWS và Docker',
        description: 'Học DevOps practices, AWS cloud services và containerization với Docker.',
        instructor: 'Nguyễn Ngọc Lâm',
        duration: '8 tuần',
        students: 680,
        rating: 4.5,
        price: '2.400.000đ',
        originalPrice: '3.600.000đ',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'DevOps',
        level: 'Nâng cao',
        features: ['AWS', 'Docker', 'CI/CD', 'Kubernetes', 'Monitoring'],
        language: 'Tiếng Việt',
        lastUpdated: '2024-01-16',
    },
]

const categories = [
    { id: 'all', name: 'Tất cả', icon: BookOpen, count: courses.length },
    { id: 'programming', name: 'Lập trình', icon: Code, count: 3 },
    { id: 'design', name: 'Thiết kế', icon: Globe, count: 1 },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp, count: 1 },
    { id: 'blockchain', name: 'Blockchain', icon: Shield, count: 1 },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, count: 1 },
    { id: 'data-science', name: 'Data Science', icon: Database, count: 1 },
    { id: 'backend', name: 'Backend', icon: Zap, count: 1 },
    { id: 'devops', name: 'DevOps', icon: Target, count: 1 },
]

const levels = [
    { id: 'all', name: 'Tất cả cấp độ' },
    { id: 'beginner', name: 'Cơ bản' },
    { id: 'intermediate', name: 'Trung cấp' },
    { id: 'advanced', name: 'Nâng cao' },
]

const AllCoursesContent: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedLevel, setSelectedLevel] = useState('all')
    const [sortBy, setSortBy] = useState('popular')

    const filteredCourses = useMemo(() => {
        return courses
            .filter(course => {
                const matchesSearch =
                    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())

                const matchesCategory =
                    selectedCategory === 'all' || course.category.toLowerCase().includes(selectedCategory)
                const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase().includes(selectedLevel)

                return matchesSearch && matchesCategory && matchesLevel
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'popular':
                        return b.students - a.students
                    case 'rating':
                        return b.rating - a.rating
                    case 'newest':
                        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                    case 'price-low':
                        return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''))
                    case 'price-high':
                        return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''))
                    default:
                        return 0
                }
            })
    }, [searchTerm, selectedCategory, selectedLevel, sortBy])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="mb-4 inline-flex items-center text-sm text-gray-600 transition-colors hover:text-blue-700"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Trang chủ
                    </Link>

                    <div className="text-center">
                        <div className="mb-4 flex items-center justify-center space-x-2">
                            <img src="./Logo.png" alt="Bithub Logo" className="h-10 w-36 object-contain" />
                        </div>
                        <h1 className="mb-4 text-4xl font-bold text-gray-900">Khám phá khóa học lập trình</h1>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            Hơn 8 khóa học chất lượng cao với hơn 8,000+ học viên đã tham gia
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
                    <div className="flex flex-col gap-4 lg:flex-row">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm khóa học, giảng viên..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="h-12 pl-10 text-lg"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="lg:w-48">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="h-12 w-full rounded-lg border border-gray-300 px-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="popular">Phổ biến nhất</option>
                                <option value="rating">Đánh giá cao nhất</option>
                                <option value="newest">Mới nhất</option>
                                <option value="price-low">Giá thấp đến cao</option>
                                <option value="price-high">Giá cao đến thấp</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="mt-6">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        selectedCategory === category.id
                                            ? 'bg-blue-700 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <category.icon className="h-4 w-4" />
                                    <span>{category.name}</span>
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {category.count}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Level Filters */}
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {levels.map(level => (
                                <button
                                    key={level.id}
                                    onClick={() => setSelectedLevel(level.id)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        selectedLevel === level.id
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {level.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                        Hiển thị <span className="font-semibold">{filteredCourses.length}</span> khóa học
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Filter className="h-4 w-4" />
                        <span>Đã lọc theo tiêu chí</span>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCourses.map(course => (
                        <Link key={course.id} to={`/course/${course.id}`}>
                            <Card className="group cursor-pointer overflow-hidden p-0 transition-all duration-300 hover:shadow-xl">
                                {/* Course Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                    {/* Badges */}
                                    <div className="absolute left-3 top-3 flex flex-col gap-2">
                                        {course.isBestseller && (
                                            <Badge className="bg-yellow-500 text-xs text-white">Bestseller</Badge>
                                        )}
                                        {course.isHot && <Badge className="bg-red-500 text-xs text-white">Hot</Badge>}
                                        {course.isNew && <Badge className="bg-green-500 text-xs text-white">Mới</Badge>}
                                    </div>

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                                            <Play className="ml-1 h-5 w-5 text-gray-800" />
                                        </div>
                                    </div>
                                </div>

                                {/* Course Content */}
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {/* Title */}
                                        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                                            {course.title}
                                        </h3>

                                        {/* Instructor */}
                                        <p className="text-sm text-gray-600">{course.instructor}</p>

                                        {/* Rating and Students */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-current text-yellow-500" />
                                                <span className="font-semibold">{course.rating}</span>
                                            </div>
                                            <span className="text-gray-500">({course.students.toLocaleString()})</span>
                                        </div>

                                        {/* Price */}
                                        {/* <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{course.price}</span>
                      <span className="text-sm text-gray-500 line-through">{course.originalPrice}</span>
                    </div> */}

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-1">
                                            {course.features.slice(0, 3).map(feature => (
                                                <Badge key={feature} variant="outline" className="text-xs">
                                                    {feature}
                                                </Badge>
                                            ))}
                                            {course.features.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{course.features.length - 3}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Course Info */}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{course.duration}</span>
                                            <span>{course.level}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* No Results */}
                {filteredCourses.length === 0 && (
                    <div className="py-12 text-center">
                        <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">Không tìm thấy khóa học</h3>
                        <p className="mb-4 text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                        <Button
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedCategory('all')
                                setSelectedLevel('all')
                            }}
                            className="bithub-button-primary"
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}

                {/* Call to Action */}
                {filteredCourses.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-orange-600 p-8 text-white">
                            <div className="mb-4 flex justify-center">
                                <Award className="h-12 w-12 text-white" />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold">Bắt đầu hành trình học tập ngay hôm nay!</h3>
                            <p className="mb-6 text-lg opacity-90">
                                Tham gia cộng đồng hơn 8,000+ học viên đã thành công với các khóa học của Bithub
                            </p>
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Link to="/offline-course">
                                    <Button className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-700 transition-colors hover:bg-gray-100">
                                        Đăng ký lớp Offline
                                    </Button>
                                </Link>
                                <Button className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-700">
                                    Tư vấn miễn phí
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllCoursesContent
