import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { useCreatePresentation } from '@/feature/presentations/hooks/usePresentations'
import { PresentationType } from '@/feature/presentations/types/presentation.types'
import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/update/input'
import { Label } from '@workspace/ui/components/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/update/select'
import { Textarea } from '@workspace/ui/components/Textarea'
import { Loader2, Presentation, Sparkles } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { TemplateGallery } from './TemplateGallery'

interface SlideGenerationPanelProps {
    chatContext?: string
}

export const SlideGenerationPanel: React.FC<SlideGenerationPanelProps> = ({ chatContext }) => {
    const [name, setName] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [type, setType] = React.useState<PresentationType>('SLIDEV')
    const [selectedTemplateId, setSelectedTemplateId] = React.useState<number | null>(null)
    const [selectedTemplateName, setSelectedTemplateName] = React.useState<string>('')
    const [showTemplates, setShowTemplates] = React.useState(false)

    const { userInfo } = useSelector(selectAuthStateInfo)
    const createMutation = useCreatePresentation()

    const handleSelectTemplate = (templateId: number, templateName: string) => {
        setSelectedTemplateId(templateId)
        setSelectedTemplateName(templateName)
        setShowTemplates(false)
        toast.success(`Đã chọn template: ${templateName}`)
    }

    const handleGenerateSlide = async () => {
        if (!name.trim()) {
            toast.error('Vui lòng nhập tên slide')
            return
        }

        if (!selectedTemplateId) {
            toast.error('Vui lòng chọn template')
            return
        }

        if (!userInfo?.id) {
            toast.error('Vui lòng đăng nhập')
            return
        }

        try {
            const templateUrl = `template-${selectedTemplateId}.zip` // Adjust based on actual API requirements

            await createMutation.mutateAsync({
                name,
                description: description || chatContext || 'Slide được tạo từ AI chatbot',
                type,
                templateUrl,
                ownerId: userInfo.id,
            })

            toast.success('Tạo slide thành công!')
            setName('')
            setDescription('')
            setSelectedTemplateId(null)
            setSelectedTemplateName('')
        } catch (error) {
            toast.error('Không thể tạo slide. Vui lòng thử lại.')
            console.error('Create slide error:', error)
        }
    }

    if (showTemplates) {
        return (
            <div className="flex h-full flex-col">
                <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Chọn Template</h3>
                        <Button variant="outline" size="sm" onClick={() => setShowTemplates(false)}>
                            Quay lại
                        </Button>
                    </div>
                </div>
                <TemplateGallery onSelectTemplate={handleSelectTemplate} />
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
                <Presentation className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Tạo Slide</h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="slideName">Tên slide</Label>
                    <Input
                        id="slideName"
                        placeholder="Nhập tên slide..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slideDescription">Mô tả (tùy chọn)</Label>
                    <Textarea
                        id="slideDescription"
                        placeholder="Nhập mô tả slide..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slideType">Loại slide</Label>
                    <Select value={type} onValueChange={(value: PresentationType) => setType(value)}>
                        <SelectTrigger id="slideType">
                            <SelectValue placeholder="Chọn loại slide" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SLIDEV">Slidev</SelectItem>
                            <SelectItem value="REVEALJS">Reveal.js</SelectItem>
                            <SelectItem value="MARKDOWN_RAW">Markdown</SelectItem>
                            <SelectItem value="PPTX">PowerPoint</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Template</Label>
                    {selectedTemplateName ? (
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-sm">{selectedTemplateName}</span>
                            <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                                Đổi template
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => setShowTemplates(true)}>
                            Chọn template
                        </Button>
                    )}
                </div>

                {chatContext && (
                    <div className="rounded-md bg-blue-50 p-3">
                        <p className="text-xs text-blue-900">
                            <Sparkles className="mr-1 inline h-3 w-3" />
                            Nội dung chat sẽ được sử dụng làm ngữ cảnh cho slide
                        </p>
                    </div>
                )}
            </div>

            <Button
                className="mt-auto w-full"
                onClick={handleGenerateSlide}
                disabled={createMutation.isPending || !name.trim() || !selectedTemplateId}
            >
                {createMutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Tạo slide
                    </>
                )}
            </Button>
        </div>
    )
}
