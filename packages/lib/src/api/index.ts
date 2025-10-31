import { AxiosInstance } from 'axios'
import { AuthApi } from './sdk/auth.api'
import { ExamApi } from './sdk/exam.api'
import { ExampleApi } from './sdk/example.api'
import { MatrixApi } from './sdk/matrix.api'
import { QuestionApi } from './sdk/question.api'
import { SubjectApi } from './sdk/subject.api'

/**
 * API class for the application
 * @example
 * const api = new Api(
 * axios.create({
        baseURL: 'http://localhost:4000',
    }),
 * )
 * api.matrix.getAllMatrices()
 */
export class Api {
    example: ExampleApi
    auth: AuthApi
    matrix: MatrixApi
    question: QuestionApi
    exam: ExamApi
    subject: SubjectApi

    constructor(private readonly client: AxiosInstance) {
        this.example = new ExampleApi(this.client)
        this.auth = new AuthApi(this.client)
        this.matrix = new MatrixApi(this.client)
        this.question = new QuestionApi(this.client)
        this.exam = new ExamApi(this.client)
        this.subject = new SubjectApi(this.client)
    }
}
