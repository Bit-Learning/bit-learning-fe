import type { AxiosResponse } from 'axios'
import api from '@/shared/api/api'
import type {
  TemplateRequest,
  TemplateResponse,
  TemplatesListResponse,
} from '../types/template.types'

const TEMPLATE_BASE = '/products/templates'

// Get all templates (admin only)
export function getAllTemplates(): Promise<
  AxiosResponse<TemplatesListResponse>
> {
  return api.get(TEMPLATE_BASE)
}

// Get active templates only
export function getActiveTemplates(): Promise<
  AxiosResponse<TemplatesListResponse>
> {
  return api.get(`${TEMPLATE_BASE}/active`)
}

// Get template by ID
export function getTemplateById(
  id: number
): Promise<AxiosResponse<TemplateResponse>> {
  return api.get(`${TEMPLATE_BASE}/${id}`)
}

// Create template (admin only)
export function createTemplate(
  data: TemplateRequest
): Promise<AxiosResponse<TemplateResponse>> {
  return api.post(TEMPLATE_BASE, data)
}

// Update template (admin only)
export function updateTemplate(
  id: number,
  data: TemplateRequest
): Promise<AxiosResponse<TemplateResponse>> {
  return api.put(`${TEMPLATE_BASE}/${id}`, data)
}

// Toggle template active status (admin only)
export function toggleTemplateStatus(
  id: number
): Promise<AxiosResponse<TemplateResponse>> {
  return api.patch(`${TEMPLATE_BASE}/${id}/toggle-status`)
}

// Delete template (admin only)
export function deleteTemplate(
  id: number
): Promise<AxiosResponse<{ status: number; message: string }>> {
  return api.delete(`${TEMPLATE_BASE}/${id}`)
}

// Search templates
export function searchTemplates(
  keyword: string
): Promise<AxiosResponse<TemplatesListResponse>> {
  return api.get(`${TEMPLATE_BASE}/search`, {
    params: { keyword },
  })
}

// Rebuild template preview (admin only)
export function rebuildTemplatePreview(
  id: number
): Promise<AxiosResponse<TemplateResponse>> {
  return api.post(`${TEMPLATE_BASE}/${id}/rebuild-preview`)
}
