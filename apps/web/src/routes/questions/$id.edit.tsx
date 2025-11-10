import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@workspace/ui/components/Card'

function QuestionEditPlaceholder() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Card>
                <CardContent className="py-16 text-center">
                    <h1 className="mb-4 text-2xl font-bold">Chỉnh sửa câu hỏi</h1>
                    <p className="text-gray-600">Tính năng đang được phát triển...</p>
                </CardContent>
            </Card>
        </div>
    )
}

export const Route = createFileRoute('/questions/$id/edit')({
    component: () => (
        <ProtectedRoute>
            <QuestionEditPlaceholder />
        </ProtectedRoute>
    ),
})
