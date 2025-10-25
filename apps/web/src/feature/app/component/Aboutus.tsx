import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
import {
    Award,
    BookOpen,
    CheckCircle,
    Globe,
    GraduationCap,
    Heart,
    Lightbulb,
    Shield,
    Target,
    Users,
} from 'lucide-react'
import React from 'react'

const AboutUs: React.FC = () => {
    const stats = [
        { number: '500+', label: 'Học viên đã tốt nghiệp', icon: GraduationCap },
        { number: '10+', label: 'Khóa học chất lượng', icon: BookOpen },
        { number: '5+', label: 'Năm kinh nghiệm', icon: Award },
        { number: '95%', label: 'Tỷ lệ có việc làm', icon: Target },
    ]

    const values = [
        {
            icon: Lightbulb,
            title: 'Sáng tạo',
            description: 'Luôn cập nhật và áp dụng những công nghệ mới nhất trong giảng dạy',
        },
        {
            icon: Users,
            title: 'Cộng đồng',
            description: 'Xây dựng môi trường học tập thân thiện và hỗ trợ lẫn nhau',
        },
        {
            icon: Shield,
            title: 'Chất lượng',
            description: 'Cam kết mang đến những khóa học chất lượng cao và hiệu quả',
        },
        {
            icon: Heart,
            title: 'Tận tâm',
            description: 'Hỗ trợ học viên 24/7 và đồng hành cùng sự phát triển của bạn',
        },
    ]

    const achievements = [
        'Trung tâm đào tạo lập trình hàng đầu Việt Nam',
        'Đối tác chiến lược của các công ty công nghệ lớn',
        'Chứng nhận ISO 9001:2015 về chất lượng đào tạo',
        "Giải thưởng 'Trung tâm đào tạo xuất sắc' 3 năm liên tiếp",
    ]

    const team = [
        {
            name: 'Nguyễn Ngọc Lâm',
            role: 'Giám đốc & Giảng viên chính',
            experience: '8+ năm kinh nghiệm',
            avatar: 'NL',
            description:
                'Chuyên gia Full-stack Development với kinh nghiệm làm việc tại các công ty công nghệ hàng đầu',
        },
        {
            name: 'Trần Thị Minh',
            role: 'Giảng viên Frontend',
            experience: '5+ năm kinh nghiệm',
            avatar: 'TM',
            description: 'Chuyên gia React, Vue.js và UI/UX Design với nhiều dự án thành công',
        },
        {
            name: 'Lê Văn Hùng',
            role: 'Giảng viên Backend',
            experience: '6+ năm kinh nghiệm',
            avatar: 'LH',
            description:
                'Chuyên gia Node.js, Python và hệ thống phân tán với kinh nghiệm làm việc tại startup và enterprise',
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-700 to-orange-600 py-20 text-white">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center">
                        <Badge className="mb-4 border-white/30 bg-white/20 text-white">Về chúng tôi</Badge>
                        <h1 className="mb-6 text-4xl font-bold md:text-6xl">BITHUB LEARNING</h1>
                        <p className="mx-auto mb-8 max-w-3xl text-xl opacity-90 md:text-2xl">
                            Nơi ước mơ lập trình của bạn trở thành hiện thực
                        </p>
                        {/* <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-gray-100"
                onClick={() => window.location.href = "/courses"}
              >
                Xem khóa học
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = "/contact"}
              >
                Liên hệ ngay
              </Button>
            </div> */}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-orange-600">
                                    <stat.icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="mb-2 text-3xl font-bold text-gray-900">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Content */}
            <section className="py-20">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                                Câu chuyện của chúng tôi
                            </h2>
                            <div className="space-y-4 leading-relaxed text-gray-600">
                                <p>
                                    Bithub Learning được thành lập vào năm 2019 với sứ mệnh mang đến những khóa học lập
                                    trình chất lượng cao, giúp học viên có thể nắm vững kiến thức và kỹ năng cần thiết
                                    để trở thành những developer chuyên nghiệp.
                                </p>
                                <p>
                                    Với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại, chúng tôi
                                    đã đào tạo thành công hơn 1000 học viên, nhiều người trong số đó hiện đang làm việc
                                    tại các công ty công nghệ hàng đầu Việt Nam và thế giới.
                                </p>
                                <p>
                                    Chúng tôi tin rằng lập trình không chỉ là một nghề, mà còn là một nghệ thuật sáng
                                    tạo. Mỗi dòng code đều mang trong mình ý tưởng và ước mơ của người viết.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="BithubLearning Team"
                                className="w-full rounded-xl shadow-2xl"
                            />
                            <div className="absolute -right-6 -bottom-6 rounded-xl bg-white p-6 shadow-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-700">5+</div>
                                    <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Giá trị cốt lõi</h2>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Những giá trị mà chúng tôi luôn hướng tới và cam kết thực hiện
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center transition-shadow hover:shadow-lg">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-orange-600">
                                        <value.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">{value.title}</h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Đội ngũ của chúng tôi</h2>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Những chuyên gia giàu kinh nghiệm, tận tâm với sứ mệnh đào tạo
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {team.map((member, index) => (
                            <Card key={index} className="text-center transition-shadow hover:shadow-lg">
                                <CardContent className="p-6">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-orange-600 text-2xl font-bold text-white">
                                        {member.avatar}
                                    </div>
                                    <h3 className="mb-1 text-xl font-semibold text-gray-900">{member.name}</h3>
                                    <p className="mb-2 font-medium text-blue-700">{member.role}</p>
                                    <p className="mb-4 text-sm text-gray-600">{member.experience}</p>
                                    <p className="text-sm text-gray-600">{member.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Thành tựu nổi bật</h2>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Những dấu mốc quan trọng trong hành trình phát triển của chúng tôi
                        </p>
                    </div>
                    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-orange-50 p-6"
                            >
                                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                                <p className="font-medium text-gray-700">{achievement}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="bg-gradient-to-r from-blue-700 to-orange-600 py-20 text-white">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center">
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">Sứ mệnh của chúng tôi</h2>
                        <p className="mx-auto mb-8 max-w-4xl text-xl opacity-90">
                            "Mang đến những khóa học lập trình chất lượng cao, giúp học viên phát triển kỹ năng, mở rộng
                            cơ hội nghề nghiệp và góp phần xây dựng cộng đồng developer Việt Nam ngày càng mạnh mẽ."
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                className="bithub-button-secondary px-8 py-4 text-lg"
                                onClick={() => (window.location.href = '/courses')}
                            >
                                <BookOpen className="mr-2 h-5 w-5" />
                                Khám phá khóa học
                            </Button>
                            <Button
                                size="lg"
                                className="bithub-button-primary px-8 py-4 text-lg"
                                onClick={() => (window.location.href = '/contact')}
                            >
                                <Globe className="mr-2 h-5 w-5" />
                                Tham gia cộng đồng
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutUs
