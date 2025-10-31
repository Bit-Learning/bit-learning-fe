import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import type { MatrixDetailRequest } from '@workspace/lib/api/sdk/matrix.type'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Textarea } from '@workspace/ui/components/Textarea'
import { Label } from '@workspace/ui/components/label'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MatrixRow {
    id: string
    lessonId?: number
    topic: string
    level: 'EASY' | 'MEDIUM' | 'HARD'
    questionType: 'MCQ' | 'ESSAY'
    questionCount: number
    points: number
}

export default function CreateMatrix() {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const matrixId = (params as any).id ? Number((params as any).id) : undefined
    const queryClient = useQueryClient()

    const [matrixName, setMatrixName] = useState('')
    const [matrixCode, setMatrixCode] = useState('')
    const [subjectId, setSubjectId] = useState<number | undefined>()
    const [description, setDescription] = useState('')
    const [totalTime, setTotalTime] = useState(60)
    const [totalScore, setTotalScore] = useState(10)
    const [rows, setRows] = useState<MatrixRow[]>([
        { id: '1', topic: '', level: 'EASY', questionType: 'MCQ', questionCount: 0, points: 0 },
    ])

    // Load subjects for dropdown
    const { data: subjects } = useQuery(apiClient.subject.getAllSubjects())

    // Load matrix data if editing
    const { data: matrixData } = useQuery({
        ...apiClient.matrix.getMatrixById(matrixId!),
        enabled: !!matrixId,
    })

    // Load matrix latest version if editing
    const { data: latestVersion } = useQuery({
        ...apiClient.matrix.getLatestVersion(matrixId!),
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
        }
    }, [matrixData])

    // Create/Update mutations
    const createMatrixMutation = useMutation({
        ...apiClient.matrix.createMatrix(),
        onSuccess: data => {
            // After creating matrix, create the first version with details
            createVersionMutation.mutate({
                matrixId: data.id,
                name: 'Version 1.0',
                notes: 'Initial version',
                matrixDetails: rows.filter(row => row.lessonId).map(row => convertRowToMatrixDetail(row)),
            })
        },
    })

    const createVersionMutation = useMutation({
        ...apiClient.matrix.createVersion(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matrices'] })
            alert('Ma trận đã được tạo thành công!')
            navigate({ to: '/matrices' })
        },
        onError: (error: any) => {
            alert(`Lỗi khi tạo version: ${error.message}`)
        },
    })

    const updateMatrixMutation = useMutation({
        ...apiClient.matrix.updateMatrix(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matrices'] })
            alert('Ma trận đã được cập nhật!')
            navigate({ to: '/matrices' })
        },
    })

    const levels = [
        { value: 'EASY', label: 'Nhận biết' },
        { value: 'MEDIUM', label: 'Thông hiểu' },
        { value: 'HARD', label: 'Vận dụng' },
    ]

    const questionTypes = [
        { value: 'MCQ', label: 'Trắc nghiệm' },
        { value: 'ESSAY', label: 'Tự luận' },
    ]

    const convertRowToMatrixDetail = (row: MatrixRow): MatrixDetailRequest => {
        const detail: MatrixDetailRequest = {
            lessonId: row.lessonId,
        }

        if (row.questionType === 'MCQ') {
            if (row.level === 'EASY') {
                detail.easyMCQ = row.questionCount
                detail.easyMCQScore = row.points
            } else if (row.level === 'MEDIUM') {
                detail.mediumMCQ = row.questionCount
                detail.mediumMCQScore = row.points
            } else if (row.level === 'HARD') {
                detail.hardMCQ = row.questionCount
                detail.hardMCQScore = row.points
            }
        } else {
            if (row.level === 'EASY') {
                detail.easyEssay = row.questionCount
                detail.easyEssayScore = row.points
            } else if (row.level === 'MEDIUM') {
                detail.mediumEssay = row.questionCount
                detail.mediumEssayScore = row.points
            } else if (row.level === 'HARD') {
                detail.hardEssay = row.questionCount
                detail.hardEssayScore = row.points
            }
        }

        return detail
    }

    const addRow = () => {
        const newRow: MatrixRow = {
            id: Date.now().toString(),
            topic: '',
            level: 'EASY',
            questionType: 'MCQ',
            questionCount: 0,
            points: 0,
        }
        setRows([...rows, newRow])
    }

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id))
        }
    }

    const updateRow = (id: string, field: keyof MatrixRow, value: any) => {
        setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!subjectId) {
            alert('Vui lòng chọn môn học')
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

    const totalQuestions = rows.reduce((sum, row) => sum + (Number(row.questionCount) || 0), 0)
    const totalPoints = rows.reduce((sum, row) => sum + (Number(row.points) || 0), 0)

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
                    {matrixId ? 'Chỉnh sửa ma trận đề thi' : 'Tạo ma trận đề thi mới'}
                </h1>
                <p className="text-muted-foreground">Thiết lập thông tin và cấu trúc cho ma trận đề thi của bạn</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Information */}
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
                                    onChange={e => setSubjectId(e.target.value ? Number(e.target.value) : undefined)}
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

                {/* Matrix Structure */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Cấu trúc ma trận</CardTitle>
                                <CardDescription>Định nghĩa các chủ đề và mức độ câu hỏi</CardDescription>
                            </div>
                            <Button type="button" onClick={addRow} variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Thêm dòng
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-2 py-3 text-left font-semibold">Lesson ID</th>
                                        <th className="px-2 py-3 text-left font-semibold">Chủ đề</th>
                                        <th className="px-2 py-3 text-left font-semibold">Loại</th>
                                        <th className="px-2 py-3 text-left font-semibold">Mức độ</th>
                                        <th className="px-2 py-3 text-left font-semibold">Số câu</th>
                                        <th className="px-2 py-3 text-left font-semibold">Điểm</th>
                                        <th className="w-20 px-2 py-3 text-left font-semibold">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(row => (
                                        <tr key={row.id} className="border-b">
                                            <td className="px-2 py-3">
                                                <Input
                                                    type="number"
                                                    placeholder="ID"
                                                    value={row.lessonId || ''}
                                                    onChange={e =>
                                                        updateRow(
                                                            row.id,
                                                            'lessonId',
                                                            e.target.value ? Number(e.target.value) : undefined,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-3">
                                                <Input
                                                    placeholder="VD: Hàm số bậc nhất"
                                                    value={row.topic}
                                                    onChange={e => updateRow(row.id, 'topic', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-2 py-3">
                                                <select
                                                    className="w-full rounded-md border px-3 py-2"
                                                    value={row.questionType}
                                                    onChange={e => updateRow(row.id, 'questionType', e.target.value)}
                                                >
                                                    {questionTypes.map(type => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-2 py-3">
                                                <select
                                                    className="w-full rounded-md border px-3 py-2"
                                                    value={row.level}
                                                    onChange={e => updateRow(row.id, 'level', e.target.value)}
                                                >
                                                    {levels.map(level => (
                                                        <option key={level.value} value={level.value}>
                                                            {level.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-2 py-3">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.questionCount}
                                                    onChange={e =>
                                                        updateRow(row.id, 'questionCount', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-3">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.5"
                                                    value={row.points}
                                                    onChange={e => updateRow(row.id, 'points', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-2 py-3">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeRow(row.id)}
                                                    isDisabled={rows.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 font-semibold">
                                        <td className="px-2 py-3">Tổng cộng</td>
                                        <td className="px-2 py-3"></td>
                                        <td className="px-2 py-3"></td>
                                        <td className="px-2 py-3"></td>
                                        <td className="px-2 py-3">{totalQuestions} câu</td>
                                        <td className="px-2 py-3">{totalPoints} điểm</td>
                                        <td className="px-2 py-3"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Tóm tắt ma trận</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-lg bg-blue-50 p-4 text-center">
                                <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
                                <div className="text-muted-foreground text-sm">Tổng số câu</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4 text-center">
                                <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
                                <div className="text-muted-foreground text-sm">Tổng điểm</div>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-4 text-center">
                                <div className="text-3xl font-bold text-purple-600">{rows.length}</div>
                                <div className="text-muted-foreground text-sm">Số dòng</div>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-4 text-center">
                                <div className="text-3xl font-bold text-orange-600">{totalTime}</div>
                                <div className="text-muted-foreground text-sm">Phút</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: '/matrices' })}>
                        Hủy
                    </Button>
                    <Button type="submit" className="gap-2" isDisabled={isLoading}>
                        <Save className="h-4 w-4" />
                        {isLoading ? 'Đang lưu...' : 'Lưu ma trận'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
