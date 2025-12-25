import { useAppDispatch } from '@/shared/redux/store'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Label } from '@workspace/ui/components/label'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowLeft, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useCreateLectureQuiz } from '../queries/useLecture'
import { resetMLectureStateAction, selectCreateQuizContext } from '../stores/mlecture.store'
import type { CreateLectureQuizRequest } from '../types/mlecture.api'
import { QuestionCard } from './QuestionCard'

interface QuizFormData {
    title: string
    description: string
    passPercent: number
    maxAttempts: number
    questions: Array<{
        questionText: string
        orderIndex: number
        answers: Array<{
            answerText: string
            isCorrect: boolean
            orderIndex: number
        }>
    }>
}

export const CreateQuizForm = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const context = useSelector(selectCreateQuizContext)
    const createQuizMutation = useCreateLectureQuiz()

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<QuizFormData>({
        defaultValues: {
            title: '',
            description: '',
            passPercent: 0.8,
            maxAttempts: 3,
            questions: [
                {
                    questionText: '',
                    orderIndex: 1,
                    answers: [
                        { answerText: '', isCorrect: true, orderIndex: 1 },
                        { answerText: '', isCorrect: false, orderIndex: 2 },
                    ],
                },
            ],
        },
    })

    const {
        fields: questionFields,
        append: appendQuestion,
        remove: removeQuestion,
    } = useFieldArray({
        control,
        name: 'questions',
    })

    useEffect(() => {
        if (!context?.sectionId) {
            navigate({ to: '/mentor/course/list' })
        }
    }, [context, navigate])

    const handleFormSubmit = async (data: QuizFormData) => {
        if (!context?.sectionId) return

        const quizData: CreateLectureQuizRequest = {
            lecture: {
                sectionId: context.sectionId,
                title: data.title,
                description: data.description,
                isPreviewable: false,
                orderIndex: 1,
            },
            quizzes: data.questions.map(q => ({
                questionText: q.questionText,
                orderIndex: q.orderIndex,
                answers: q.answers,
            })),
            passPercent: data.passPercent,
            maxAttempts: data.maxAttempts,
        }

        try {
            await createQuizMutation.mutateAsync(quizData)
            dispatch(resetMLectureStateAction())
            navigate({ to: `/mentor/courses/${context.courseId}` })
        } catch (error) {
            console.error('Failed to create quiz:', error)
        }
    }

    const handleCancel = () => {
        dispatch(resetMLectureStateAction())
        if (context?.courseId) {
            navigate({ to: `/mentor/course/${context.courseId}` })
        } else {
            navigate({ to: '/mentor/course/list' })
        }
    }

    const addQuestion = () => {
        appendQuestion({
            questionText: '',
            orderIndex: questionFields.length + 1,
            answers: [
                { answerText: '', isCorrect: true, orderIndex: 1 },
                { answerText: '', isCorrect: false, orderIndex: 2 },
            ],
        })
    }

    if (!context?.sectionId) {
        return null
    }

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-6">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <h1 className="mt-4 text-3xl font-bold">Tạo bài kiểm tra mới</h1>
                <p className="mt-2 text-gray-600">Tạo bài kiểm tra với nhiều câu hỏi và đáp án</p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Thông tin bài học</h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Tên bài học *</Label>
                            <Input
                                id="title"
                                {...register('title', { required: 'Tên bài học là bắt buộc' })}
                                placeholder="VD: Bài kiểm tra chương 1"
                                className={cn(errors.title && 'border-red-500')}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description">Mô tả</Label>
                            <Input
                                id="description"
                                {...register('description')}
                                placeholder="Mô tả ngắn về bài kiểm tra"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="passPercent">Điểm đạt (%) *</Label>
                                <Input
                                    id="passPercent"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    {...register('passPercent', {
                                        required: 'Điểm đạt là bắt buộc',
                                        min: { value: 0, message: 'Tối thiểu 0' },
                                        max: { value: 1, message: 'Tối đa 1' },
                                        valueAsNumber: true,
                                    })}
                                    placeholder="0.8 (80%)"
                                    className={cn(errors.passPercent && 'border-red-500')}
                                />
                                {errors.passPercent && (
                                    <p className="mt-1 text-sm text-red-500">{errors.passPercent.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="maxAttempts">Số lần làm tối đa *</Label>
                                <Input
                                    id="maxAttempts"
                                    type="number"
                                    min="1"
                                    {...register('maxAttempts', {
                                        required: 'Số lần làm là bắt buộc',
                                        min: { value: 1, message: 'Tối thiểu 1 lần' },
                                        valueAsNumber: true,
                                    })}
                                    placeholder="3"
                                    className={cn(errors.maxAttempts && 'border-red-500')}
                                />
                                {errors.maxAttempts && (
                                    <p className="mt-1 text-sm text-red-500">{errors.maxAttempts.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Câu hỏi ({questionFields.length})</h3>
                        <Button type="button" onClick={addQuestion} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm câu hỏi
                        </Button>
                    </div>

                    {questionFields.map((question, questionIndex) => (
                        <QuestionCard
                            key={question.id}
                            questionIndex={questionIndex}
                            control={control}
                            register={register}
                            errors={errors}
                            onRemove={() => removeQuestion(questionIndex)}
                            canRemove={questionFields.length > 1}
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-3 border-t pt-6">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Hủy
                    </Button>
                    <Button type="submit" isDisabled={createQuizMutation.isPending}>
                        {createQuizMutation.isPending ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
