export interface LessonResponse {
    id: number
    name: string
    lessonNo: number
    description?: string
    chapterId: number
    createdAt: string
    updatedAt: string
}

export interface LessonRequest {
    name: string
    lessonNo: number
    description?: string
    chapterId: number
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
