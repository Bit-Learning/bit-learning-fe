import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import type { MatrixDetailRequest } from '@workspace/lib/api/sdk/matrix.type'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Label } from '@workspace/ui/components/label'
import { toast } from '@workspace/ui/components/Sonner'
import { Textarea } from '@workspace/ui/components/Textarea'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MatrixDetailTable } from '../components/MatrixDetailTable'

export default function CreateMatrix() {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const matrixId = (params as any).id ? Number((params as any).id) : undefined
    const queryClient = useQueryClient()

    // Step control: 1 = Basic Info, 2 = Version Configuration
    const [step, setStep] = useState(1)
    const [createdMatrixId, setCreatedMatrixId] = useState<number | undefined>(matrixId)

    // Step 1: Matrix Basic Info
    const [matrixName, setMatrixName] = useState('')
    const [matrixCode, setMatrixCode] = useState('')
    const [subjectId, setSubjectId] = useState<number | undefined>()
    const [description, setDescription] = useState('')
    const [totalTime, setTotalTime] = useState(60)
    const [totalScore, setTotalScore] = useState(10)

    // Step 2: Version Info
    const [versionName, setVersionName] = useState('Version 1.0')
    const [versionNotes, setVersionNotes] = useState('Initial version')
    const [matrixDetails, setMatrixDetails] = useState<MatrixDetailRequest[]>([])

    // Load subjects for dropdown
    const { data: subjects } = useQuery(apiClient.subject.getAllSubjects())

    // Load chapters when subject is selected
    const { data: chapters } = useQuery({
        ...apiClient.chapter.getChaptersBySubject(subjectId!),
        enabled: !!subjectId,
    })

    // Load lessons from all chapters
    const { data: allLessons } = useQuery({
        queryKey: ['lessons', 'all', subjectId],
        queryFn: async () => {
            if (!chapters) return []
            const lessonPromises = chapters.map(chapter => apiClient.lesson.getLessonsByChapter(chapter.id).queryFn())
            const lessonArrays = await Promise.all(lessonPromises)
            return lessonArrays.flat()
        },
        enabled: !!chapters && chapters.length > 0,
    })

    // Load matrix data if editing
    const { data: matrixData } = useQuery({
        ...apiClient.matrix.getMatrixById(matrixId!),
        enabled: !!matrixId,
    })

    // Populate form when editing
    useEffect(() => {
        if (matrixData) {
            setMatrixName(matrixData.name)
            setMatrixCode(matrixData.code)
            setSubjectId(matrixData.subject.id)
            setDescription(matrixData.description || '')
            setTotalTime(matrixData.duration)
            setTotalScore(matrixData.totalScore)
            setCreatedMatrixId(matrixData.id)
        }
    }, [matrixData])

    // Step 1: Create Matrix
    const createMatrixMutation = useMutation({
        ...apiClient.matrix.createMatrix(),
        onSuccess: data => {
            setCreatedMatrixId(data.id)
            setStep(2)
        },
        onError: (error: any) => {
            toast.error({ title: 'Lỗi khi tạo ma trận', description: error.message })
        },
    })

    // Step 2: Create Version
    const createVersionMutation = useMutation({
        ...apiClient.matrix.createVersion(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matrices'] })
            toast.success({ title: 'Ma trận đã được tạo thành công!' })
            navigate({ to: '/matrices' })
        },
        onError: (error: any) => {
            toast.error({ title: 'Lỗi khi tạo version', description: error.message })
        },
    })

    const updateMatrixMutation = useMutation({
        ...apiClient.matrix.updateMatrix(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matrices'] })
            toast.success({ title: 'Ma trận đã được cập nhật!' })
            navigate({ to: '/matrices' })
        },
    })

    // Handle Step 1 Submit
    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!subjectId) {
            toast.warning({ title: 'Vui lòng chọn môn học' })
            return
        }

        const matrixRequest = {
            name: matrixName,
            code: matrixCode,
            description,
            duration: totalTime,
            totalScore,
            subjectId,
        }

        if (matrixId) {
            // Update existing matrix
            updateMatrixMutation.mutate({ id: matrixId, data: matrixRequest })
        } else {
            // Create new matrix
            createMatrixMutation.mutate(matrixRequest)
        }
    }

    // Handle Step 2 Submit
    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!createdMatrixId) {
            toast.error({ title: 'Lỗi: Không tìm thấy ma trận' })
            return
        }

        if (matrixDetails.length === 0) {
            toast.warning({ title: 'Vui lòng thêm ít nhất một bài học vào ma trận' })
            return
        }

        // Validate total score
        const calculatedTotal = matrixDetails.reduce((sum, detail) => {
            return (
                sum +
                (detail.easyMCQ || 0) * (detail.easyMCQScore || 0) +
                (detail.mediumMCQ || 0) * (detail.mediumMCQScore || 0) +
                (detail.hardMCQ || 0) * (detail.hardMCQScore || 0) +
                (detail.easyEssay || 0) * (detail.easyEssayScore || 0) +
                (detail.mediumEssay || 0) * (detail.mediumEssayScore || 0) +
                (detail.hardEssay || 0) * (detail.hardEssayScore || 0)
            )
        }, 0)

        if (Math.abs(calculatedTotal - totalScore) > 0.01) {
            toast.warning({
                title: 'Tổng điểm không khớp!',
                description: `Hiện tại: ${calculatedTotal.toFixed(1)}, Yêu cầu: ${totalScore}`,
            })
            return
        }

        createVersionMutation.mutate({
            matrixId: createdMatrixId,
            name: versionName,
            notes: versionNotes,
            matrixDetails: matrixDetails.filter(detail => detail.lessonId),
        })
    }

    const isLoading =
        createMatrixMutation.isPending || createVersionMutation.isPending || updateMatrixMutation.isPending

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate({ to: '/matrices' })} className="mb-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <h1 className="mb-2 text-4xl font-bold">
                    {matrixId ? 'Chỉnh sửa ma trận đề thi' : `Tạo ma trận đề thi mới - Bước ${step}/2`}
                </h1>
                <p className="text-muted-foreground">
                    {step === 1
                        ? 'Bước 1: Thiết lập thông tin cơ bản cho ma trận đề thi'
                        : 'Bước 2: Cấu hình phân bổ câu hỏi theo từng bài học'}
                </p>
            </div>

            {/* Progress indicator */}
            {!matrixId && (
                <div className="mb-8 flex items-center justify-center gap-4">
                    <div
                        className={`flex items-center gap-2 ${step === 1 ? 'font-bold text-blue-600' : 'text-gray-400'}`}
                    >
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
                        >
                            1
                        </div>
                        <span>Thông tin cơ bản</span>
                    </div>
                    <div className="h-px w-20 bg-gray-300"></div>
                    <div
                        className={`flex items-center gap-2 ${step === 2 ? 'font-bold text-blue-600' : 'text-gray-400'}`}
                    >
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
                        >
                            2
                        </div>
                        <span>Cấu hình phân bổ</span>
                    </div>
                </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
                <form onSubmit={handleStep1Submit}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Nhập thông tin chung về ma trận đề thi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="matrixName">
                                        Tên ma trận <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="matrixName"
                                        placeholder="VD: Ma trận Toán học lớp 10 - HK1"
                                        value={matrixName}
                                        onChange={e => setMatrixName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="matrixCode">
                                        Mã ma trận <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="matrixCode"
                                        placeholder="VD: MT-TOAN-10-HK1"
                                        value={matrixCode}
                                        onChange={e => setMatrixCode(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="subjectId">
                                        Môn học <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="subjectId"
                                        className="w-full rounded-md border px-3 py-2"
                                        value={subjectId || ''}
                                        onChange={e =>
                                            setSubjectId(e.target.value ? Number(e.target.value) : undefined)
                                        }
                                        required
                                    >
                                        <option value="">-- Chọn môn học --</option>
                                        {subjects?.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name} ({subject.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalTime">Thời gian làm bài (phút)</Label>
                                    <Input
                                        id="totalTime"
                                        type="number"
                                        value={totalTime}
                                        onChange={e => setTotalTime(Number(e.target.value))}
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="totalScore">Tổng điểm</Label>
                                    <Input
                                        id="totalScore"
                                        type="number"
                                        step="0.5"
                                        value={totalScore}
                                        onChange={e => setTotalScore(Number(e.target.value))}
                                        min={0}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Mô tả về ma trận đề thi này..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate({ to: '/matrices' })}>
                            Hủy
                        </Button>
                        <Button type="submit" className="gap-2" isDisabled={isLoading}>
                            <ArrowRight className="h-4 w-4" />
                            {isLoading ? 'Đang xử lý...' : 'Tiếp theo'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Step 2: Version Configuration */}
            {step === 2 && (
                <form onSubmit={handleStep2Submit}>
                    {/* Version Info */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Thông tin version</CardTitle>
                            <CardDescription>Đặt tên và mô tả cho version ma trận này</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="versionName">
                                        Tên version <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="versionName"
                                        placeholder="VD: Version 1.0, Đề cương HK1"
                                        value={versionName}
                                        onChange={e => setVersionName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="versionNotes">Ghi chú</Label>
                                    <Input
                                        id="versionNotes"
                                        placeholder="VD: Initial version"
                                        value={versionNotes}
                                        onChange={e => setVersionNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Matrix Detail Configuration */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Cấu hình phân bổ câu hỏi</CardTitle>
                            <CardDescription>
                                Chọn các bài học và cấu hình số lượng câu hỏi, điểm số cho từng độ khó
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MatrixDetailTable
                                lessons={allLessons || []}
                                value={matrixDetails}
                                onChange={setMatrixDetails}
                                targetTotalScore={totalScore}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between gap-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <Button type="submit" className="gap-2" isDisabled={isLoading}>
                            <Save className="h-4 w-4" />
                            {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
