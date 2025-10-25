import { Button } from '@workspace/ui/components/Button'
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react'

const ContactSection: React.FC = () => {
    return (
        <section className="grid w-full md:grid-cols-2">
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-16">
                <div className="w-full max-w-xl text-center text-white">
                    <h2 className="mb-8 text-4xl font-bold tracking-tight">LIÊN HỆ TƯ VẤN</h2>
                    <p className="mb-8 text-xl opacity-90">
                        Bạn cần tư vấn về khóa học lập trình? <br />
                        Hãy liên hệ với Bithub Learning ngay!
                    </p>

                    <div className="mb-8 space-y-4 text-left">
                        <div className="flex items-center gap-3">
                            <div className="text-lg font-semibold">Nguyễn Ngọc Lâm</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm opacity-80">Giảng viên - Chuyên gia Lập trình</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-orange-300" />
                            <div>
                                <div className="font-semibold">Điện thoại:</div>
                                <div className="text-lg">0767.666.299</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-orange-300" />
                            <div>
                                <div className="font-semibold">Email:</div>
                                <div className="text-lg">bithubvn@gmail.com</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-orange-300" />
                            <div>
                                <div className="font-semibold">Địa chỉ:</div>
                                <div className="text-lg">929 Âu Cơ, Phường Tân Sơn Nhì, Hồ Chí Minh</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-orange-300" />
                            <div>
                                <div className="font-semibold">Website:</div>
                                <div className="text-lg">https://bithub.edu.vn</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            className="bithub-button-secondary px-8 py-4 text-lg"
                            onClick={() => (window.location.href = '/contact')}
                        >
                            TƯ VẤN MIỄN PHÍ <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            className="border-2 border-white bg-white px-8 py-3 text-blue-600 hover:bg-blue-100"
                            onClick={() => (window.location.href = '/offline-course')}
                        >
                            ĐĂNG KÝ KHÓA HỌC
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative h-full w-full">
                <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="BithubLearning Contact"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
                <div className="absolute right-8 bottom-8 left-8 rounded-xl bg-white/90 p-6 backdrop-blur-sm">
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">Dịch vụ của chúng tôi</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            <span>Khóa học Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                            <span>Khóa học Offline</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>Tư vấn khóa học</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <span>Mentorship 1-1</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
