import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Checkbox } from '@workspace/ui/components/Checkbox'
import { Input } from '@workspace/ui/components/Input'
import { Label } from '@workspace/ui/components/label'
import { Radio, RadioGroup } from '@workspace/ui/components/RadioGroup'
import { ArrowLeft, Download, Eye, FileText, Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'

export default function GenerateExam() {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const matrixId = (params as any).id ? Number((params as any).id) : undefined
    const queryClient = useQueryClient()
    const { userInfo } = useSelector(selectAuthStateInfo)
    const userId = userInfo?.id

    const [examName, setExamName] = useState('')
    const [examCode, setExamCode] = useState('')
    const [shuffleOptions, setShuffleOptions] = useState(true)
    const [questionSource, setQuestionSource] = useState<'system' | 'user'>('system')
    const [generatedExamId, setGeneratedExamId] = useState<number | null>(null)

    // Load matrix data
    const { data: matrixData, isLoading: matrixLoading } = useQuery({
        ...apiClient.matrix.getMatrixById(matrixId!),
        enabled: !!matrixId,
    })

    // Load latest version
    const { data: latestVersion, isLoading: versionLoading } = useQuery({
        ...apiClient.matrix.getLatestVersion(matrixId!),
        enabled: !!matrixId,
    })

    // Load generated exam if exists
    const { data: examData, isLoading: examLoading } = useQuery({
        ...apiClient.exam.getExamById(generatedExamId!),
        enabled: !!generatedExamId,
    })

    // Generate exam mutation - dynamically choose API based on questionSource
    const generateMutation = useMutation({
        mutationFn: async (payload: any) => {
            if (questionSource === 'user') {
                // Use generateExamFromUserQuestions API
                const response = await apiClient.exam.generateExamFromUserQuestions().mutationFn(payload)
                return response
            } else {
                // Use default generateExam API
                const response = await apiClient.exam.generateExam().mutationFn(payload)
                return response
            }
        },
        onSuccess: data => {
            console.log('[GenerateExam] Success response:', data)
            setGeneratedExamId(data.id)
            queryClient.invalidateQueries({ queryKey: ['exams'] })
            alert('Đề thi đã được tạo thành công!')
        },
        onError: (error: any) => {
            console.error('[GenerateExam] Error:', error)
            console.error('[GenerateExam] Error response:', error.response?.data)
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định'
            alert(`Lỗi khi tạo đề thi: ${errorMessage}`)
        },
    })

    // Download mutation
    const handleDownload = async (format: 'pdf' | 'docx') => {
        if (!generatedExamId) {
            alert('Chưa có đề thi để tải xuống')
            return
        }

        try {
            const blob = await queryClient.fetchQuery(apiClient.exam.downloadExam(generatedExamId, format))

            // Create download link
            const url = window.URL.createObjectURL(blob as Blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${examData?.name || 'exam'}.${format === 'pdf' ? 'pdf' : 'docx'}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error: any) {
            alert(`Lỗi khi tải xuống: ${error.message}`)
        }
    }

    const handleGenerate = () => {
        if (!latestVersion) {
            alert('Không tìm thấy version của ma trận')
            return
        }

        if (!examName || !examCode) {
            alert('Vui lòng nhập tên và mã đề thi')
            return
        }

        // Build payload based on question source
        let payload: any = {
            matrixVersionId: latestVersion.id,
            name: examName,
            code: examCode,
            shuffleOptions,
        }

        // If user questions, add createdBy field
        if (questionSource === 'user') {
            if (!userId) {
                alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
                return
            }
            payload.createdBy = userId
        }

        console.log('[GenerateExam] Sending request:', { source: questionSource, payload })
        generateMutation.mutate(payload)
    }

    const handleViewFullExam = () => {
        if (!generatedExamId) {
            alert('Chưa có đề thi để xem')
            return
        }
        // Navigate to exam detail page
        navigate({ to: `/exams/${generatedExamId}` as any })
    }

    const getLevelBadgeColor = (level: string) => {
        switch (level) {
            case 'EASY':
                return 'bg-green-500'
            case 'MEDIUM':
                return 'bg-blue-500'
            case 'HARD':
                return 'bg-orange-500'
            default:
                return 'bg-gray-500'
        }
    }

    if (matrixLoading || versionLoading) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="text-center">Đang tải...</div>
            </div>
        )
    }

    if (!matrixData || !latestVersion) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="text-center text-red-500">Không tìm thấy ma trận hoặc version</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate({ to: '/matrices' })} className="mb-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <h1 className="mb-2 text-4xl font-bold">Generate đề thi</h1>
                <p className="text-muted-foreground">
                    Tự động tạo đề thi từ ma trận: <span className="font-semibold">{matrixData.name}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column - Settings */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Matrix Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin ma trận</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Môn học:</span>
                                <span className="font-medium">{matrixData.subject.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Mã môn:</span>
                                <span className="font-medium">{matrixData.subject.code}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Version:</span>
                                <span className="font-medium">
                                    v{latestVersion.versionNo} - {latestVersion.name}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tổng điểm:</span>
                                <span className="font-medium">{matrixData.totalScore}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Thời gian:</span>
                                <span className="font-medium">{matrixData.duration} phút</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generation Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                <CardTitle>Cài đặt tạo đề</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="examName">Tên đề thi</Label>
                                <Input
                                    id="examName"
                                    placeholder="VD: Đề thi HK1 - Đề số 1"
                                    value={examName}
                                    onChange={e => setExamName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="examCode">Mã đề thi</Label>
                                <Input
                                    id="examCode"
                                    placeholder="VD: DE-TOAN-10-HK1-01"
                                    value={examCode}
                                    onChange={e => setExamCode(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3 border-t pt-4">
                                <Label>Nguồn câu hỏi</Label>
                                <RadioGroup
                                    value={questionSource}
                                    onChange={(value: string) => setQuestionSource(value as 'system' | 'user')}
                                    aria-label="Chọn nguồn câu hỏi"
                                >
                                    <Radio value="system">
                                        <span className="text-sm">
                                            Câu hỏi hệ thống (tất cả câu hỏi trong ngân hàng)
                                        </span>
                                    </Radio>
                                    <Radio value="user">
                                        <span className="text-sm">Câu hỏi của tôi (chỉ câu hỏi do tôi tạo)</span>
                                    </Radio>
                                </RadioGroup>
                            </div>

                            <div className="space-y-3 border-t pt-2">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="shuffleOptions"
                                        isSelected={shuffleOptions}
                                        onChange={(isSelected: boolean) => {
                                            console.log('[GenerateExam] Shuffle options changed:', isSelected)
                                            setShuffleOptions(isSelected)
                                        }}
                                    />
                                    <Label htmlFor="shuffleOptions" className="cursor-pointer text-sm">
                                        Xáo trộn thứ tự đáp án
                                    </Label>
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                isDisabled={generateMutation.isPending}
                                className="mt-4 w-full gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                {generateMutation.isPending ? 'Đang tạo đề...' : 'Tạo đề thi'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Preview */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Xem trước đề thi</CardTitle>
                                    <CardDescription>
                                        {examData
                                            ? `Đã tạo ${examData.examQuestions.length} câu hỏi`
                                            : 'Nhấn "Tạo đề thi" để xem kết quả'}
                                    </CardDescription>
                                </div>
                                {examData && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={handleViewFullExam}
                                        >
                                            <Eye className="h-4 w-4" />
                                            Xem đầy đủ
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => handleDownload('pdf')}
                                        >
                                            <Download className="h-4 w-4" />
                                            PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => handleDownload('docx')}
                                        >
                                            <Download className="h-4 w-4" />
                                            Word
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {examLoading ? (
                                <div className="py-16 text-center">
                                    <p className="text-muted-foreground">Đang tải đề thi...</p>
                                </div>
                            ) : !examData ? (
                                <div className="py-16 text-center">
                                    <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                                    <h3 className="mb-2 text-lg font-semibold">Chưa có đề thi nào</h3>
                                    <p className="text-muted-foreground">
                                        Cấu hình các tùy chọn bên trái và nhấn "Tạo đề thi"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Exam Header */}
                                    <div className="border-b pb-4 text-center">
                                        <h2 className="mb-2 text-2xl font-bold">{examData.name}</h2>
                                        <p className="text-muted-foreground">
                                            Môn: {examData.subject.name} - Mã đề: {examData.code}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            Thời gian: {examData.durationInMinutes} phút | Tổng điểm:{' '}
                                            {examData.totalScore} điểm
                                        </p>
                                    </div>

                                    {/* Questions */}
                                    <div className="space-y-4">
                                        {examData.examQuestions.map((examQuestion, index) => (
                                            <div key={examQuestion.id} className="rounded-lg border p-4">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="mb-1 font-medium">
                                                            <span className="font-bold">
                                                                Câu {examQuestion.questionNo}:
                                                            </span>{' '}
                                                            {examQuestion.question.content}
                                                        </p>
                                                        <div className="text-muted-foreground flex gap-2 text-sm">
                                                            <span>{examQuestion.score} điểm</span>
                                                            <span>•</span>
                                                            <span>{examQuestion.question.questionType}</span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={getLevelBadgeColor(
                                                            examQuestion.question.questionLevel,
                                                        )}
                                                    >
                                                        {examQuestion.question.questionLevel}
                                                    </Badge>
                                                </div>

                                                {/* Options for MCQ */}
                                                {examQuestion.question.questionType === 'MCQ' &&
                                                    examQuestion.question.options.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            {examQuestion.question.options.map(option => (
                                                                <div key={option.id} className="flex items-start gap-2">
                                                                    <span className="font-medium">{option.label}.</span>
                                                                    <span
                                                                        className={
                                                                            option.isCorrect
                                                                                ? 'font-medium text-green-600'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {option.content}
                                                                        {option.isCorrect && ' ✓'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                {/* Canonical Answer */}
                                                {examQuestion.question.canonicalAnswer && (
                                                    <div className="mt-3 rounded border-t bg-green-50 p-3 pt-3">
                                                        <p className="text-sm">
                                                            <span className="font-semibold text-green-700">
                                                                Đáp án:
                                                            </span>{' '}
                                                            {examQuestion.question.canonicalAnswer}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary */}
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="rounded bg-blue-50 p-3">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {examData.examQuestions.length}
                                                </div>
                                                <div className="text-muted-foreground text-xs">Câu hỏi</div>
                                            </div>
                                            <div className="rounded bg-green-50 p-3">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {examData.totalScore}
                                                </div>
                                                <div className="text-muted-foreground text-xs">Tổng điểm</div>
                                            </div>
                                            <div className="rounded bg-purple-50 p-3">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {examData.durationInMinutes}
                                                </div>
                                                <div className="text-muted-foreground text-xs">Phút</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
