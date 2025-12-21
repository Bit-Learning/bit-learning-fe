export interface CreateSectionRequest {
    courseId: number
    title: string
    description?: string
    isPublished?: boolean
    orderIndex: number
}

export interface UpdateSectionRequest {
    title: string
    description?: string
    isPublished?: boolean
    orderIndex: number
}
