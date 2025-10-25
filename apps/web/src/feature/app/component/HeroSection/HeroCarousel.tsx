import { Button } from '@workspace/ui/components/Button'
import { BookOpen, ChevronLeft, ChevronRight, Code, GraduationCap, Laptop, Users } from 'lucide-react'
import { useState } from 'react'

interface HeroSlide {
    id: number
    icon: React.ReactNode
    title: string
    subtitle: string
    description: string
    buttonText: string
    buttonLink: string
}

const heroSlides: HeroSlide[] = [
    {
        id: 1,
        icon: <Code className="h-16 w-16 text-white" />,
        title: 'Học Lập Trình Từ Cơ Bản Đến Nâng Cao',
        subtitle: 'Khóa học lập trình chất lượng cao với phương pháp học hiện đại',
        description:
            'Bithub Learning cung cấp các khóa học lập trình từ cơ bản đến nâng cao, giúp bạn trở thành developer chuyên nghiệp với các công nghệ mới nhất.',
        buttonText: 'Xem khóa học',
        buttonLink: '/courses',
    },
    {
        id: 2,
        icon: <BookOpen className="h-16 w-16 text-green-600" />,
        title: 'Khóa Học Online & Offline Linh Hoạt',
        subtitle: 'Học trực tuyến mọi lúc mọi nơi hoặc tham gia lớp học offline',
        description:
            'Lựa chọn hình thức học phù hợp với bạn: học online với video bài giảng chất lượng hoặc tham gia lớp học offline với giảng viên trực tiếp.',
        buttonText: 'Đăng ký học',
        buttonLink: '/offline-course',
    },
    {
        id: 3,
        icon: <Users className="h-16 w-16 text-orange-500" />,
        title: 'Cộng Đồng Học Viên Sôi Nổi',
        subtitle: 'Tham gia cộng đồng lập trình viên lớn nhất Việt Nam',
        description:
            'Kết nối với hàng nghìn học viên khác, chia sẻ kiến thức, tham gia các sự kiện và workshop về công nghệ mới nhất.',
        buttonText: 'Tham gia cộng đồng',
        buttonLink: '/forum',
    },
    {
        id: 4,
        icon: <GraduationCap className="h-16 w-16 text-indigo-600" />,
        title: 'Chứng Chỉ Được Công Nhận',
        subtitle: 'Nhận chứng chỉ có giá trị và cơ hội việc làm cao',
        description:
            'Sau khi hoàn thành khóa học, bạn sẽ nhận được chứng chỉ được công nhận bởi các doanh nghiệp công nghệ hàng đầu Việt Nam.',
        buttonText: 'Xem chứng chỉ',
        buttonLink: '/certificates',
    },
    {
        id: 5,
        icon: <Laptop className="h-16 w-16 text-purple-600" />,
        title: 'Dự Án Thực Tế & Portfolio',
        subtitle: 'Xây dựng portfolio với các dự án thực tế trong khóa học',
        description:
            'Không chỉ học lý thuyết, bạn sẽ thực hành trên các dự án thực tế và xây dựng portfolio ấn tượng để tìm việc làm.',
        buttonText: 'Xem portfolio',
        buttonLink: '/student-portfolio',
    },
]

export const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)
    }

    const slide = heroSlides[currentSlide]!

    return (
        <div className="bithub-gradient relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/80 to-orange-600/70" />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white blur-3xl"></div>
                <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-orange-300 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-300 blur-3xl"></div>
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center">
                <div className="max-w-6xl px-6 py-20 text-center text-white">
                    <div className="mb-8 flex justify-center">{slide.icon}</div>

                    <h1 className="mb-6 leading-tight font-bold max-[776px]:text-4xl md:text-6xl">{slide.title}</h1>

                    <p className="mb-6 leading-relaxed font-medium opacity-90 md:text-2xl">{slide.subtitle}</p>

                    <p className="mx-auto mb-12 max-w-4xl leading-relaxed opacity-80 md:text-lg">{slide.description}</p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="bithub-button-secondary px-8 py-4 text-lg"
                            onClick={() => (window.location.href = slide.buttonLink)}
                        >
                            {slide.buttonText}
                        </Button>
                        <Button
                            size="lg"
                            className="bithub-button-primary px-8 py-4 text-lg"
                            onClick={() => (window.location.href = '/contact')}
                        >
                            Tư vấn miễn phí
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="group absolute top-1/2 left-6 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6 transition-transform group-hover:scale-110" />
            </button>

            <button
                onClick={nextSlide}
                className="group absolute top-1/2 right-6 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6 transition-transform group-hover:scale-110" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 transform space-x-3">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-3 w-3 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
