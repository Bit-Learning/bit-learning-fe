import { useTemplates } from '@/feature/aichat/hooks/useTemplates'
import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import { ScrollArea } from '@workspace/ui/components/ScrollArea'
import { FileText, Loader2 } from 'lucide-react'
import React from 'react'

interface TemplateGalleryProps {
    onSelectTemplate: (templateId: number, templateName: string) => void
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
    const { data: templates, isLoading, error } = useTemplates()

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
                            {/* Template thumbnail or icon */}
                            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                                {template.thumbnailUrl ? (
                                    <img
                                        src={template.thumbnailUrl}
                                        alt={template.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <FileText className="h-16 w-16 text-blue-600" />
                                )}
                            </div>

                            {/* Template info */}
                            <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{template.name}</h3>

                            {/* Description */}
                            {template.description && (
                                <p className="mb-2 line-clamp-2 text-xs text-gray-500">
                                    {template.description}
                                </p>
                            )}

                            {/* Action button */}
                            <div className="mt-auto flex items-center justify-end">
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
