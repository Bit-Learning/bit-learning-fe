export interface ApiResponse<T> {
    status: number
    code: string
    message: string
    data: T
    errorData: T
    error: string
    path: string
}
