import { PresentationForm } from '../components/PresentationForm'
import { usePresentations } from '../hooks/usePresentations'
import PresentationLayout from '../layout'
import { SlidevPresentation } from '../types'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Separator } from '@workspace/ui/components/Separator'
import { FileText, Lightbulb } from 'lucide-react'
import { useState } from 'react'

const CreatePresentationPage = () => {
    const navigate = useNavigate()
    const { createPresentation, isLoading } = usePresentations()
    const [error, setError] = useState<string>('')

    const handleSubmit = async (data: Partial<SlidevPresentation>) => {
        setError('')
        const result = await createPresentation(data)

        if (result.success) {
            // Show success message (you can use a toast library here)
            alert('✅ Tạo bài thuyết trình thành công!')
            navigate({ to: '/templates/slidev' })
        } else {
            setError(result.error || 'Có lỗi xảy ra')
        }
    }

    const handleCancel = () => {
        navigate({ to: '/templates/slidev' })
    }

    return (
        <PresentationLayout>
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Tạo bài thuyết trình mới</h1>
                    <p className="text-muted-foreground mt-1">Điền thông tin để tạo một bài thuyết trình Slidev mới</p>
                </div>

                <Separator className="mb-6" />

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
                        <p className="text-sm text-red-800">❌ {error}</p>
                    </div>
                )}

                {/* Main Form */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Thông tin cơ bản
                        </CardTitle>
                        <CardDescription>Nhập các thông tin cần thiết cho bài thuyết trình</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PresentationForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
                    </CardContent>
                </Card>

                {/* Tips */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Lightbulb className="h-5 w-5" />
                            Gợi ý
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-blue-800">
                        <p>
                            💡 <strong>File name:</strong> Nên sử dụng tên ngắn gọn, dễ nhớ. Ví dụ: robot-programming.md
                        </p>
                        <p>
                            💡 <strong>Theme:</strong> Mỗi theme có phong cách thiết kế khác nhau. Xem trước tại{' '}
                            <a
                                href="https://sli.dev/themes/gallery.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-600"
                            >
                                Slidev Themes
                            </a>
                        </p>
                        <p>
                            💡 <strong>Tags:</strong> Giúp phân loại và tìm kiếm bài thuyết trình dễ dàng hơn
                        </p>
                        <p>
                            💡 <strong>Sau khi tạo:</strong> Bạn cần thêm nội dung vào file .md trong thư mục{' '}
                            <code className="rounded bg-blue-100 px-1 py-0.5">apps/slidev/data/templates/</code>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </PresentationLayout>
    )
}

export default CreatePresentationPage
