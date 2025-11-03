import { ApiResponse } from '@/shared/api/api.type'

export type PresentationType = 'SLIDEV' | 'REVEALJS' | 'MARKDOWN_RAW' | 'PPTX'

export type Presentation = {
    id: number
    name: string
    price: number
    isActive: boolean
    type: PresentationType
    storagePath: string
    publicUrl: string
    folderKey: string
    revision: number
    description?: string | null
    ownerId: number
    processing: boolean

    createdAt?: string
    updatedAt?: string
}

export type CreatePresentationRequest = {
    name: string
    description: string
    type: PresentationType
    templateUrl: string
    ownerId: number
}

export type CreatePresentationResponse = ApiResponse<Presentation>
