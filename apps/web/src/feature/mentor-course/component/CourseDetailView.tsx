import { useCourseDetail } from '@/feature/course/queries/useCourse'
import { useSectionsByCourse } from '@/feature/lecture/queries/useSection'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'
import { Input } from '@workspace/ui/components/Input'
import { Textarea } from '@workspace/ui/components/Textarea'
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Edit,
    Eye,
    FileText,
    GripVertical,
    HelpCircle,
    Plus,
    Trash2,
    Video,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateSection, useDeleteSection } from '../queries/useSection'
import { CreateLectureModal } from './CreateLectureModal'

interface CourseDetailViewProps {
    courseId: number
}

export const CourseDetailView = ({ courseId }: CourseDetailViewProps) => {
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
    const [isAddingSection, setIsAddingSection] = useState(false)
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)

    const { data: course, isLoading: courseLoading } = useCourseDetail(courseId)
    const { data: sections, isLoading: sectionsLoading } = useSectionsByCourse(courseId)
    const createSectionMutation = useCreateSection()
    const deleteSectionMutation = useDeleteSection()

    const sectionForm = useForm<{ title: string; description: string }>({
        defaultValues: { title: '', description: '' },
    })

    const toggleSection = (sectionId: number) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId)
        } else {
            newExpanded.add(sectionId)
        }
        setExpandedSections(newExpanded)
    }

    const handleCreateSection = async (data: { title: string; description: string }) => {
        try {
            await createSectionMutation.mutateAsync({
                courseId,
                title: data.title,
                description: data.description,
                isPublished: true,
                orderIndex: (sections?.length || 0) + 1,
            })
            sectionForm.reset()
            setIsAddingSection(false)
        } catch (error) {
            console.error('Failed to create section:', error)
        }
    }

    const handleDeleteSection = (sectionId: number) => {
        if (confirm('Bạn có chắc muốn xóa chương này?')) {
            deleteSectionMutation.mutate(sectionId)
        }
    }

    if (courseLoading) {
        return (
            <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
        )
    }

    if (!course) {
        return (
            <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold">Không tìm thấy khóa học</h3>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Link to="/mentor/course/list">
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
            </Link>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <p className="mt-1 text-gray-600">{course.subtitle}</p>
                    </div>
                </div>
            </div>

            <Card className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                        <p className="text-sm text-gray-600">Giá</p>
                        <p className="text-xl font-bold text-blue-600">
                            {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} ₫`}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Cấp độ</p>
                        <p className="font-semibold">{course.level}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Khối lớp</p>
                        <p className="font-semibold">Lớp {course.grade}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Ngôn ngữ</p>
                        <p className="font-semibold">{course.language}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Nội dung khóa học</h2>
                </div>

                <div className="mb-4">
                    {!isAddingSection ? (
                        <Button onClick={() => setIsAddingSection(true)} variant="outline" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm chương mới
                        </Button>
                    ) : (
                        <Card className="border-2 border-blue-400 p-4">
                            <Form {...sectionForm}>
                                <form onSubmit={sectionForm.handleSubmit(handleCreateSection)} className="space-y-4">
                                    <FormField
                                        control={sectionForm.control}
                                        name="title"
                                        rules={{
                                            required: 'Tên chương là bắt buộc',
                                            maxLength: { value: 100, message: 'Tối đa 100 ký tự' },
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên chương *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="VD: Chương 1: Giới thiệu"
                                                        autoFocus
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={sectionForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mô tả</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={2}
                                                        placeholder="Mô tả chương (tùy chọn)"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" isDisabled={createSectionMutation.isPending}>
                                            {createSectionMutation.isPending ? 'Đang thêm...' : 'Thêm chương'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsAddingSection(false)
                                                sectionForm.reset()
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </Card>
                    )}
                </div>

                <div className="space-y-3">
                    {sectionsLoading ? (
                        <p className="py-8 text-center text-gray-600">Đang tải chương...</p>
                    ) : !sections || sections.length === 0 ? (
                        <div className="py-8 text-center text-gray-600">
                            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <p className="mb-2 text-lg font-medium">Chưa có chương nào</p>
                            <p className="text-sm">Hãy thêm chương đầu tiên để bắt đầu!</p>
                        </div>
                    ) : (
                        sections.map((section, index) => (
                            <Card key={section.id} className="overflow-hidden border-l-4 border-l-blue-500">
                                <div
                                    className="flex cursor-pointer items-center justify-between bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <div className="flex flex-1 items-center gap-3">
                                        <GripVertical className="h-5 w-5 cursor-move text-gray-400" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">
                                                    Chương {index + 1}: {section.title}
                                                </h3>
                                                <Badge variant={section.isPublished ? 'secondary' : 'default'}>
                                                    {section.isPublished ? 'Công khai' : 'Riêng tư'}
                                                </Badge>
                                            </div>
                                            {section.description && (
                                                <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                                            )}
                                            <p className="mt-2 text-xs text-gray-500">
                                                {section.lectures?.length || 0} bài học
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={e => {
                                                e.stopPropagation()
                                                handleDeleteSection(section.id)
                                            }}
                                            isDisabled={deleteSectionMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                        {expandedSections.has(section.id) ? (
                                            <ChevronUp className="h-5 w-5 text-gray-600" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-600" />
                                        )}
                                    </div>
                                </div>

                                {expandedSections.has(section.id) && (
                                    <div className="space-y-3 border-t bg-white p-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setSelectedSectionId(section.id)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm bài học
                                        </Button>

                                        {!section.lectures || section.lectures.length === 0 ? (
                                            <p className="py-6 text-center text-sm text-gray-500">
                                                Chưa có bài học nào. Click "Thêm bài học" để bắt đầu.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {section.lectures.map((lecture, lIdx) => (
                                                    <div
                                                        key={lecture.id}
                                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {lecture.type === 'VIDEO' ? (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                                    <Video className="h-5 w-5 text-blue-600" />
                                                                </div>
                                                            ) : lecture.type === 'TEXT' ? (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                                                    <FileText className="h-5 w-5 text-green-600" />
                                                                </div>
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                                                    <HelpCircle className="h-5 w-5 text-purple-600" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium">
                                                                    Bài {lIdx + 1}: {lecture.title}
                                                                </p>
                                                                {lecture.description && (
                                                                    <p className="mt-0.5 text-sm text-gray-600">
                                                                        {lecture.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                <Eye className="mr-1 h-4 w-3" />
                                                                Xem chi tiết
                                                            </Badge>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="sm">
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </Card>

            {selectedSectionId && (
                <CreateLectureModal
                    courseId={courseId}
                    sectionId={selectedSectionId}
                    onClose={() => setSelectedSectionId(null)}
                />
            )}
        </div>
    )
}
