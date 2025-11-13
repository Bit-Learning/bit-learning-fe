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
import { Checkbox } from '@workspace/ui/components/Checkbox'
import { Loader2, Presentation, Sparkles, FileDown } from 'lucide-react'
import React from 'react'
import { toast } from '@workspace/ui/components/Sonner'
import { TemplateGallery } from './TemplateGallery'
import { useSlideGeneration } from '../hooks/useSlideGeneration'
import type { CollectionName } from '../type'

interface SlideGenerationPanelProps {
    chatContext?: string
}

export const SlideGenerationPanel: React.FC<SlideGenerationPanelProps> = ({ chatContext }) => {
    const [topic, setTopic] = React.useState('')
    const [grade, setGrade] = React.useState<number>(10)
    const [slideCount, setSlideCount] = React.useState<number>(5)
    const [collectionName, setCollectionName] = React.useState<CollectionName>('sgk_tin_kntt')
    const [includeExamples, setIncludeExamples] = React.useState(true)
    const [includeExercises, setIncludeExercises] = React.useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = React.useState<number | null>(null)
    const [selectedTemplateName, setSelectedTemplateName] = React.useState<string>('')
    const [showTemplates, setShowTemplates] = React.useState(false)

    const { generateSlides, isGenerating } = useSlideGeneration()

    // Auto-fill topic from chat context if available
    React.useEffect(() => {
        if (chatContext && !topic) {
            // Use the first meaningful user message as topic
            const lines = chatContext.split('\n').filter(line => line.trim().length > 0)
            if (lines.length > 0 && lines[0]) {
                setTopic(lines[0].substring(0, 100)) // Limit to 100 chars
            }
        }
    }, [chatContext])

    const handleSelectTemplate = (templateId: number, templateName: string) => {
        setSelectedTemplateId(templateId)
        setSelectedTemplateName(templateName)
        setShowTemplates(false)
        toast.success({
            title: `Đã chọn template: ${templateName}`
        })
    }

    const handleGenerateSlide = () => {
        if (!topic.trim()) {
            toast.error({
                title: 'Vui lòng nhập chủ đề'
            })
            return
        }

        if (!selectedTemplateId) {
            toast.error({
                title: 'Vui lòng chọn template'
            })
            return
        }

        generateSlides({
            templateId: selectedTemplateId,
            request: {
                topic: topic.trim(),
                grade,
                slide_count: slideCount,
                format: 'json',
                include_examples: includeExamples,
                include_exercises: includeExercises,
                collection_name: collectionName
            }
        })

        // Optionally reset form after generation
        // setTopic('')
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
        <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
            <div className="flex items-center gap-2">
                <Presentation className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Tạo Slide AI</h3>
            </div>

            <div className="space-y-4">
                {/* Topic Input */}
                <div className="space-y-2">
                    <Label htmlFor="topic">
                        Chủ đề <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="topic"
                        placeholder="Ví dụ: Lập trình Python, Vòng lặp trong C++"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        disabled={isGenerating}
                    />
                    <p className="text-xs text-gray-500">Nhập chủ đề cho bài thuyết trình</p>
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                    <Label>Template</Label>
                    {selectedTemplateName ? (
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-sm font-medium">{selectedTemplateName}</span>
                            <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                                Đổi
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => setShowTemplates(true)}>
                            Chọn template
                        </Button>
                    )}
                </div>

                {/* Grade Selection */}
                <div className="space-y-2">
                    <Label htmlFor="grade">Cấp độ lớp</Label>
                    <Select
                        value={grade.toString()}
                        onValueChange={value => setGrade(Number(value))}
                        disabled={isGenerating}
                    >
                        <SelectTrigger id="grade">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 3).map(g => (
                                <SelectItem key={g} value={g.toString()}>
                                    Lớp {g}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Nội dung sẽ phù hợp với cấp độ này (3-12)</p>
                </div>

                {/* Slide Count */}
                <div className="space-y-2">
                    <Label htmlFor="slideCount">Số lượng slide</Label>
                    <Input
                        id="slideCount"
                        type="number"
                        min={1}
                        max={20}
                        value={slideCount}
                        onChange={e => setSlideCount(Number(e.target.value))}
                        disabled={isGenerating}
                    />
                    <p className="text-xs text-gray-500">Số slide muốn tạo (1-20)</p>
                </div>

                {/* Collection Selection */}
                <div className="space-y-2">
                    <Label htmlFor="collection">Nguồn kiến thức</Label>
                    <Select
                        value={collectionName}
                        onValueChange={(value: CollectionName) => setCollectionName(value)}
                        disabled={isGenerating}
                    >
                        <SelectTrigger id="collection">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sgk_tin_kntt">SGK Tin học - Kết nối tri thức</SelectItem>
                            <SelectItem value="sgk_tin_cd">SGK Tin học - Cánh diều</SelectItem>
                            <SelectItem value="sgk_tin_ctst">SGK Tin học - Chân trời sáng tạo</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Chọn nguồn sách giáo khoa</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <Label>Tùy chọn</Label>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="includeExamples"
                            isSelected={includeExamples}
                            onChange={setIncludeExamples}
                            isDisabled={isGenerating}
                        />
                        <Label htmlFor="includeExamples" className="cursor-pointer text-sm font-normal">
                            Bao gồm ví dụ
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="includeExercises"
                            isSelected={includeExercises}
                            onChange={setIncludeExercises}
                            isDisabled={isGenerating}
                        />
                        <Label htmlFor="includeExercises" className="cursor-pointer text-sm font-normal">
                            Bao gồm bài tập
                        </Label>
                    </div>
                </div>

                {/* Info Box */}
                {chatContext && (
                    <div className="rounded-md bg-blue-50 p-3">
                        <div className="flex gap-2">
                            <Sparkles className="h-4 w-4 flex-shrink-0 text-blue-600" />
                            <div>
                                <p className="text-xs font-medium text-blue-900">AI sẽ tạo nội dung tự động</p>
                                <p className="mt-1 text-xs text-blue-700">
                                    Nội dung chat của bạn sẽ được sử dụng làm ngữ cảnh để AI tạo slide phù hợp hơn
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <Button
                className="mt-auto w-full"
                onClick={handleGenerateSlide}
                isDisabled={isGenerating || !topic.trim() || !selectedTemplateId}
                size="lg"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo slide...
                    </>
                ) : (
                    <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Tạo & Tải xuống Slide
                    </>
                )}
            </Button>

            {!topic.trim() && !isGenerating && (
                <p className="text-center text-xs text-gray-500">Nhập chủ đề để bắt đầu</p>
            )}
        </div>
    )
}
