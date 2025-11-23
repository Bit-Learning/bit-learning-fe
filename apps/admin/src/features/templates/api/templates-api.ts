import api from '@/shared/api/api'
import { type Template } from '../data/schema'

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * Paginated response
 */
interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * Get all templates (paginated)
 */
export async function getTemplates(params: {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}) {
  const { page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = params
  const response = await api.get<ApiResponse<PagedResponse<Template>>>(
    '/slides/templates',
    {
      params: { page, size, sortBy, sortDir },
    }
  )
  return response.data.data
}

/**
 * Get all templates (non-paginated)
 */
export async function getAllTemplates() {
  const response = await api.get<ApiResponse<Template[]>>(
    '/slides/templates/all'
  )
  return response.data.data
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: number) {
  const response = await api.get<ApiResponse<Template>>(
    `/slides/templates/${id}`
  )
  return response.data.data
}

/**
 * Create new template
 */
export async function createTemplate(data: {
  name: string
  description?: string
  templateFile: File
  thumbnailFile?: File
}) {
  const formData = new FormData()
  formData.append('name', data.name)
  if (data.description) {
    formData.append('description', data.description)
  }
  formData.append('templateFile', data.templateFile)
  if (data.thumbnailFile) {
    formData.append('thumbnailFile', data.thumbnailFile)
  }

  const response = await api.post<ApiResponse<Template>>(
    '/slides/templates',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data.data
}

/**
 * Update template
 */
export async function updateTemplate(
  id: number,
  data: {
    name?: string
    description?: string
    templateFile?: File
    thumbnailFile?: File
  }
) {
  const formData = new FormData()
  if (data.name) {
    formData.append('name', data.name)
  }
  if (data.description) {
    formData.append('description', data.description)
  }
  if (data.templateFile) {
    formData.append('templateFile', data.templateFile)
  }
  if (data.thumbnailFile) {
    formData.append('thumbnailFile', data.thumbnailFile)
  }

  const response = await api.put<ApiResponse<Template>>(
    `/templates/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data.data
}

/**
 * Delete template
 */
export async function deleteTemplate(id: number) {
  const response = await api.delete<ApiResponse<void>>(
    `/slides/templates/${id}`
  )
  return response.data
}

/**
 * Delete multiple templates
 */
export async function deleteTemplates(ids: number[]) {
  const promises = ids.map((id) => deleteTemplate(id))
  return Promise.all(promises)
}
