import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/update/select'
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Eye,
    Filter,
    Heart,
    Search,
    Share2,
    Star,
    Tag,
    TrendingUp,
    User,
} from 'lucide-react'
import React, { useState } from 'react'

const News: React.FC = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const categories = [
        { value: 'all', label: 'Tất cả' },
        { value: 'programming', label: 'Lập trình' },
        { value: 'technology', label: 'Công nghệ' },
        { value: 'education', label: 'Giáo dục' },
        { value: 'career', label: 'Nghề nghiệp' },
        { value: 'tips', label: 'Mẹo hay' },
    ]

    const newsData = [
        {
            id: 1,
            title: 'Xu hướng lập trình 2024: Những công nghệ đáng chú ý',
            excerpt:
                'Khám phá những xu hướng lập trình mới nhất trong năm 2024, từ AI/ML đến Web3 và các framework mới...',
            content: 'Năm 2024 đánh dấu sự phát triển mạnh mẽ của nhiều công nghệ mới trong lĩnh vực lập trình...',
            author: 'Nguyễn Ngọc Lâm',
            date: '2024-01-15',
            readTime: '5 phút',
            views: 1250,
            category: 'programming',
            tags: ['JavaScript', 'React', 'AI', 'Web3'],
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            featured: true,
            trending: true,
        },
        {
            id: 2,
            title: 'Hướng dẫn học React từ cơ bản đến nâng cao',
            excerpt: 'Lộ trình học React hoàn chỉnh cho người mới bắt đầu, từ JSX cơ bản đến các pattern nâng cao...',
            content: 'React là một trong những thư viện JavaScript phổ biến nhất hiện nay...',
            author: 'Trần Thị Minh',
            date: '2024-01-12',
            readTime: '8 phút',
            views: 980,
            category: 'programming',
            tags: ['React', 'JavaScript', 'Frontend', 'Tutorial'],
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            featured: false,
            trending: true,
        },
        {
            id: 3,
            title: '10 mẹo tối ưu hiệu suất website với JavaScript',
            excerpt:
                'Những kỹ thuật tối ưu hiệu suất website hiệu quả nhất, giúp cải thiện tốc độ tải trang đáng kể...',
            content: 'Hiệu suất website là yếu tố quan trọng ảnh hưởng đến trải nghiệm người dùng...',
            author: 'Lê Văn Hùng',
            date: '2024-01-10',
            readTime: '6 phút',
            views: 756,
            category: 'tips',
            tags: ['JavaScript', 'Performance', 'Optimization', 'Web'],
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            featured: false,
            trending: false,
        },
        {
            id: 4,
            title: 'Tương lai của AI trong phát triển phần mềm',
            excerpt: 'Khám phá cách AI đang thay đổi cách chúng ta phát triển phần mềm và những cơ hội mới...',
            content: 'Trí tuệ nhân tạo đang ngày càng đóng vai trò quan trọng trong phát triển phần mềm...',
            author: 'Nguyễn Ngọc Lâm',
            date: '2024-01-08',
            readTime: '7 phút',
            views: 1100,
            category: 'technology',
            tags: ['AI', 'Machine Learning', 'Software Development', 'Future'],
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            featured: true,
            trending: false,
        },
        {
            id: 5,
            title: 'Lộ trình trở thành Full-stack Developer trong 6 tháng',
            excerpt: 'Kế hoạch học tập chi tiết để trở thành Full-stack Developer từ con số 0 trong 6 tháng...',
            content: 'Trở thành Full-stack Developer là mục tiêu của nhiều người học lập trình...',
            author: 'Trần Thị Minh',
            date: '2024-01-05',
            readTime: '10 phút',
            views: 1450,
            category: 'career',
            tags: ['Full-stack', 'Career', 'Learning Path', 'Development'],
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            featured: false,
            trending: true,
        },
        {
            id: 6,
            title: 'Cách chọn framework phù hợp cho dự án của bạn',
            excerpt: 'Hướng dẫn chi tiết về cách lựa chọn framework phù hợp dựa trên nhu cầu và mục tiêu dự án...',
            content: 'Việc lựa chọn framework phù hợp là một quyết định quan trọng trong phát triển dự án...',
            author: 'Lê Văn Hùng',
            date: '2024-01-03',
            readTime: '9 phút',
            views: 890,
            category: 'programming',
            tags: ['Framework', 'Decision Making', 'Project Management', 'Tools'],
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            featured: false,
            trending: false,
        },
    ]

    const filteredNews = newsData.filter(news => {
        const matchesSearch =
            news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            news.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            news.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const featuredNews = newsData.filter(news => news.featured)
    const trendingNews = newsData.filter(news => news.trending)

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-700 to-orange-600 py-20 text-white">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center">
                        <Badge className="mb-4 border-white/30 bg-white/20 text-white">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Tin tức & Blog
                        </Badge>
                        <h1 className="mb-6 text-4xl font-bold md:text-6xl">Tin Tức Lập Trình</h1>
                        <p className="mx-auto mb-8 max-w-3xl text-xl opacity-90 md:text-2xl">
                            Cập nhật những xu hướng, mẹo hay và kiến thức mới nhất trong lập trình
                        </p>
                    </div>
                </div>
            </section>

            {/* Search and Filter Section */}
            <section className="border-b bg-white py-8">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="max-w-md flex-1">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm tin tức..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-48">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured News */}
            {featuredNews.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="mb-8 flex items-center gap-2">
                            <Star className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Tin nổi bật</h2>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2">
                            {featuredNews.map(news => (
                                <Card key={news.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                                    <div className="relative">
                                        <img
                                            src={news.image}
                                            alt={news.title}
                                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-yellow-500 text-white">
                                                <Star className="mr-1 h-3 w-3" />
                                                Nổi bật
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {news.author}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(news.date)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {news.readTime}
                                            </div>
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                                            {news.title}
                                        </h3>
                                        <p className="mb-4 line-clamp-3 text-gray-600">{news.excerpt}</p>
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {news.tags.slice(0, 3).map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    <Tag className="mr-1 h-3 w-3" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Eye className="h-4 w-4" />
                                                {news.views.toLocaleString()} lượt xem
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="group-hover:bg-blue-50"
                                                onClick={() => navigate({ to: `/news/${news.id}` })}
                                            >
                                                Đọc thêm
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trending News */}
            {trendingNews.length > 0 && (
                <section className="bg-white py-16">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="mb-8 flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-orange-500" />
                            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Đang thịnh hành</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {trendingNews.slice(0, 3).map(news => (
                                <Card
                                    key={news.id}
                                    className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                                    onClick={() => navigate({ to: `/news/${news.id}` })}
                                >
                                    <div className="relative">
                                        <img
                                            src={news.image}
                                            alt={news.title}
                                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-orange-500 text-white">
                                                <TrendingUp className="mr-1 h-3 w-3" />
                                                Trending
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="mb-2 line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                                            {news.title}
                                        </h3>
                                        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{news.excerpt}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatDate(news.date)}</span>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {news.views}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All News */}
            <section className="py-16">
                <div className="container mx-auto max-w-7xl px-4">
                    <h2 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">Tất cả tin tức</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredNews.map(news => (
                            <Card
                                key={news.id}
                                className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                                onClick={() => navigate({ to: `/news/${news.id}` })}
                            >
                                <div className="relative">
                                    <img
                                        src={news.image}
                                        alt={news.title}
                                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-blue-700 text-white">
                                            {categories.find(cat => cat.value === news.category)?.label}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {news.author}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(news.date)}
                                        </div>
                                    </div>
                                    <h3 className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                                        {news.title}
                                    </h3>
                                    <p className="mb-4 line-clamp-3 text-gray-600">{news.excerpt}</p>
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {news.tags.slice(0, 2).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {news.readTime}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                {news.views}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    // Handle like
                                                }}
                                            >
                                                <Heart className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    // Handle share
                                                }}
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredNews.length === 0 && (
                        <div className="py-12 text-center">
                            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-600">Không tìm thấy tin tức</h3>
                            <p className="text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-gradient-to-r from-blue-700 to-orange-600 py-16 text-white">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="mb-4 text-3xl font-bold">Đăng ký nhận tin tức</h2>
                    <p className="mb-8 text-xl opacity-90">
                        Nhận những tin tức và bài viết mới nhất về lập trình ngay trong hộp thư của bạn
                    </p>
                    <div className="mx-auto flex max-w-md flex-col gap-4 md:flex-row">
                        <Input
                            placeholder="Nhập email của bạn"
                            className="border-white/30 bg-white/10 text-white placeholder:text-white/70"
                        />
                        <Button className="bg-white text-blue-700 hover:bg-gray-100">Đăng ký</Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default News
