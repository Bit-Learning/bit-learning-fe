import { LessonBriefResponse, PageableObject, SortObject, SubjectBriefResponse } from './matrix.type'

export type QuestionType = 'MCQ' | 'ESSAY'
export type QuestionLevel = 'EASY' | 'MEDIUM' | 'HARD'

export interface ChapterBriefResponse {
    id: number
    name: string
    chapterNo: number
}

export interface TagResponse {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export interface OptionResponse {
    id: number
    label: string
    content: string
    isCorrect: boolean
    orderNo: number
}

export interface OptionRequest {
    label: string
    content: string
    isCorrect: boolean
    orderNo: number
}

export interface QuestionResponse {
    id: number
    content: string
    canonicalAnswer: string
    questionType: QuestionType
    questionLevel: QuestionLevel
    subject: SubjectBriefResponse
    chapter: ChapterBriefResponse
    lesson: LessonBriefResponse
    tags: TagResponse[]
    options: OptionResponse[]
    isActive: boolean
    isPublic: boolean
    createdAt: string
    updatedAt: string
}

export interface QuestionRequest {
    content: string
    canonicalAnswer: string
    questionType: QuestionType
    questionLevel: QuestionLevel
    subjectId: number
    lessonId: number
    tagIds?: number[]
    options?: OptionRequest[]
}

export interface QuestionFilter {
    subjectId?: number
    chapterId?: number
    lessonId?: number
    questionType?: QuestionType
    questionLevel?: QuestionLevel
    tagIds?: number[]
}

export interface PageQuestionResponse {
    totalElements: number
    totalPages: number
    size: number
    content: QuestionResponse[]
    number: number
    sort: SortObject
    pageable: PageableObject
    first: boolean
    last: boolean
    numberOfElements: number
    empty: boolean
}
