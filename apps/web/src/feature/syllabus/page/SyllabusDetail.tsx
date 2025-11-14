import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { confirm } from '@workspace/ui/components/ConfirmDialog'
import { Skeleton } from '@workspace/ui/components/Skeleton'
import { toast } from '@workspace/ui/components/Sonner'
import { ArrowLeft, BookOpen, Clock, Download, Edit, FileText, Trash2 } from 'lucide-react'

export default function SyllabusDetail() {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const syllabusId = Number((params as any).id)
    const queryClient = useQueryClient()

    // Fetch syllabus by ID (includes versions)
    const { data: syllabus, isLoading, error } = useQuery(apiClient.syllabus.getSyllabusById(syllabusId))

    // Get the latest version from the syllabus data
    const latestVersion = syllabus?.versions?.[0]

    // Fetch details for latest version
    const { data: syllabusDetails } = useQuery({
        ...apiClient.syllabus.getDetailsByVersion(latestVersion?.id!),
        enabled: !!latestVersion,
    })

    // Delete mutation
    const deleteMutation = useMutation({
        ...apiClient.syllabus.deleteSyllabus(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['syllabuses'] })
            toast.success({ title: 'Đã xóa giáo trình thành công!' })
            navigate({ to: '/syllabuses' })
        },
        onError: (error: any) => {
            console.error('Delete error:', error)
            toast.error({ title: 'Lỗi khi xóa giáo trình', description: error.message })
        },
    })

    const handleDownload = async (format: 'pdf' | 'docx') => {
        if (!latestVersion) {
            toast.warning({ title: 'Chưa có phiên bản nào để tải xuống' })
            return
        }

        try {
            const blob = await queryClient.fetchQuery(
                apiClient.syllabus.downloadSyllabusVersion(latestVersion.id, format),
            )

            const url = window.URL.createObjectURL(blob as Blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `giao-an-${syllabus?.code}.${format === 'pdf' ? 'pdf' : 'docx'}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success({ title: 'Tải xuống thành công!' })
        } catch (error: any) {
            toast.error({ title: 'Lỗi khi tải xuống', description: error.message })
        }
    }

    const handleDelete = () => {
        console.log('Delete button clicked for syllabus:', syllabusId)
        confirm({
            title: 'Xác nhận xóa giáo trình',
            description: `Bạn có chắc chắn muốn xóa giáo trình "${syllabus?.name}"? Hành động này không thể hoàn tác.`,
            variant: 'destructive',
            action: {
                label: 'Xóa',
                onClick: () => {
                    console.log('Calling deleteMutation.mutate')
                    deleteMutation.mutate(syllabusId)
                },
            },
            cancel: {
                label: 'Hủy',
                onClick: () => {},
            },
        })
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Skeleton className="mb-4 h-10 w-64" />
                <Skeleton className="mb-8 h-6 w-96" />
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        )
    }

    if (error || !syllabus) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center text-red-500">
                    Không tìm thấy giáo trình hoặc có lỗi xảy ra: {error?.message}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate({ to: '/syllabuses' })} className="mb-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                            <h1 className="text-4xl font-bold">{syllabus.code}</h1>
                            <Badge className={syllabus.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                                {syllabus.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                            </Badge>
                        </div>
                        <h2 className="mb-2 text-2xl font-medium text-gray-700">{syllabus.name}</h2>
                        <p className="text-muted-foreground">Môn học: {syllabus.subject.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link to={`/syllabuses/${syllabusId}/edit` as any}>
                            <Button variant="outline" className="gap-2">
                                <Edit className="h-4 w-4" />
                                Chỉnh sửa
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => handleDownload('pdf')} className="gap-2">
                            <Download className="h-4 w-4" />
                            Tải PDF
                        </Button>
                        <Button variant="outline" onClick={() => handleDownload('docx')} className="gap-2">
                            <Download className="h-4 w-4" />
                            Tải Word
                        </Button>
                        <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                            Xóa
                        </Button>
                    </div>
                </div>
            </div>

            {/* Description */}
            {syllabus.description && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Mô tả</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{syllabus.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Version Info */}
            {latestVersion && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Phiên bản hiện tại
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tên phiên bản:</span>
                            <span className="font-medium">{latestVersion.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số phiên bản:</span>
                            <span className="font-medium">v{latestVersion.versionNo}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày tạo:</span>
                            <span className="font-medium">
                                {new Date(latestVersion.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Syllabus Details */}
            {syllabusDetails && syllabusDetails.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Nội dung giáo trình ({syllabusDetails.length} bài học)
                        </CardTitle>
                        <CardDescription>Chi tiết các bài học trong giáo trình</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {syllabusDetails.map((detail: any, index: number) => (
                                <Card key={detail.id} className="border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">
                                                Bài {index + 1}: {detail.lesson.name}
                                            </CardTitle>
                                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4" />
                                                <span>{detail.duration} phút</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {detail.learningObjectives && (
                                            <div>
                                                <h4 className="mb-1 font-semibold text-gray-700">Mục tiêu học tập:</h4>
                                                <p className="text-sm text-gray-600">{detail.learningObjectives}</p>
                                            </div>
                                        )}
                                        {detail.materials && (
                                            <div>
                                                <h4 className="mb-1 font-semibold text-gray-700">Tài liệu:</h4>
                                                <p className="text-sm text-gray-600">{detail.materials}</p>
                                            </div>
                                        )}
                                        {detail.studentTasks && (
                                            <div>
                                                <h4 className="mb-1 font-semibold text-gray-700">Nhiệm vụ học sinh:</h4>
                                                <p className="text-sm text-gray-600">{detail.studentTasks}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {(!syllabusDetails || syllabusDetails.length === 0) && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold">Chưa có nội dung</h3>
                        <p className="text-muted-foreground text-center">
                            Giáo trình chưa có bài học nào được thêm vào
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
