import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EditQuestion() {
    const params = useParams({ strict: false })
    const questionId = (params as any).id ? Number((params as any).id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    console.log('[EditQuestion] Component loaded!')
    console.log('[EditQuestion] questionId:', questionId)
    console.log('[EditQuestion] params:', params)

    const [formData, setFormData] = useState({
        content: '',
        canonicalAnswer: '',
        questionType: 'MCQ' as 'MCQ' | 'ESSAY',
        questionLevel: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
        subjectId: 0,
        lessonId: 0,
    })

    // Fetch question data
    const {
        data: question,
        isLoading,
        error,
    } = useQuery({
        ...apiClient.question.getQuestionById(questionId!),
        enabled: !!questionId,
    })

    // Update mutation
    const updateMutation = useMutation({
        ...apiClient.question.updateQuestion(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question', questionId] })
            queryClient.invalidateQueries({ queryKey: ['questions'] })
            navigate({ to: `/questions/${questionId}` as any })
        },
    })

    // Populate form when data loads
    useEffect(() => {
        if (question) {
            setFormData({
                content: question.content || '',
                canonicalAnswer: question.canonicalAnswer || '',
                questionType: question.questionType || 'MCQ',
                questionLevel: question.questionLevel || 'EASY',
                subjectId: question.subject?.id || 0,
                lessonId: question.lesson?.id || 0,
            })
        }
    }, [question])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (questionId) {
            updateMutation.mutate({
                id: questionId,
                data: formData as any,
            })
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="text-center">Đang tải...</div>
            </div>
        )
    }

    if (error || !question) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="text-center text-red-500">Không tìm thấy câu hỏi</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link to={`/questions/${questionId}` as any}>
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại chi tiết
                    </Button>
                </Link>
                <h1 className="text-4xl font-bold">Chỉnh sửa câu hỏi</h1>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Thông tin câu hỏi</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Question Type */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">Loại câu hỏi</label>
                            <select
                                value={formData.questionType}
                                onChange={e => handleInputChange('questionType', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="MCQ">Trắc nghiệm</option>
                                <option value="ESSAY">Tự luận</option>
                            </select>
                        </div>

                        {/* Question Level */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">Độ khó</label>
                            <select
                                value={formData.questionLevel}
                                onChange={e => handleInputChange('questionLevel', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="EASY">Dễ</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="HARD">Khó</option>
                            </select>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">Nội dung câu hỏi *</label>
                            <textarea
                                value={formData.content}
                                onChange={e => handleInputChange('content', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Canonical Answer */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">Đáp án chi tiết *</label>
                            <textarea
                                value={formData.canonicalAnswer}
                                onChange={e => handleInputChange('canonicalAnswer', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                rows={6}
                                required
                            />
                        </div>

                        {/* Subject ID */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">ID Môn học</label>
                            <Input
                                type="number"
                                value={formData.subjectId}
                                onChange={e => handleInputChange('subjectId', Number(e.target.value))}
                            />
                        </div>

                        {/* Lesson ID */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">ID Bài học</label>
                            <Input
                                type="number"
                                value={formData.lessonId}
                                onChange={e => handleInputChange('lessonId', Number(e.target.value))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link to={`/questions/${questionId}` as any}>
                        <Button variant="outline" type="button">
                            Hủy
                        </Button>
                    </Link>
                    <Button type="submit" className="gap-2" isDisabled={updateMutation.isPending}>
                        <Save className="h-4 w-4" />
                        {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>

                {/* Error message */}
                {updateMutation.isError && (
                    <div className="mt-4 rounded-md bg-red-50 p-4 text-red-600">
                        Có lỗi xảy ra: {(updateMutation.error as any)?.message || 'Vui lòng thử lại'}
                    </div>
                )}
            </form>
        </div>
    )
}
