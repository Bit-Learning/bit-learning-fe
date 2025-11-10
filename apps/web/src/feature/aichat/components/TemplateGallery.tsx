import { usePresentationTemplates } from '@/feature/presentations/hooks/usePresentations'
import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import { ScrollArea } from '@workspace/ui/components/ScrollArea'
import { FileText, Loader2 } from 'lucide-react'
import React from 'react'

interface TemplateGalleryProps {
    onSelectTemplate: (templateId: number, templateName: string) => void
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
    const [page] = React.useState(0)
    const [size] = React.useState(20)
    const { data: templates, isLoading, error } = usePresentationTemplates(page, size)

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center text-red-600">
                <p>Không thể tải templates. Vui lòng thử lại sau.</p>
            </div>
        )
    }

    if (!templates || templates.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                <p>Không có template nào.</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map(template => (
                    <Card
                        key={template.id}
                        className="group cursor-pointer overflow-hidden border transition-all hover:shadow-lg"
                    >
                        <div className="flex flex-col p-4">
                            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                                <FileText className="h-16 w-16 text-blue-600" />
                            </div>
                            <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{template.name}</h3>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-sm font-bold text-blue-600">
                                    {template.price > 0 ? `${template.price.toLocaleString()} VND` : 'Miễn phí'}
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => onSelectTemplate(template.id, template.name)}
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    Chọn
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    )
}
