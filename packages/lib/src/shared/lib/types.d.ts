declare module 'AppModels' {
    export interface ApiResponse<T> {
        data: T
        message?: string
        success: boolean
    }
}
