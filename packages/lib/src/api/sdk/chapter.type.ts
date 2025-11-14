export interface ChapterResponse {
    id: number
    name: string
    chapterNo: number
    description?: string
    subjectId: number
    createdAt: string
    updatedAt: string
}

export interface ChapterRequest {
    name: string
    chapterNo: number
    description?: string
    subjectId: number
}

export interface ApiResponse<T> {
    status: number
    message: string
    data: T
    errorData?: T
    error?: string
    timestamp: string
    path: string
}
