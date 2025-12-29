import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import { Button } from '@workspace/ui/components/Button'
import { BookOpen, Code, GraduationCap, Laptop, Users } from 'lucide-react'

interface HeroSlide {
    id: number
    icon: React.ReactNode
    title: string
    subtitle: string
    description: string
    buttonText: string
    buttonLink: string
    backgroundImage?: string
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
        backgroundImage: '/hero/hero_1.jpg',
    },
    {
        id: 2,
        icon: <BookOpen className="h-16 w-16 text-white" />,
        title: 'Khóa Học Online & Offline Linh Hoạt',
        subtitle: 'Học trực tuyến mọi lúc mọi nơi hoặc tham gia lớp học offline',
        description:
            'Lựa chọn hình thức học phù hợp với bạn: học online với video bài giảng chất lượng hoặc tham gia lớp học offline với giảng viên trực tiếp.',
        buttonText: 'Đăng ký học',
        buttonLink: '/offline-course',
        backgroundImage: '/hero/hero_2.jpg',
    },
    {
        id: 3,
        icon: <Users className="h-16 w-16 text-white" />,
        title: 'Cộng Đồng Học Viên Sôi Nổi',
        subtitle: 'Tham gia cộng đồng lập trình viên lớn nhất Việt Nam',
        description:
            'Kết nối với hàng nghìn học viên khác, chia sẻ kiến thức, tham gia các sự kiện và workshop về công nghệ mới nhất.',
        buttonText: 'Tham gia cộng đồng',
        buttonLink: '/forum',
        backgroundImage: '/hero/hero_3.jpg',
    },
    {
        id: 4,
        icon: <GraduationCap className="h-16 w-16 text-white" />,
        title: 'Chứng Chỉ Được Công Nhận',
        subtitle: 'Nhận chứng chỉ có giá trị và cơ hội việc làm cao',
        description:
            'Sau khi hoàn thành khóa học, bạn sẽ nhận được chứng chỉ được công nhận bởi các doanh nghiệp công nghệ hàng đầu Việt Nam.',
        buttonText: 'Xem chứng chỉ',
        buttonLink: '/certificates',
        backgroundImage: '/hero/hero_4.jpg',
    },
    {
        id: 5,
        icon: <Laptop className="h-16 w-16 text-white" />,
        title: 'Dự Án Thực Tế & Portfolio',
        subtitle: 'Xây dựng portfolio với các dự án thực tế trong khóa học',
        description:
            'Không chỉ học lý thuyết, bạn sẽ thực hành trên các dự án thực tế và xây dựng portfolio ấn tượng để tìm việc làm.',
        buttonText: 'Xem portfolio',
        buttonLink: '/student-portfolio',
        backgroundImage: '/hero/hero_5.jpg',
    },
]

const heroSplideOptions = {
    type: 'loop',
    perPage: 1,
    perMove: 1,
    pagination: true,
    arrows: false,
    autoplay: true,
    interval: 6000,
    pauseOnHover: true,
    speed: 800,
    rewind: true,
    easing: 'ease-in-out',
}

export const HeroCarousel = () => {
    return (
        <Splide options={heroSplideOptions} className="splide-hero">
            {heroSlides.map(slide => (
                <SplideSlide key={slide.id}>
                    <div className="bithub-gradient relative min-h-screen overflow-hidden">
                        {/* Background Image */}
                        {slide.backgroundImage && (
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                            />
                        )}

                        {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/80 to-orange-600/70" /> */}

                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-blue-700/70" />

                        <div className="relative z-10 flex min-h-screen items-center justify-center">
                            <div className="max-w-7xl px-6 py-10 text-center text-white">
                                <div className="mb-8 flex justify-center">{slide.icon}</div>

                                <h1 className="mb-6 font-bold leading-tight max-[776px]:text-4xl md:text-6xl">
                                    {slide.title}
                                </h1>

                                <p className="mb-6 font-medium leading-relaxed opacity-90 md:text-2xl">
                                    {slide.subtitle}
                                </p>

                                <p className="mx-auto mb-12 max-w-4xl leading-relaxed opacity-80 md:text-lg">
                                    {slide.description}
                                </p>

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
                    </div>
                </SplideSlide>
            ))}
        </Splide>
    )
}
