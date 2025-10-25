import { Checkbox } from '@radix-ui/react-checkbox'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Textarea } from '@workspace/ui/components/Textarea'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/update/select'
import { Award, BookOpen, Calendar, Clock, GraduationCap, MapPin, Star, Users } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface CourseOption {
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
}

const courseOptions: CourseOption[] = [
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
    },
]

const OfflineCourseForm: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        age: '',
        education: '',
        experience: '',
        motivation: '',
        preferredSchedule: '',
        agreeToTerms: false,
        agreeToMarketing: false,
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedCourse) {
            toast.error('Vui lòng chọn khóa học')
            return
        }

        if (!formData.agreeToTerms) {
            toast.error('Vui lòng đồng ý với điều khoản')
            return
        }

        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h.')
            setIsSubmitting(false)
            // Reset form
            setSelectedCourse('')
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                age: '',
                education: '',
                experience: '',
                motivation: '',
                preferredSchedule: '',
                agreeToTerms: false,
                agreeToMarketing: false,
            })
        }, 2000)
    }

    const selectedCourseData = courseOptions.find(course => course.id === selectedCourse)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="container mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="text-center">
                        <div className="mb-4 flex items-center justify-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-700 to-orange-600">
                                <span className="text-sm font-bold text-white">BL</span>
                            </div>
                            <span className="bithub-gradient-text text-xl font-bold">BithubLearning</span>
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Đăng Ký Khóa Học Offline</h1>
                        <p className="mx-auto max-w-2xl text-gray-600">
                            Tham gia các khóa học offline chất lượng cao với giảng viên chuyên nghiệp. Học trực tiếp,
                            tương tác và thực hành ngay tại lớp học.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Course Selection */}
                    <div className="lg:col-span-2">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    Chọn Khóa Học
                                </CardTitle>
                                <CardDescription>
                                    Chọn khóa học phù hợp với nhu cầu và lịch trình của bạn
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {courseOptions.map(course => (
                                        <div
                                            key={course.id}
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                                                selectedCourse === course.id
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                            onClick={() => setSelectedCourse(course.id)}
                                        >
                                            <div className="mb-3 flex items-start justify-between">
                                                <h3 className="font-semibold text-gray-900">{course.name}</h3>
                                                <Badge variant="secondary" className="text-xs">
                                                    {course.duration}
                                                </Badge>
                                            </div>

                                            <div className="mb-3 space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{course.schedule}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="truncate">{course.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Users className="h-4 w-4" />
                                                    <span>Tối đa {course.maxStudents} học viên</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                                                    <span>{course.rating}/5.0</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                {/* <div>
                          <span className="text-lg font-bold text-blue-600">{course.price}</span>
                          <span className="text-sm text-gray-500 line-through ml-2">{course.originalPrice}</span>
                        </div> */}
                                                <Badge variant="outline" className="text-xs">
                                                    {course.instructor}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Registration Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                    Thông Tin Đăng Ký
                                </CardTitle>
                                <CardDescription>Điền thông tin cá nhân để hoàn tất đăng ký khóa học</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="fullName">Họ và tên *</Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={e => handleInputChange('fullName', e.target.value)}
                                                placeholder="Nhập họ và tên đầy đủ"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={e => handleInputChange('email', e.target.value)}
                                                placeholder="example@email.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Số điện thoại *</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={e => handleInputChange('phone', e.target.value)}
                                                placeholder="0123456789"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="age">Tuổi</Label>
                                            <Input
                                                id="age"
                                                value={formData.age}
                                                onChange={e => handleInputChange('age', e.target.value)}
                                                placeholder="Tuổi của bạn"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="education">Trình độ học vấn</Label>
                                        <Select
                                            value={formData.education}
                                            onValueChange={value => handleInputChange('education', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trình độ học vấn" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high-school">Trung học phổ thông</SelectItem>
                                                <SelectItem value="college">Cao đẳng</SelectItem>
                                                <SelectItem value="university">Đại học</SelectItem>
                                                <SelectItem value="postgraduate">Sau đại học</SelectItem>
                                                <SelectItem value="other">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="experience">Kinh nghiệm lập trình</Label>
                                        <Select
                                            value={formData.experience}
                                            onValueChange={value => handleInputChange('experience', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn mức độ kinh nghiệm" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Mới bắt đầu</SelectItem>
                                                <SelectItem value="basic">Có kiến thức cơ bản</SelectItem>
                                                <SelectItem value="intermediate">Trung cấp</SelectItem>
                                                <SelectItem value="advanced">Nâng cao</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="motivation">Lý do đăng ký khóa học</Label>
                                        <Textarea
                                            id="motivation"
                                            value={formData.motivation}
                                            onChange={e => handleInputChange('motivation', e.target.value)}
                                            placeholder="Chia sẻ lý do bạn muốn tham gia khóa học này..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onCheckedChange={checked =>
                                                handleInputChange('agreeToTerms', checked as boolean)
                                            }
                                        />
                                        <Label htmlFor="agreeToTerms" className="text-sm">
                                            Tôi đồng ý với{' '}
                                            <Link to="/terms" className="text-blue-600 hover:underline">
                                                điều khoản
                                            </Link>{' '}
                                            và{' '}
                                            <Link to="/privacy" className="text-blue-600 hover:underline">
                                                chính sách bảo mật
                                            </Link>{' '}
                                            *
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="agreeToMarketing"
                                            checked={formData.agreeToMarketing}
                                            onCheckedChange={checked =>
                                                handleInputChange('agreeToMarketing', checked as boolean)
                                            }
                                        />
                                        <Label htmlFor="agreeToMarketing" className="text-sm">
                                            Tôi đồng ý nhận thông tin về các khóa học và sự kiện mới
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-800 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl"
                                        isDisabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Đang gửi...' : 'Đăng Ký Khóa Học'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course Details & Benefits */}
                    <div className="space-y-6">
                        {selectedCourseData && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-orange-600" />
                                        Chi Tiết Khóa Học
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                                {selectedCourseData.name}
                                            </h3>
                                            <p className="mb-3 text-sm text-gray-600">
                                                {selectedCourseData.description}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900">Nội dung khóa học:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCourseData.features.map((feature, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <h4 className="mb-2 font-medium text-blue-900">Thông tin lớp học:</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                    <span>{selectedCourseData.schedule}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-blue-600" />
                                                    <span>{selectedCourseData.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                    <span>Tối đa {selectedCourseData.maxStudents} học viên</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Lợi Ích Khóa Học
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Học trực tiếp</h4>
                                            <p className="text-sm text-gray-600">
                                                Tương tác trực tiếp với giảng viên và bạn học
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Thực hành ngay</h4>
                                            <p className="text-sm text-gray-600">
                                                Làm project thực tế trong suốt khóa học
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Chứng chỉ</h4>
                                            <p className="text-sm text-gray-600">
                                                Nhận chứng chỉ được công nhận sau khi hoàn thành
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Hỗ trợ sau khóa học</h4>
                                            <p className="text-sm text-gray-600">
                                                Tư vấn và hỗ trợ trong 6 tháng sau khóa học
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-red-500" />
                                    Địa Chỉ Lớp Học
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <h4 className="mb-1 font-medium text-gray-900">Trung tâm BithubLearning</h4>
                                        <p className="text-sm text-gray-600">
                                            62/22 Trương Công Định, Phường 14, Tân Bình, Hồ Chí Minh
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>• Gần chợ Tân Bình</p>
                                        <p>• Có bãi xe rộng rãi</p>
                                        <p>• Phòng học máy lạnh</p>
                                        <p>• Thiết bị hiện đại</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OfflineCourseForm
