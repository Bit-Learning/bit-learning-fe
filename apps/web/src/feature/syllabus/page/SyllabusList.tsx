import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader } from '@workspace/ui/components/Card'
import { confirm } from '@workspace/ui/components/ConfirmDialog'
import { Input } from '@workspace/ui/components/Input'
import { toast } from '@workspace/ui/components/Sonner'
import { BookOpen, Clock, Download, Edit, Plus, Power, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function SyllabusList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const queryClient = useQueryClient()

    // Fetch syllabuses with pagination
    const {
        data: syllabusesData,
        isLoading,
        error,
    } = useQuery(
        apiClient.syllabus.getAllSyllabuses({
            pageable: {
                page: currentPage,
                size: 10,
            },
        }),
    )

    // Delete mutation
    const deleteMutation = useMutation({
        ...apiClient.syllabus.deleteSyllabus(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['syllabuses'] })
            toast.success({ title: 'Đã xóa giáo trình thành công!' })
        },
        onError: (error: any) => {
            toast.error({ title: 'Lỗi khi xóa giáo trình', description: error.message })
        },
    })

    // Toggle active status mutation
    const toggleActiveMutation = useMutation({
        ...apiClient.syllabus.setActiveStatus(),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['syllabuses'] })
            toast.success({
                title: variables.isActive ? 'Đã kích hoạt giáo trình' : 'Đã vô hiệu hóa giáo trình',
            })
        },
        onError: (error: any) => {
            toast.error({ title: 'Lỗi khi thay đổi trạng thái', description: error.message })
        },
    })

    const syllabuses = syllabusesData?.content || []

    const filteredSyllabuses = syllabuses.filter(
        syllabus =>
            syllabus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            syllabus.subject.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleDelete = (id: number, name: string) => {
        confirm({
            title: 'Xác nhận xóa giáo trình',
            description: `Bạn có chắc chắn muốn xóa giáo trình "${name}"? Hành động này không thể hoàn tác.`,
            variant: 'destructive',
            action: {
                label: 'Xóa',
                onClick: () => deleteMutation.mutate(id),
            },
            cancel: {
                label: 'Hủy',
                onClick: () => {},
            },
        })
    }

    const handleToggleActive = (id: number, currentStatus: boolean, name: string) => {
        const newStatus = !currentStatus
        confirm({
            title: newStatus ? 'Kích hoạt giáo trình' : 'Vô hiệu hóa giáo trình',
            description: `Bạn có chắc chắn muốn ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} giáo trình "${name}"?`,
            variant: 'default',
            action: {
                label: newStatus ? 'Kích hoạt' : 'Vô hiệu hóa',
                onClick: () => toggleActiveMutation.mutate({ id, isActive: newStatus }),
            },
            cancel: {
                label: 'Hủy',
                onClick: () => {},
            },
        })
    }

    const handleDownload = async (syllabus: any, format: 'pdf' | 'docx') => {
        if (!syllabus.versions || syllabus.versions.length === 0) {
            toast.warning({ title: 'Giáo trình chưa có phiên bản nào để tải xuống' })
            return
        }

        // Get the latest version (first in the array)
        const latestVersion = syllabus.versions[0]

        try {
            const blob = await queryClient.fetchQuery(
                apiClient.syllabus.downloadSyllabusVersion(latestVersion.id, format),
            )

            const url = window.URL.createObjectURL(blob as Blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `giao-an-${syllabus.code}.${format === 'pdf' ? 'pdf' : 'docx'}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success({ title: 'Tải xuống thành công!' })
        } catch (error: any) {
            toast.error({ title: 'Lỗi khi tải xuống', description: error.message })
        }
    }

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-500">Đang hoạt động</Badge>
        ) : (
            <Badge className="bg-gray-500">Không hoạt động</Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center">Đang tải...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="text-center text-red-500">Có lỗi xảy ra: {error.message}</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold">Giáo trình (Syllabus)</h1>
                <p className="text-muted-foreground">Quản lý giáo trình và đề cương môn học</p>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm giáo trình theo tên hoặc môn học..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {/* <Link to="/syllabuses/my">
                        <Button variant="outline" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Giáo trình của tôi
                        </Button>
                    </Link> */}
                    <Link to="/syllabuses/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo giáo trình mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Syllabus Grid */}
            {filteredSyllabuses.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-xl font-medium">Chưa có giáo trình nào</h3>
                        <p className="text-muted-foreground mb-4">Bắt đầu tạo giáo trình đầu tiên của bạn</p>
                        <Link to="/syllabuses/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo giáo trình mới
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSyllabuses.map(syllabus => (
                        <Card key={syllabus.id} className="transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <h3 className="text-lg font-bold">{syllabus.code}</h3>
                                            {getStatusBadge(syllabus.isActive)}
                                        </div>
                                        <h4 className="mb-2 text-sm font-medium">{syllabus.name}</h4>
                                        <CardDescription>Môn: {syllabus.subject.name}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Description */}
                                {syllabus.description && (
                                    <p className="line-clamp-2 text-sm text-gray-600">{syllabus.description}</p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{syllabus.versions.length} versions</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Link to={`/syllabuses/${syllabus.id}` as any} className="flex-1">
                                            <Button variant="outline" className="w-full gap-2" size="sm">
                                                <BookOpen className="h-4 w-4" />
                                                Xem chi tiết
                                            </Button>
                                        </Link>
                                        <Link to={`/syllabuses/${syllabus.id}/edit` as any}>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`gap-2 ${syllabus.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                            onClick={() =>
                                                handleToggleActive(syllabus.id, syllabus.isActive, syllabus.name)
                                            }
                                        >
                                            <Power className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(syllabus.id, syllabus.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 gap-2"
                                            onClick={() => handleDownload(syllabus, 'pdf')}
                                            isDisabled={!syllabus.versions || syllabus.versions.length === 0}
                                        >
                                            <Download className="h-4 w-4" />
                                            PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 gap-2"
                                            onClick={() => handleDownload(syllabus, 'docx')}
                                            isDisabled={!syllabus.versions || syllabus.versions.length === 0}
                                        >
                                            <Download className="h-4 w-4" />
                                            Word
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {syllabusesData && syllabusesData.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        isDisabled={currentPage === 0}
                    >
                        Trước
                    </Button>
                    <span className="text-sm text-gray-600">
                        Trang {currentPage + 1} / {syllabusesData.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(syllabusesData.totalPages - 1, p + 1))}
                        isDisabled={currentPage === syllabusesData.totalPages - 1}
                    >
                        Sau
                    </Button>
                </div>
            )}
        </div>
    )
}
