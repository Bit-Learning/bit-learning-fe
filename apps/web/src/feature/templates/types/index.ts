export type Template = {
    id: number
    name: string
    displayName: string
    description: string
    filePath: string
    content: string
    theme: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type SlidevPresentation = {
    id: string
    title: string
    description: string
    fileName: string
    theme: string
    thumbnail?: string
    tags?: string[]
    createdAt: string
    updatedAt: string
}

export type SlidevMode = 'show' | 'presenter' | 'overview' | 'export'

export interface SlidevConfig {
    baseUrl: string
    port: number
}
