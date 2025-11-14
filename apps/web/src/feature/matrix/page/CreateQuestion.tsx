import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'

export default function CreateQuestion() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        content: '',
        canonicalAnswer: '',
        questionType: 'MCQ' as 'MCQ' | 'ESSAY',
        questionLevel: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
        subjectId: 0,
        lessonId: 0,
    })

    // Create mutation
    const createMutation = useMutation({
        ...apiClient.question.createQuestion(),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['questions'] })
            navigate({ to: `/questions/${data.id}` as any })
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMutation.mutate(formData as any)
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link to={'/questions' as any}>
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </Button>
                </Link>
                <h1 className="text-4xl font-bold">Tạo câu hỏi mới</h1>
            </div>

            {/* Create Form */}
            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Thông tin câu hỏi</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Question Type */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Loại câu hỏi <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.questionType}
                                onChange={e => handleInputChange('questionType', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            >
                                <option value="MCQ">Trắc nghiệm</option>
                                <option value="ESSAY">Tự luận</option>
                            </select>
                        </div>

                        {/* Question Level */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Độ khó <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.questionLevel}
                                onChange={e => handleInputChange('questionLevel', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            >
                                <option value="EASY">Dễ</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="HARD">Khó</option>
                            </select>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Nội dung câu hỏi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={e => handleInputChange('content', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                rows={4}
                                placeholder="Nhập nội dung câu hỏi..."
                                required
                            />
                        </div>

                        {/* Canonical Answer */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Đáp án chi tiết <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.canonicalAnswer}
                                onChange={e => handleInputChange('canonicalAnswer', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                rows={6}
                                placeholder="Nhập đáp án chi tiết..."
                                required
                            />
                        </div>

                        {/* Subject ID */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                ID Môn học <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                value={formData.subjectId}
                                onChange={e => handleInputChange('subjectId', Number(e.target.value))}
                                placeholder="Nhập ID môn học"
                                required
                            />
                        </div>

                        {/* Lesson ID */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                ID Bài học <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                value={formData.lessonId}
                                onChange={e => handleInputChange('lessonId', Number(e.target.value))}
                                placeholder="Nhập ID bài học"
                                required
                            />
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Lưu ý:</strong> Sau khi tạo câu hỏi trắc nghiệm, bạn cần thêm các đáp án cho câu
                                hỏi.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link to={'/questions' as any}>
                        <Button variant="outline" type="button">
                            Hủy
                        </Button>
                    </Link>
                    <Button type="submit" className="gap-2" isDisabled={createMutation.isPending}>
                        <Plus className="h-4 w-4" />
                        {createMutation.isPending ? 'Đang tạo...' : 'Tạo câu hỏi'}
                    </Button>
                </div>

                {/* Error message */}
                {createMutation.isError && (
                    <div className="mt-4 rounded-md bg-red-50 p-4 text-red-600">
                        Có lỗi xảy ra: {(createMutation.error as any)?.message || 'Vui lòng thử lại'}
                    </div>
                )}

                {/* Success message */}
                {createMutation.isSuccess && (
                    <div className="mt-4 rounded-md bg-green-50 p-4 text-green-600">
                        Tạo câu hỏi thành công! Đang chuyển trang...
                    </div>
                )}
            </form>
        </div>
    )
}
