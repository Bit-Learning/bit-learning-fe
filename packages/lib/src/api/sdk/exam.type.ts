import { MatrixVersionBriefResponse, PageableObject, SortObject, SubjectBriefResponse } from './matrix.type'
import { QuestionResponse } from './question.type'

export interface ExamQuestionResponse {
    id: number
    questionNo: number
    score: number
    optionsShuffled: boolean
    question: QuestionResponse
}

export interface ExamResponse {
    id: number
    name: string
    code: string
    durationInMinutes: number
    totalScore: number
    publishedAt?: string
    isPublished: boolean
    matrixVersion: MatrixVersionBriefResponse
    subject: SubjectBriefResponse
    examQuestions: ExamQuestionResponse[]
    createdAt: string
    updatedAt: string
}

export interface ExamBriefResponse {
    id: number
    name: string
    code: string
    durationInMinutes: number
    totalScore: number
    isPublished: boolean
    createdAt: string
}

export interface ExamGenerateRequest {
    matrixVersionId: number
    name: string
    code: string
    shuffleOptions: boolean
}

export interface ExamGenerateFromUserQuestionsRequest {
    matrixVersionId: number
    createdBy: number
    name: string
    code: string
    shuffleOptions: boolean
}

export interface ExamGenerateFromQuestionsRequest {
    questionIds: number[]
    name: string
    code: string
    shuffleOptions: boolean
    durationInMinutes: number
    totalScore: number
}

export interface PageExamBriefResponse {
    totalElements: number
    totalPages: number
    size: number
    content: ExamBriefResponse[]
    number: number
    sort: SortObject
    pageable: PageableObject
    first: boolean
    last: boolean
    numberOfElements: number
    empty: boolean
}
