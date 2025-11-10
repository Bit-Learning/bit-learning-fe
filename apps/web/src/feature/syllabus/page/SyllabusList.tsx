import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { BookOpen, Clock, Edit, Plus, Search, Trash2 } from 'lucide-react'
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
        },
    })

    const syllabuses = syllabusesData?.content || []

    const filteredSyllabuses = syllabuses.filter(
        syllabus =>
            syllabus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            syllabus.subject.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa giáo trình này?')) {
            deleteMutation.mutate(id)
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
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm giáo trình theo tên hoặc môn học..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Link to="/syllabuses/my">
                        <Button variant="outline" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Giáo trình của tôi
                        </Button>
                    </Link>
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
                                            Sửa
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(syllabus.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
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
