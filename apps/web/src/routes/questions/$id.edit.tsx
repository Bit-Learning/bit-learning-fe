import EditQuestion from '@/feature/matrix/page/EditQuestion'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

console.log('[Route] $id.edit.tsx loaded!')

export const Route = createFileRoute('/questions/$id/edit')({
    component: () => {
        console.log('[Route] Rendering EditQuestion component')
        return (
            <ProtectedRoute>
                <EditQuestion />
            </ProtectedRoute>
        )
    },
})
