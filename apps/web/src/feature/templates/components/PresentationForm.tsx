import { SlidevPresentation } from '../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/Button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/Form'
import { Input } from '@workspace/ui/components/Input'
import { Textarea } from '@workspace/ui/components/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/update/select'
import { Upload, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const presentationSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    fileName: z
        .string()
        .min(1, 'File name is required')
        .regex(/^[a-z0-9-]+\.md$/, 'Must be lowercase with hyphens and end with .md'),
    theme: z.string().min(1, 'Theme is required'),
    tags: z.string(),
    thumbnail: z.string().optional(),
})

type PresentationFormData = z.infer<typeof presentationSchema>

interface PresentationFormProps {
    presentation?: SlidevPresentation
    onSubmit: (data: Partial<SlidevPresentation>) => void
    onCancel: () => void
    isLoading?: boolean
}

export const PresentationForm = ({ presentation, onSubmit, onCancel, isLoading }: PresentationFormProps) => {
    const [thumbnailPreview, setThumbnailPreview] = useState<string>(presentation?.thumbnail || '')

    const form = useForm<PresentationFormData>({
        resolver: zodResolver(presentationSchema),
        defaultValues: {
            title: presentation?.title || '',
            description: presentation?.description || '',
            fileName: presentation?.fileName || '',
            theme: presentation?.theme || 'default',
            tags: presentation?.tags?.join(', ') || '',
            thumbnail: presentation?.thumbnail || '',
        },
    })

    const handleSubmit = (data: PresentationFormData) => {
        const formattedData: Partial<SlidevPresentation> = {
            ...data,
            id: presentation?.id || data.fileName.replace('.md', ''),
            tags: data.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean),
            createdAt: presentation?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        onSubmit(formattedData)
    }

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        form.setValue('thumbnail', value)
        setThumbnailPreview(value)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tiêu đề</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tiêu đề bài thuyết trình" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Mô tả chi tiết về bài thuyết trình"
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* File Name */}
                <FormField
                    control={form.control}
                    name="fileName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên file</FormLabel>
                            <FormControl>
                                <Input placeholder="my-presentation.md" disabled={!!presentation} {...field} />
                            </FormControl>
                            <FormDescription>Sử dụng chữ thường, gạch ngang và phải kết thúc bằng .md</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Theme */}
                <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn theme" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="seriph">Seriph</SelectItem>
                                    <SelectItem value="apple-basic">Apple Basic</SelectItem>
                                    <SelectItem value="shibainu">Shibainu</SelectItem>
                                    <SelectItem value="geist">Geist</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Tags */}
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <Input placeholder="STEM, Robot, Programming (phân cách bằng dấu phẩy)" {...field} />
                            </FormControl>
                            <FormDescription>Nhập các tag phân cách bằng dấu phẩy</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Thumbnail */}
                <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ảnh thumbnail</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="/presentations/image.jpg"
                                        {...field}
                                        onChange={handleThumbnailChange}
                                    />
                                    {thumbnailPreview && (
                                        <div className="relative">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Preview"
                                                className="h-32 w-full rounded object-cover"
                                                onError={() => setThumbnailPreview('')}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    form.setValue('thumbnail', '')
                                                    setThumbnailPreview('')
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>URL của ảnh thumbnail hoặc đường dẫn trong thư mục public</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Actions */}
                <div className="flex gap-3">
                    <Button type="submit" isDisabled={isLoading} className="flex-1">
                        {isLoading ? (
                            <>
                                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                {presentation ? 'Cập nhật' : 'Tạo mới'}
                            </>
                        )}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                </div>
            </form>
        </Form>
    )
}
