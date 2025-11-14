import { Button } from '@workspace/ui/components/Button'
import { Checkbox } from '@workspace/ui/components/Checkbox'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/update/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/update/select'
import { FileDown, Loader2, Sparkles } from 'lucide-react'
import React from 'react'
import { useSlideGeneration } from '../hooks/useSlideGeneration'
import type { CollectionName } from '../type'

interface SlideGenerationFormProps {
    templateId: number
    templateName: string
    defaultTopic?: string
}

/**
 * Form component for generating PowerPoint slides with AI
 *
 * Features:
 * - Topic input
 * - Grade selection (3-12)
 * - Slide count (1-20)
 * - Collection selection (textbook sources)
 * - Include examples toggle
 * - Include exercises toggle
 * - Auto-download generated PPTX file
 */
export const SlideGenerationForm: React.FC<SlideGenerationFormProps> = ({
    templateId,
    templateName,
    defaultTopic = '',
}) => {
    const [topic, setTopic] = React.useState(defaultTopic)
    const [grade, setGrade] = React.useState<number>(10)
    const [slideCount, setSlideCount] = React.useState<number>(5)
    const [collectionName, setCollectionName] = React.useState<CollectionName>('sgk_tin_kntt')
    const [includeExamples, setIncludeExamples] = React.useState(true)
    const [includeExercises, setIncludeExercises] = React.useState(false)

    const { generateSlides, isGenerating } = useSlideGeneration()

    const handleGenerate = () => {
        if (!topic.trim()) {
            return
        }

        generateSlides({
            templateId,
            request: {
                topic: topic.trim(),
                grade,
                slide_count: slideCount,
                format: 'json',
                include_examples: includeExamples,
                include_exercises: includeExercises,
                collection_name: collectionName,
            },
        })
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold">Tạo Slide với AI</h3>
                <p className="text-sm text-gray-600">
                    Template: <span className="font-medium">{templateName}</span>
                </p>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
                <Label htmlFor="topic">
                    Chủ đề <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="topic"
                    placeholder="Ví dụ: Python cơ bản, Vòng lặp trong lập trình"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    disabled={isGenerating}
                />
                <p className="text-xs text-gray-500">Nhập chủ đề chính cho bài thuyết trình</p>
            </div>

            {/* Grade Selection */}
            <div className="space-y-2">
                <Label htmlFor="grade">Lớp</Label>
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
                <p className="text-xs text-gray-500">Nội dung sẽ được điều chỉnh cho cấp lớp này (3-12)</p>
            </div>

            {/* Slide Count */}
            <div className="space-y-2">
                <Label htmlFor="slideCount">Số lượng Slide</Label>
                <Input
                    id="slideCount"
                    type="number"
                    min={1}
                    max={20}
                    value={slideCount}
                    onChange={e => setSlideCount(Number(e.target.value))}
                    disabled={isGenerating}
                />
                <p className="text-xs text-gray-500">Số slide cần tạo (1-20)</p>
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
                <p className="text-xs text-gray-500">Chọn nguồn sách giáo khoa cho nội dung</p>
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
                    >
                        Bao gồm ví dụ
                    </Checkbox>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="includeExercises"
                        isSelected={includeExercises}
                        onChange={setIncludeExercises}
                        isDisabled={isGenerating}
                    >
                        Bao gồm bài tập
                    </Checkbox>
                </div>
            </div>

            {/* Info Box */}
            <div className="rounded-md bg-blue-50 p-3 text-sm">
                <div className="flex gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <div className="space-y-1">
                        <p className="font-medium text-blue-900">Tạo slide bằng AI</p>
                        <p className="text-xs text-blue-700">
                            AI sẽ phân tích chủ đề và tạo nội dung giáo dục từ nguồn kiến thức đã chọn. Bài thuyết trình
                            sẽ tự động được tải xuống khi hoàn thành.
                        </p>
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <Button className="w-full" onClick={handleGenerate} isDisabled={isGenerating || !topic.trim()} size="lg">
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo slides...
                    </>
                ) : (
                    <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Tạo & Tải xuống Slides
                    </>
                )}
            </Button>

            {/* Help Text */}
            {!topic.trim() && <p className="text-center text-xs text-gray-500">Nhập chủ đề để bắt đầu</p>}
        </div>
    )
}
