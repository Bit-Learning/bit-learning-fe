import { useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Separator } from '@workspace/ui/components/Separator'
import { ArrowLeft, Edit, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PresentationForm } from '../components/PresentationForm'
import { slidevPresentations } from '../data/slidev-presentations'
import { usePresentations } from '../hooks/usePresentations'
import PresentationLayout from '../layout'
import { SlidevPresentation } from '../types'

const EditPresentationPage = () => {
    const navigate = useNavigate()
    const params = useParams({ from: '/templates/slidev/$id/edit' })
    const { updatePresentation, isLoading } = usePresentations()
    const [presentation, setPresentation] = useState<SlidevPresentation | null>(null)
    const [error, setError] = useState<string>('')
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        // Find presentation by ID
        const found = slidevPresentations.find(p => p.id === params.id)
        if (found) {
            setPresentation(found)
        } else {
            setNotFound(true)
        }
    }, [params.id])

    const handleSubmit = async (data: Partial<SlidevPresentation>) => {
        if (!presentation) return

        setError('')
        const result = await updatePresentation(presentation.id, data)

        if (result.success) {
            alert('✅ Cập nhật bài thuyết trình thành công!')
            navigate({ to: '/templates/slidev' })
        } else {
            setError(result.error || 'Có lỗi xảy ra')
        }
    }

    const handleCancel = () => {
        navigate({ to: '/templates/slidev' })
    }

    if (notFound) {
        return (
            <PresentationLayout>
                <div className="flex min-h-[400px] flex-col items-center justify-center">
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Không tìm thấy bài thuyết trình</h2>
                        <p className="mb-6 text-gray-600">Bài thuyết trình với ID "{params.id}" không tồn tại</p>
                        <Button onClick={() => navigate({ to: '/templates/slidev' })}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </PresentationLayout>
        )
    }

    if (!presentation) {
        return (
            <PresentationLayout>
                <div className="flex min-h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </PresentationLayout>
        )
    }

    return (
        <PresentationLayout>
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" onClick={handleCancel} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa bài thuyết trình</h1>
                    <p className="text-muted-foreground mt-1">Cập nhật thông tin cho "{presentation.title}"</p>
                </div>

                <Separator className="mb-6" />

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
                        <p className="text-sm text-red-800">❌ {error}</p>
                    </div>
                )}

                {/* Main Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Thông tin bài thuyết trình
                        </CardTitle>
                        <CardDescription>Chỉnh sửa các thông tin của bài thuyết trình</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PresentationForm
                            presentation={presentation}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </PresentationLayout>
    )
}

export default EditPresentationPage
