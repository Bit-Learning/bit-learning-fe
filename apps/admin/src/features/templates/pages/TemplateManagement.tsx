import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Power,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  rebuildTemplatePreview,
} from '../api/TemplateService'
import type { Template, TemplateRequest } from '../types/template.types'

export function TemplateManagement() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )
  const [formData, setFormData] = useState<TemplateRequest>({
    name: '',
    price: 0,
    previewUrl: '',
    isActive: true,
  })
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  // Fetch all templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: getAllTemplates,
  })

  const templates = templatesData?.data.data || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast.success('Tạo mẫu thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể tạo mẫu')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplateRequest }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      toast.success('Cập nhật mẫu thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      setIsEditOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật mẫu')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success('Xóa mẫu thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa mẫu')
    },
  })

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: toggleTemplateStatus,
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái mẫu!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể đổi trạng thái')
    },
  })

  // Rebuild preview mutation
  const rebuildMutation = useMutation({
    mutationFn: rebuildTemplatePreview,
    onSuccess: () => {
      toast.success(
        'Đã bắt đầu xây dựng lại preview! Kiểm tra lại sau vài phút.'
      )
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể rebuild preview')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      previewUrl: '',
      isActive: true,
    })
    setSelectedTemplate(null)
  }

  const handleCreate = () => {
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate.id, data: formData })
    }
  }

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      price: template.price,
      previewUrl: template.previewUrl || '',
      isActive: template.isActive,
    })
    setIsEditOpen(true)
  }

  const handleDelete = (id: number) => {
    if (
      confirm(
        'Bạn có chắc chắn muốn xóa mẫu này? Hành động này không thể hoàn tác.'
      )
    ) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold'>Quản lý mẫu sản phẩm</h3>
          <p className='text-muted-foreground'>
            Quản lý các mẫu markdown - CRUD operations
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className='mr-2 h-4 w-4' />
              Tạo mẫu mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo mẫu sản phẩm mới</DialogTitle>
              <DialogDescription>
                ⚠️ LƯU Ý: Đảm bảo file markdown tồn tại trong
                classpath:static/markdown/ trước khi tạo!
              </DialogDescription>
            </DialogHeader>
            <TemplateForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {templates.map((template: Template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>
                    {template.name.replace(/_/g, ' ')}
                  </CardTitle>
                  <CardDescription>ID: {template.id}</CardDescription>
                </div>
                <Badge variant={template.isActive ? 'default' : 'secondary'}>
                  {template.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-muted-foreground text-sm'>Giá</p>
                <p className='text-lg font-semibold'>
                  {template.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
              </div>

              {template.previewUrl && (
                <div>
                  <p className='text-muted-foreground text-sm'>URL xem trước</p>
                  <p className='truncate text-sm'>{template.previewUrl}</p>
                </div>
              )}

              <div className='flex flex-wrap gap-2'>
                {template.previewUrl && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className='mr-1 h-4 w-4' />
                    Xem
                  </Button>
                )}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => rebuildMutation.mutate(template.id)}
                  disabled={rebuildMutation.isPending}
                  title='Xây dựng lại preview'
                >
                  <RefreshCw className='mr-1 h-4 w-4' />
                  Rebuild
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toggleMutation.mutate(template.id)}
                  disabled={toggleMutation.isPending}
                >
                  <Power className='mr-1 h-4 w-4' />
                  Bật/Tắt
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleEdit(template)}
                >
                  <Pencil className='mr-1 h-4 w-4' />
                  Sửa
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className='mr-1 h-4 w-4' />
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mẫu</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin mẫu sản phẩm
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className='bg-background relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg p-4'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewTemplate(null)}
              className='absolute top-4 right-4 z-10 rounded-full bg-black/50 px-3 py-1 text-white hover:bg-black/70'
            >
              ✕ Đóng
            </button>
            <h3 className='mb-4 text-xl font-bold'>
              Xem trước: {previewTemplate.name.replace(/_/g, ' ')}
            </h3>
            {previewTemplate.previewUrl ? (
              <iframe
                src={previewTemplate.previewUrl}
                className='h-[70vh] w-full rounded border'
                title={`Xem trước ${previewTemplate.name}`}
              />
            ) : (
              <p className='text-muted-foreground'>Không có bản xem trước</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Template Form Component
function TemplateForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}: {
  formData: TemplateRequest
  setFormData: (data: TemplateRequest) => void
  onSubmit: () => void
  isLoading: boolean
}) {
  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='name'>Tên mẫu *</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder='VD: business_proposal hoặc math.md'
        />
        <p className='text-muted-foreground mt-1 text-xs'>
          Phải khớp với tên file markdown (có hoặc không có đuôi .md)
        </p>
      </div>

      <div>
        <Label htmlFor='price'>Giá (VND) *</Label>
        <Input
          id='price'
          type='number'
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
          }
          placeholder='0'
        />
      </div>

      <div>
        <Label htmlFor='previewUrl'>URL xem trước (Tùy chọn)</Label>
        <Input
          id='previewUrl'
          value={formData.previewUrl}
          onChange={(e) =>
            setFormData({ ...formData, previewUrl: e.target.value })
          }
          placeholder='Để trống để tự động tạo'
        />
        <p className='text-muted-foreground mt-1 text-xs'>
          💡 <strong>Để trống để tự động tạo preview</strong>. Hệ thống sẽ tự
          động build mẫu từ file markdown và lưu trữ trong MinIO. Hoặc cung cấp
          URL tùy chỉnh.
        </p>
      </div>

      <div className='flex items-center space-x-2'>
        <Switch
          id='isActive'
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isActive: checked })
          }
        />
        <Label htmlFor='isActive'>Hoạt động (hiển thị cho người dùng)</Label>
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className='w-full'>
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {isLoading ? 'Đang lưu...' : 'Lưu mẫu'}
      </Button>
    </div>
  )
}
