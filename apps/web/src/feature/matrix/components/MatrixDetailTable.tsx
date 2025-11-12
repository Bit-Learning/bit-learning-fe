import type { MatrixDetailRequest } from '@workspace/lib/api/sdk/matrix.type'
import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/Input'
import { toast } from '@workspace/ui/components/Sonner'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Lesson {
    id: number
    name: string
    lessonNo: number
}

interface Props {
    lessons: Lesson[]
    value: MatrixDetailRequest[]
    onChange: (details: MatrixDetailRequest[]) => void
    targetTotalScore: number
}

export function MatrixDetailTable({ lessons, value, onChange, targetTotalScore }: Props) {
    const [details, setDetails] = useState<MatrixDetailRequest[]>(value)
    const [selectedLessonId, setSelectedLessonId] = useState<string>('')

    const handleAddLesson = () => {
        if (!selectedLessonId) return

        const lessonId = Number(selectedLessonId)
        if (details.find(d => d.lessonId === lessonId)) {
            toast.warning({ title: 'Bài học này đã được thêm' })
            return
        }

        const newDetail: MatrixDetailRequest = {
            lessonId,
            easyMCQ: 0,
            mediumMCQ: 0,
            hardMCQ: 0,
            easyEssay: 0,
            mediumEssay: 0,
            hardEssay: 0,
            easyMCQScore: 0,
            mediumMCQScore: 0,
            hardMCQScore: 0,
            easyEssayScore: 0,
            mediumEssayScore: 0,
            hardEssayScore: 0,
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

    const handleChange = (index: number, field: keyof MatrixDetailRequest, value: number) => {
        const newDetails = [...details]
        newDetails[index] = { ...newDetails[index], [field]: value }
        setDetails(newDetails)
        onChange(newDetails)
    }

    const calculateLessonTotal = (detail: MatrixDetailRequest) => {
        return (
            (detail.easyMCQ || 0) * (detail.easyMCQScore || 0) +
            (detail.mediumMCQ || 0) * (detail.mediumMCQScore || 0) +
            (detail.hardMCQ || 0) * (detail.hardMCQScore || 0) +
            (detail.easyEssay || 0) * (detail.easyEssayScore || 0) +
            (detail.mediumEssay || 0) * (detail.mediumEssayScore || 0) +
            (detail.hardEssay || 0) * (detail.hardEssayScore || 0)
        )
    }

    const calculateGrandTotal = () => {
        return details.reduce((sum, detail) => sum + calculateLessonTotal(detail), 0)
    }

    const grandTotal = calculateGrandTotal()
    const isValidTotal = Math.abs(grandTotal - targetTotalScore) < 0.01

    const availableLessons = lessons.filter(l => !details.find(d => d.lessonId === l.id))

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

            {/* Detail tables */}
            {details.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                    Chưa có bài học nào. Vui lòng thêm bài học từ dropdown phía trên.
                </div>
            ) : (
                details.map((detail, index) => {
                    const lesson = lessons.find(l => l.id === detail.lessonId)
                    const lessonTotal = calculateLessonTotal(detail)

                    return (
                        <div key={index} className="rounded-lg border">
                            {/* Lesson header */}
                            <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                                <h3 className="font-medium">
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

                            {/* Detail table */}
                            <div className="overflow-x-auto p-4">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left"></th>
                                            <th className="p-2 text-center">Dễ</th>
                                            <th className="p-2 text-center">Trung bình</th>
                                            <th className="p-2 text-center">Khó</th>
                                            <th className="p-2 text-center">Tổng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* MCQ Section */}
                                        <tr className="border-b bg-blue-50">
                                            <td className="p-2 font-medium" colSpan={5}>
                                                Trắc nghiệm (MCQ)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2">Số câu</td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.easyMCQ || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'easyMCQ', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.mediumMCQ || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'mediumMCQ', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.hardMCQ || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'hardMCQ', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2 text-center font-medium">
                                                {(detail.easyMCQ || 0) +
                                                    (detail.mediumMCQ || 0) +
                                                    (detail.hardMCQ || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2">Điểm/câu</td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.easyMCQScore || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'easyMCQScore', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.mediumMCQScore || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'mediumMCQScore', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.hardMCQScore || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'hardMCQScore', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr className="bg-blue-50">
                                            <td className="p-2 font-medium">Tổng điểm</td>
                                            <td className="p-2 text-center font-medium">
                                                {((detail.easyMCQ || 0) * (detail.easyMCQScore || 0)).toFixed(1)}
                                            </td>
                                            <td className="p-2 text-center font-medium">
                                                {((detail.mediumMCQ || 0) * (detail.mediumMCQScore || 0)).toFixed(1)}
                                            </td>
                                            <td className="p-2 text-center font-medium">
                                                {((detail.hardMCQ || 0) * (detail.hardMCQScore || 0)).toFixed(1)}
                                            </td>
                                            <td className="p-2 text-center font-bold">
                                                {(
                                                    (detail.easyMCQ || 0) * (detail.easyMCQScore || 0) +
                                                    (detail.mediumMCQ || 0) * (detail.mediumMCQScore || 0) +
                                                    (detail.hardMCQ || 0) * (detail.hardMCQScore || 0)
                                                ).toFixed(1)}
                                            </td>
                                        </tr>

                                        {/* Essay Section */}
                                        <tr className="border-b bg-green-50">
                                            <td className="p-2 font-medium" colSpan={5}>
                                                Tự luận (Essay)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2">Số câu</td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.easyEssay || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'easyEssay', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.mediumEssay || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'mediumEssay', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.hardEssay || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'hardEssay', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2 text-center font-medium">
                                                {(detail.easyEssay || 0) +
                                                    (detail.mediumEssay || 0) +
                                                    (detail.hardEssay || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2">Điểm/câu</td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.easyEssayScore || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'easyEssayScore', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.mediumEssayScore || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'mediumEssayScore', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full text-center"
                                                    value={detail.hardEssayScore || 0}
                                                    onChange={e =>
                                                        handleChange(index, 'hardEssayScore', Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr className="bg-green-50">
                                            <td className="p-2 font-medium">Tổng điểm</td>
                                            <td className="p-2 text-center font-medium">
                                                {((detail.easyEssay || 0) * (detail.easyEssayScore || 0)).toFixed(1)}
                                            </td>
                                            <td className="p-2 text-center font-medium">
                                                {((detail.mediumEssay || 0) * (detail.mediumEssayScore || 0)).toFixed(
                                                    1,
                                                )}
                                            </td>
                                            <td className="p-2 text-center font-medium">
                                                {((detail.hardEssay || 0) * (detail.hardEssayScore || 0)).toFixed(1)}
                                            </td>
                                            <td className="p-2 text-center font-bold">
                                                {(
                                                    (detail.easyEssay || 0) * (detail.easyEssayScore || 0) +
                                                    (detail.mediumEssay || 0) * (detail.mediumEssayScore || 0) +
                                                    (detail.hardEssay || 0) * (detail.hardEssayScore || 0)
                                                ).toFixed(1)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Lesson total */}
                                <div className="mt-3 text-right font-medium">
                                    Tổng điểm bài này: <span className="text-lg">{lessonTotal.toFixed(1)} điểm</span>
                                </div>
                            </div>
                        </div>
                    )
                })
            )}

            {/* Grand Total */}
            {details.length > 0 && (
                <div
                    className={`rounded-lg p-4 text-right text-xl font-bold ${
                        isValidTotal ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                >
                    Tổng điểm tất cả bài: {grandTotal.toFixed(1)}/{targetTotalScore} điểm {isValidTotal ? '✅' : '❌'}
                    {!isValidTotal && (
                        <div className="mt-2 text-sm font-normal">
                            Vui lòng điều chỉnh để tổng điểm bằng {targetTotalScore} điểm
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
