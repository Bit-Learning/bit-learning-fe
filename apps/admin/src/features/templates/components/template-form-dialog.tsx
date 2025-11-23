import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createTemplate } from '../api/templates-api'
import { templateRequestSchema, type TemplateRequest } from '../data/schema'

export function TemplateFormDialog() {
  const [open, setOpen] = useState(false)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<TemplateRequest>({
    resolver: zodResolver(templateRequestSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast.success('Đã tạo mẫu thành công')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setOpen(false)
      form.reset()
      setTemplateFile(null)
      setThumbnailFile(null)
    },
    onError: () => {
      toast.error('Không thể tạo mẫu')
    },
  })

  const onSubmit = (data: TemplateRequest) => {
    if (!templateFile) {
      toast.error('Vui lòng chọn file mẫu')
      return
    }

    createMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      templateFile,
      thumbnailFile: thumbnailFile || undefined,
    })
  }

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTemplateFile(file)
    }
  }

  const handleThumbnailFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Tạo mẫu mới
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Tạo mẫu slide mới</DialogTitle>
          <DialogDescription>
            Điền thông tin và tải lên file mẫu slide để tạo mới.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên mẫu *</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tên mẫu...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Nhập mô tả về mẫu...'
                      className='resize-none'
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>File mẫu *</FormLabel>
              <FormControl>
                <div className='flex items-center gap-2'>
                  <Input
                    type='file'
                    onChange={handleTemplateFileChange}
                    accept='.ppt,.pptx,.pdf'
                    className='cursor-pointer'
                  />
                  {templateFile && (
                    <span className='text-muted-foreground text-sm'>
                      {templateFile.name}
                    </span>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Hỗ trợ các định dạng: PPT, PPTX, PDF
              </FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Ảnh thu nhỏ</FormLabel>
              <FormControl>
                <div className='flex items-center gap-2'>
                  <Input
                    type='file'
                    onChange={handleThumbnailFileChange}
                    accept='image/*'
                    className='cursor-pointer'
                  />
                  {thumbnailFile && (
                    <span className='text-muted-foreground text-sm'>
                      {thumbnailFile.name}
                    </span>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Ảnh đại diện cho mẫu (JPG, PNG, WEBP)
              </FormDescription>
            </FormItem>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo mẫu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
