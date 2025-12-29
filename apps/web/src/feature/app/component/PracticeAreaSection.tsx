import { Button } from '@workspace/ui/components/Button'
import { Award, BookOpen, Code, Database, Globe, GraduationCap, Smartphone, Users } from 'lucide-react'

const services = [
    {
        icon: <Code className="mb-4 h-12 w-12 text-blue-500" />,
        title: 'Lập trình Web',
        desc: 'Khóa học lập trình web từ cơ bản đến nâng cao với HTML, CSS, JavaScript, React, Node.js',
    },
    {
        icon: <Smartphone className="mb-4 h-12 w-12 text-green-500" />,
        title: 'Lập trình Mobile',
        desc: 'Học phát triển ứng dụng di động với React Native, Flutter cho iOS và Android',
    },
    {
        icon: <Database className="mb-4 h-12 w-12 text-orange-500" />,
        title: 'Lập trình Backend',
        desc: 'Khóa học phát triển backend với Node.js, Python, Java và các công nghệ database',
    },
    {
        icon: <BookOpen className="mb-4 h-12 w-12 text-purple-500" />,
        title: 'Khóa học Online',
        desc: 'Hệ thống học trực tuyến với video bài giảng, bài tập thực hành và chứng chỉ được công nhận',
    },
    {
        icon: <Users className="mb-4 h-12 w-12 text-indigo-500" />,
        title: 'Khóa học Offline',
        desc: 'Lớp học trực tiếp tại trung tâm với giảng viên chuyên nghiệp và thiết bị hiện đại',
    },
    {
        icon: <GraduationCap className="mb-4 h-12 w-12 text-red-500" />,
        title: 'Data Science & AI',
        desc: 'Khóa học khoa học dữ liệu, machine learning và trí tuệ nhân tạo với Python',
    },
    {
        icon: <Award className="mb-4 h-12 w-12 text-cyan-500" />,
        title: 'DevOps & Cloud',
        desc: 'Học về DevOps, Docker, Kubernetes và triển khai ứng dụng trên cloud platforms',
    },
    {
        icon: <Globe className="mb-4 h-12 w-12 text-yellow-500" />,
        title: 'Tư vấn & Mentorship',
        desc: 'Dịch vụ tư vấn chọn khóa học và mentoring 1-1 với chuyên gia lập trình',
    },
]

const PracticeAreaSection: React.FC = () => {
    return (
        <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-20">
            <div className="container mx-auto max-w-7xl px-10">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-white">Khóa học & Dịch vụ Đào tạo Lập trình</h2>
                    <p className="mx-auto max-w-3xl text-xl text-gray-300">
                        Bithub Learning cung cấp đầy đủ các khóa học lập trình từ cơ bản đến nâng cao với chất lượng cao
                        và phương pháp giảng dạy hiện đại
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-12 text-center sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service, idx) => (
                        <div key={idx} className="group flex flex-col items-center">
                            <div className="mb-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20">
                                {service.icon}
                            </div>
                            <h3 className="mb-3 text-lg font-bold text-white transition-colors group-hover:text-blue-300">
                                {service.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-300">{service.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button variant={'outline'} className="px-8 py-4 text-lg">
                        Xem tất cả khóa học
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default PracticeAreaSection
