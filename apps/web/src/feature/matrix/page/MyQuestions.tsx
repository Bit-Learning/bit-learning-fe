import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { ArrowLeft, Edit, Eye, FileQuestion, FileText, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'

export default function MyQuestions() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(20)
    const { userInfo } = useSelector(selectAuthStateInfo)
    const queryClient = useQueryClient()

    // Debug: Check if userInfo exists
    console.log('[MyQuestions] userInfo:', userInfo)
    console.log('[MyQuestions] userId:', userInfo?.id)

    // Fetch my questions
    const {
        data: questions,
        isLoading,
        error,
    } = useQuery({
        ...apiClient.question.getMyQuestions(userInfo?.id || 0, { page: currentPage, size: pageSize }),
        enabled: !!userInfo?.id,
        retry: false,
        onError: (err: any) => {
            console.error('[MyQuestions] API Error:', err)
            console.error('[MyQuestions] Response:', err?.response)
            console.error('[MyQuestions] Status:', err?.response?.status)
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        ...apiClient.question.deleteQuestion(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions', 'my'] })
        },
    })

    const handleDelete = (id: number, content: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa câu hỏi:\n"${content.substring(0, 50)}..."`)) {
            deleteMutation.mutate(id)
        }
    }

    // Safely access content array from paginated response
    const questionsList = Array.isArray(questions?.content) ? questions.content : []

    const filteredQuestions = questionsList.filter((q: any) =>
        q.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getQuestionTypeBadge = (type: string) => {
        return type === 'MCQ' ? (
            <Badge className="bg-blue-500">Trắc nghiệm</Badge>
        ) : (
            <Badge className="bg-purple-500">Tự luận</Badge>
        )
    }

    const getLevelBadge = (level: string) => {
        const colors = {
            EASY: 'bg-green-500',
            MEDIUM: 'bg-yellow-500',
            HARD: 'bg-red-500',
        }
        const labels = {
            EASY: 'Dễ',
            MEDIUM: 'Trung bình',
            HARD: 'Khó',
        }
        return <Badge className={colors[level as keyof typeof colors]}>{labels[level as keyof typeof labels]}</Badge>
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
                <Link to="/questions/my">
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </Button>
                </Link>
                <h1 className="mb-2 text-4xl font-bold">Câu hỏi của tôi</h1>
                <p className="text-muted-foreground">Các câu hỏi do bạn tạo</p>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Link to="/questions/generate-from-questions">
                        <Button variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Generate đề thi
                        </Button>
                    </Link>
                    <Link to="/questions/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo câu hỏi mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Questions Table */}
            {filteredQuestions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileQuestion className="mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-xl font-medium">Chưa có câu hỏi nào</h3>
                        <p className="text-muted-foreground mb-4">Bắt đầu tạo câu hỏi đầu tiên của bạn</p>
                        <Link to="/questions/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo câu hỏi mới
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">STT</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Nội dung</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Loại</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Độ khó</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Môn học</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Bài học</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredQuestions.map((question: any, index: number) => (
                                        <tr key={question.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-md">
                                                    <p className="line-clamp-2 text-sm">{question.content}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{getQuestionTypeBadge(question.questionType)}</td>
                                            <td className="px-4 py-3">{getLevelBadge(question.questionLevel)}</td>
                                            <td className="px-4 py-3 text-sm">{question.subject?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm">{question.lesson?.name || '-'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`/questions/${question.id}` as any}>
                                                        <Button variant="ghost" size="sm" className="gap-1">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/questions/${question.id}/edit` as any}>
                                                        <Button variant="ghost" size="sm" className="gap-1">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(question.id, question.content)}
                                                        isDisabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {questions && questions.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        isDisabled={currentPage === 0}
                    >
                        Trước
                    </Button>
                    <span className="text-sm text-gray-600">
                        Trang {currentPage + 1} / {questions.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(questions.totalPages - 1, p + 1))}
                        isDisabled={currentPage === questions.totalPages - 1}
                    >
                        Sau
                    </Button>
                    <select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value))
                            setCurrentPage(0)
                        }}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10 / trang</option>
                        <option value={20}>20 / trang</option>
                        <option value={50}>50 / trang</option>
                        <option value={100}>100 / trang</option>
                    </select>
                </div>
            )}
        </div>
    )
}
