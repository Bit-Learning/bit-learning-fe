import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Label } from '@workspace/ui/components/label'
import { toast } from '@workspace/ui/components/Sonner'
import { Textarea } from '@workspace/ui/components/Textarea'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EditSyllabus() {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const syllabusId = Number((params as any).id)
    const queryClient = useQueryClient()

    // Form state
    const [syllabusName, setSyllabusName] = useState('')
    const [syllabusCode, setSyllabusCode] = useState('')
    const [subjectId, setSubjectId] = useState<number | undefined>()
    const [description, setDescription] = useState('')

    // Load subjects for dropdown
    const { data: subjects } = useQuery(apiClient.subject.getAllSubjects())

    // Load syllabus data
    const { data: syllabusData, isLoading: isLoadingSyllabus } = useQuery(
        apiClient.syllabus.getSyllabusById(syllabusId),
    )

    // Populate form when syllabus data is loaded
    useEffect(() => {
        if (syllabusData) {
            setSyllabusName(syllabusData.name)
            setSyllabusCode(syllabusData.code)
            setSubjectId(syllabusData.subject.id)
            setDescription(syllabusData.description || '')
        }
    }, [syllabusData])

    // Update syllabus mutation
    const updateSyllabusMutation = useMutation({
        ...apiClient.syllabus.updateSyllabus(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['syllabuses'] })
            queryClient.invalidateQueries({ queryKey: ['syllabus', syllabusId] })
            toast.success({ title: 'Giáo trình đã được cập nhật thành công!' })
            navigate({ to: '/syllabuses' })
        },
        onError: (error: any) => {
            toast.error({ title: 'Lỗi khi cập nhật giáo trình', description: error.message })
        },
    })

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!subjectId) {
            toast.warning({ title: 'Vui lòng chọn môn học' })
            return
        }

        const syllabusRequest = {
            name: syllabusName,
            code: syllabusCode,
            description,
            subjectId,
        }

        updateSyllabusMutation.mutate({ id: syllabusId, data: syllabusRequest })
    }

    if (isLoadingSyllabus) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="text-center">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate({ to: '/syllabuses' })} className="mb-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <h1 className="mb-2 text-4xl font-bold">Chỉnh sửa giáo trình</h1>
                <p className="text-muted-foreground">Cập nhật thông tin cơ bản của giáo trình</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                        <CardDescription>Cập nhật thông tin chung về giáo trình</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="syllabusName">
                                    Tên giáo trình <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="syllabusName"
                                    placeholder="VD: Giáo trình Toán học lớp 10 - HK1"
                                    value={syllabusName}
                                    onChange={e => setSyllabusName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="syllabusCode">
                                    Mã giáo trình <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="syllabusCode"
                                    placeholder="VD: GT-TOAN-10-HK1"
                                    value={syllabusCode}
                                    onChange={e => setSyllabusCode(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Mô tả về giáo trình này..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: '/syllabuses' })}>
                        Hủy
                    </Button>
                    <Button type="submit" className="gap-2" isDisabled={updateSyllabusMutation.isPending}>
                        <Save className="h-4 w-4" />
                        {updateSyllabusMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
