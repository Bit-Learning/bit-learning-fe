import { z } from 'zod'

/**
 * Template schema for validation
 */
export const templateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

/**
 * Template type inferred from schema
 */
export type Template = z.infer<typeof templateSchema>

/**
 * Template request schema for create/update
 */
export const templateRequestSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(200, 'Tên không được vượt quá 200 ký tự'),
  description: z.string().max(2000, 'Mô tả không được vượt quá 2000 ký tự').optional().nullable(),
  templateFile: z.instanceof(File, { message: 'File mẫu là bắt buộc' }).optional(),
  thumbnailFile: z.instanceof(File, { message: 'File ảnh thu nhỏ' }).optional(),
})

export type TemplateRequest = z.infer<typeof templateRequestSchema>
