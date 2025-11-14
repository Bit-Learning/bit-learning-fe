import type { SyllabusDetailRequest } from '@workspace/lib/api/sdk/syllabus.type'
import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/Input'
import { Label } from '@workspace/ui/components/label'
import { toast } from '@workspace/ui/components/Sonner'
import { Textarea } from '@workspace/ui/components/Textarea'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Lesson {
    id: number
    name: string
    lessonNo: number
}

interface Props {
    lessons: Lesson[]
    value: SyllabusDetailRequest[]
    onChange: (details: SyllabusDetailRequest[]) => void
}

export function SyllabusDetailTable({ lessons, value, onChange }: Props) {
    const [details, setDetails] = useState<SyllabusDetailRequest[]>(value)
    const [selectedLessonId, setSelectedLessonId] = useState<string>('')

    const handleAddLesson = () => {
        if (!selectedLessonId) return

        const lessonId = Number(selectedLessonId)
        if (details.find(d => d.lessonId === lessonId)) {
            toast.warning({ title: 'Bài học này đã được thêm' })
            return
        }

        const newDetail: SyllabusDetailRequest = {
            lessonId,
            duration: 45,
            learningObjectives: '',
            materials: '',
            studentTasks: '',
        }

        const newDetails = [...details, newDetail]
        setDetails(newDetails)
        onChange(newDetails)
        setSelectedLessonId('')
    }

    const handleRemoveLesson = (index: number) => {
        const newDetails = details.filter((_, i) => i !== index)
        setDetails(newDetails)
        onChange(newDetails)
    }

    const handleChange = (index: number, field: keyof SyllabusDetailRequest, value: number | string) => {
        const newDetails = [...details]
        newDetails[index] = { ...newDetails[index], [field]: value } as SyllabusDetailRequest
        setDetails(newDetails)
        onChange(newDetails)
    }

    const availableLessons = lessons.filter(l => !details.find(d => d.lessonId === l.id))

    const calculateTotalDuration = () => {
        return details.reduce((sum, detail) => sum + (detail.duration || 0), 0)
    }

    return (
        <div className="space-y-6">
            {/* Lesson selector */}
            <div className="flex gap-2">
                <select
                    className="flex-1 rounded-md border px-3 py-2"
                    value={selectedLessonId}
                    onChange={e => setSelectedLessonId(e.target.value)}
                >
                    <option value="">-- Chọn bài học để thêm --</option>
                    {availableLessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>
                            Bài {lesson.lessonNo}: {lesson.name}
                        </option>
                    ))}
                </select>
                <Button type="button" onClick={handleAddLesson} isDisabled={!selectedLessonId} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm
                </Button>
            </div>

            {/* Detail cards */}
            {details.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                    Chưa có bài học nào. Vui lòng thêm bài học từ dropdown phía trên.
                </div>
            ) : (
                details.map((detail, index) => {
                    const lesson = lessons.find(l => l.id === detail.lessonId)

                    return (
                        <div key={index} className="rounded-lg border">
                            {/* Lesson header */}
                            <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                                <h3 className="text-lg font-medium">
                                    Bài {lesson?.lessonNo}: {lesson?.name}
                                </h3>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveLesson(index)}
                                    className="gap-2 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Xóa
                                </Button>
                            </div>

                            {/* Detail form */}
                            <div className="space-y-4 p-4">
                                {/* Duration */}
                                <div className="space-y-2">
                                    <Label htmlFor={`duration-${index}`}>
                                        Thời lượng (phút) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id={`duration-${index}`}
                                        type="number"
                                        min="0"
                                        placeholder="VD: 45, 90"
                                        value={detail.duration}
                                        onChange={e => handleChange(index, 'duration', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                {/* Learning Objectives */}
                                <div className="space-y-2">
                                    <Label htmlFor={`objectives-${index}`}>
                                        Mục tiêu học tập <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id={`objectives-${index}`}
                                        placeholder="VD: - Hiểu khái niệm căn bậc hai&#10;- Tính được căn bậc hai của số dương&#10;- Áp dụng vào bài toán thực tế"
                                        value={detail.learningObjectives}
                                        onChange={e => handleChange(index, 'learningObjectives', e.target.value)}
                                        rows={4}
                                        required
                                    />
                                    <p className="text-sm text-gray-500">
                                        Mỗi mục tiêu nên bắt đầu bằng dấu gạch đầu dòng (-)
                                    </p>
                                </div>

                                {/* Materials */}
                                <div className="space-y-2">
                                    <Label htmlFor={`materials-${index}`}>
                                        Tài liệu <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id={`materials-${index}`}
                                        placeholder="VD: - SGK Toán 9 trang 10-15&#10;- Sách bài tập nâng cao&#10;- Video bài giảng trên YouTube"
                                        value={detail.materials}
                                        onChange={e => handleChange(index, 'materials', e.target.value)}
                                        rows={3}
                                        required
                                    />
                                    <p className="text-sm text-gray-500">
                                        Liệt kê các tài liệu tham khảo, sách giáo khoa, video, website...
                                    </p>
                                </div>

                                {/* Student Tasks */}
                                <div className="space-y-2">
                                    <Label htmlFor={`tasks-${index}`}>
                                        Nhiệm vụ học sinh <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id={`tasks-${index}`}
                                        placeholder="VD: - Làm bài tập 1-10 SGK&#10;- Đọc trước bài mới&#10;- Chuẩn bị thảo luận nhóm"
                                        value={detail.studentTasks}
                                        onChange={e => handleChange(index, 'studentTasks', e.target.value)}
                                        rows={3}
                                        required
                                    />
                                    <p className="text-sm text-gray-500">
                                        Các nhiệm vụ, bài tập học sinh cần hoàn thành sau bài học
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })
            )}

            {/* Summary */}
            {details.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex items-center justify-between text-lg">
                        <span className="font-medium">Tổng số bài học:</span>
                        <span className="font-bold text-blue-700">{details.length} bài</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-lg">
                        <span className="font-medium">Tổng thời lượng:</span>
                        <span className="font-bold text-blue-700">{calculateTotalDuration()} phút</span>
                    </div>
                </div>
            )}
        </div>
    )
}
