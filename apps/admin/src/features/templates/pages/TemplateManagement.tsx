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
      toast.success('Template created successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create template')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplateRequest }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      toast.success('Template updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      setIsEditOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update template')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success('Template deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete template')
    },
  })

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: toggleTemplateStatus,
    onSuccess: () => {
      toast.success('Template status updated!')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle status')
    },
  })

  // Rebuild preview mutation
  const rebuildMutation = useMutation({
    mutationFn: rebuildTemplatePreview,
    onSuccess: () => {
      toast.success(
        'Template preview rebuild initiated! Check back in a few minutes.'
      )
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to rebuild preview')
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
        'Are you sure you want to delete this template? This action cannot be undone.'
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
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Template Management</h1>
          <p className='text-muted-foreground'>
            Manage presentation templates - CRUD operations
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className='mr-2 h-4 w-4' />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                ⚠️ IMPORTANT: Ensure markdown file exists in
                classpath:static/markdown/ before creating!
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
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-muted-foreground text-sm'>Price</p>
                <p className='text-lg font-semibold'>
                  {template.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
              </div>

              {template.previewUrl && (
                <div>
                  <p className='text-muted-foreground text-sm'>Preview URL</p>
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
                    Preview
                  </Button>
                )}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => rebuildMutation.mutate(template.id)}
                  disabled={rebuildMutation.isPending}
                  title='Rebuild template preview'
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
                  Toggle
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleEdit(template)}
                >
                  <Pencil className='mr-1 h-4 w-4' />
                  Edit
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className='mr-1 h-4 w-4' />
                  Delete
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
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update template information</DialogDescription>
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
              ✕ Close
            </button>
            <h3 className='mb-4 text-xl font-bold'>
              Preview: {previewTemplate.name.replace(/_/g, ' ')}
            </h3>
            {previewTemplate.previewUrl ? (
              <iframe
                src={previewTemplate.previewUrl}
                className='h-[70vh] w-full rounded border'
                title={`Preview of ${previewTemplate.name}`}
              />
            ) : (
              <p className='text-muted-foreground'>No preview available</p>
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
        <Label htmlFor='name'>Template Name *</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder='e.g., business_proposal or math.md'
        />
        <p className='text-muted-foreground mt-1 text-xs'>
          Should match the markdown filename (with or without .md extension)
        </p>
      </div>

      <div>
        <Label htmlFor='price'>Price (VND) *</Label>
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
        <Label htmlFor='previewUrl'>Preview URL (Optional)</Label>
        <Input
          id='previewUrl'
          value={formData.previewUrl}
          onChange={(e) =>
            setFormData({ ...formData, previewUrl: e.target.value })
          }
          placeholder='Leave empty for auto-build'
        />
        <p className='text-muted-foreground mt-1 text-xs'>
          💡 <strong>Leave empty to auto-build preview</strong>. The system will
          automatically build the template from the markdown file and host it in
          MinIO. Or provide a custom URL.
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
        <Label htmlFor='isActive'>Active (visible to users)</Label>
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className='w-full'>
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {isLoading ? 'Saving...' : 'Save Template'}
      </Button>
    </div>
  )
}
