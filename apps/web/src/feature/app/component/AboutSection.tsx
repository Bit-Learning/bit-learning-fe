import { Button } from '@workspace/ui/components/Button'
import { BookOpen, Code, GraduationCap, Users } from 'lucide-react'
import React from 'react'

const AboutSection: React.FC = () => {
    return (
        <section className="container mx-auto flex max-w-7xl flex-col gap-10 py-20">
            <div className="container mx-auto flex flex-col items-center gap-10 px-4 md:flex-row">
                <div className="flex w-full justify-center md:w-1/2">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                            alt="BithubLearning Team"
                            className="h-auto max-w-full rounded-xl shadow-2xl"
                        />
                        <div className="absolute -right-6 -bottom-6 rounded-lg bg-gradient-to-r from-blue-700 to-orange-600 p-4 text-white shadow-lg">
                            <div className="text-center">
                                <div className="text-2xl font-bold">5+</div>
                                <div className="text-sm">Năm kinh nghiệm</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <div className="mr-2 mb-4 flex flex-col border-l-4 border-blue-700 pl-6">
                        <p className="text-lg leading-relaxed font-medium tracking-wide text-gray-600">
                            Trung tâm đào tạo lập trình hàng đầu Việt Nam
                        </p>
                        <h2 className="text-3xl font-bold text-gray-900">
                            BITHUB LEARNING - NƠI ƯỚC MƠ LẬP TRÌNH THÀNH HIỆN THỰC
                        </h2>
                    </div>
                    <p className="mx-2 mt-8 mb-6 text-base leading-relaxed tracking-wide text-gray-600">
                        Bithub Learning là trung tâm đào tạo lập trình hàng đầu với hơn 5 năm kinh nghiệm. Chúng tôi
                        chuyên cung cấp các khóa học lập trình chất lượng cao từ cơ bản đến nâng cao, giúp học viên trở
                        thành developer chuyên nghiệp với các công nghệ mới nhất.
                    </p>

                    <div className="mx-2 mb-6 rounded-lg bg-blue-50 p-6">
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-orange-600 text-lg font-bold text-white">
                                NL
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Nguyễn Ngọc Lâm</h3>
                                <p className="text-gray-600">Giảng viên - Chuyên gia Lập trình</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Với kinh nghiệm giảng dạy và phát triển phần mềm, chúng tôi cam kết mang đến những khóa học
                            lập trình chất lượng cao và hỗ trợ học viên 24/7.
                        </p>
                    </div>

                    <div className="mx-2 my-8 flex flex-wrap gap-8">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-blue-100 p-3">
                                <Code className="h-6 w-6 text-blue-700" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">Lập trình</span>
                                <span className="text-sm text-gray-600">Chuyên nghiệp</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-orange-100 p-3">
                                <BookOpen className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">Khóa học</span>
                                <span className="text-sm text-gray-600">Chất lượng cao</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-green-100 p-3">
                                <GraduationCap className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">Chứng chỉ</span>
                                <span className="text-sm text-gray-600">Được công nhận</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-purple-100 p-3">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">Cộng đồng</span>
                                <span className="text-sm text-gray-600">Sôi nổi</span>
                            </div>
                        </div>
                    </div>
                    <div className="mx-2 flex gap-4">
                        <Button className="bithub-button-primary" onClick={() => (window.location.href = '/about')}>
                            TÌM HIỂU THÊM
                        </Button>
                        <Button className="bithub-button-secondary" onClick={() => (window.location.href = '/courses')}>
                            XEM KHÓA HỌC
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
