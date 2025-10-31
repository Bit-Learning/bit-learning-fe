import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Download, Edit, FileSpreadsheet, FileText, Plus, Search, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'

export default function MatrixList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const queryClient = useQueryClient()

    // Fetch matrices with pagination
    const {
        data: matricesData,
        isLoading,
        error,
    } = useQuery(
        apiClient.matrix.getAllMatrices({
            pageable: {
                page: currentPage,
                size: 10,
            },
        }),
    )

    // Delete mutation
    const deleteMutation = useMutation({
        ...apiClient.matrix.deleteMatrix(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matrices'] })
        },
    })

    const matrices = matricesData?.content || []

    const filteredMatrices = matrices.filter(
        matrix =>
            matrix.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            matrix.subject.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa ma trận này?')) {
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
                <h1 className="mb-2 text-4xl font-bold">Ma trận đề thi</h1>
                <p className="text-muted-foreground">
                    Quản lý ma trận đề thi, import ngân hàng câu hỏi và tạo đề thi tự động
                </p>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm ma trận theo tên hoặc môn học..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Link to="/matrices/import">
                        <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Import Question Bank
                        </Button>
                    </Link>
                    <Link to="/matrices/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo ma trận mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Matrix Cards Grid */}
            {filteredMatrices.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent>
                        <FileSpreadsheet className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                        <h3 className="mb-2 text-xl font-semibold">Không tìm thấy ma trận nào</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Bắt đầu bằng cách tạo ma trận đề thi đầu tiên của bạn'}
                        </p>
                        {!searchTerm && (
                            <Link to="/matrices/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tạo ma trận mới
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMatrices.map(matrix => (
                        <Card key={matrix.id} className="transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="mb-2 flex items-start justify-between">
                                    <CardTitle className="line-clamp-2 text-lg">{matrix.name}</CardTitle>
                                    {getStatusBadge(matrix.isActive)}
                                </div>
                                <CardDescription className="line-clamp-2">{matrix.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Matrix Info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Môn học:</span>
                                        <span className="font-medium">{matrix.subject.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mã môn:</span>
                                        <span className="font-medium">{matrix.subject.code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Thời gian:</span>
                                        <span className="font-medium">{matrix.duration} phút</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ngày tạo:</span>
                                        <span className="font-medium">
                                            {new Date(matrix.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 border-t pt-4">
                                    <Link
                                        to="/matrices/$id/generate"
                                        params={{ id: String(matrix.id) }}
                                        className="flex-1"
                                    >
                                        <Button variant="default" size="sm" className="w-full gap-2">
                                            <FileText className="h-4 w-4" />
                                            Generate đề thi
                                        </Button>
                                    </Link>
                                    <Link to="/matrices/$id/edit" params={{ id: String(matrix.id) }}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(matrix.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <Link to="/matrices/create">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Plus className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Tạo ma trận mới</CardTitle>
                                    <CardDescription>Tạo ma trận đề thi từ đầu</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <Link to="/matrices/import">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-3">
                                    <Upload className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Import Question Bank</CardTitle>
                                    <CardDescription>Nhập ngân hàng câu hỏi</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-3">
                                <Download className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Xuất báo cáo</CardTitle>
                                <CardDescription>Tải xuống báo cáo ma trận</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
