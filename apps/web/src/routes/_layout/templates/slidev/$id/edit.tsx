import { PresentationForm } from '@/feature/templates/components/PresentationForm'
import { usePresentations } from '@/feature/templates/hooks/usePresentations'
import { SlidevPresentation } from '@/feature/templates/types'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/Card'

export const Route = createFileRoute('/_layout/templates/slidev/$id/edit')({
    component: EditPresentationPage,
})

function EditPresentationPage() {
    const navigate = useNavigate()
    const params = useParams({ from: '/_layout/templates/slidev/$id/edit' })
    const { presentations, updatePresentation } = usePresentations()

    const presentation = presentations.find(p => p.id === params.id)

    if (!presentation) {
        return (
            <div className="container mx-auto max-w-3xl py-8">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Presentation not found</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleSubmit = (data: Partial<SlidevPresentation>) => {
        updatePresentation(params.id, {
            title: data.title,
            description: data.description,
            fileName: data.fileName,
            theme: data.theme,
            thumbnail: data.thumbnail,
            tags: data.tags,
        })
        navigate({ to: '/templates/slidev' })
    }

    const handleCancel = () => {
        navigate({ to: '/templates/slidev' })
    }

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Presentation</CardTitle>
                </CardHeader>
                <CardContent>
                    <PresentationForm presentation={presentation} onSubmit={handleSubmit} onCancel={handleCancel} />
                </CardContent>
            </Card>
        </div>
    )
}
