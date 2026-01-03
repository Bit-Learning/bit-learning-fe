import type { AxiosInstance } from "axios";
import { AuthApi } from "./sdk/auth.api";
import { ChapterApi } from "./sdk/chapter.api";
import { ExamApi } from "./sdk/exam.api";
import { ExampleApi } from "./sdk/example.api";
import { LessonApi } from "./sdk/lesson.api";
import { MatrixApi } from "./sdk/matrix.api";
import { QuestionApi } from "./sdk/question.api";
import { SubjectApi } from "./sdk/subject.api";
import { SyllabusApi } from "./sdk/syllabus.api";

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
	example: ExampleApi;
	auth: AuthApi;
	matrix: MatrixApi;
	question: QuestionApi;
	exam: ExamApi;
	subject: SubjectApi;
	syllabus: SyllabusApi;
	chapter: ChapterApi;
	lesson: LessonApi;

	constructor(private readonly client: AxiosInstance) {
		this.example = new ExampleApi(this.client);
		this.auth = new AuthApi(this.client);
		this.matrix = new MatrixApi(this.client);
		this.question = new QuestionApi(this.client);
		this.exam = new ExamApi(this.client);
		this.subject = new SubjectApi(this.client);
		this.syllabus = new SyllabusApi(this.client);
		this.chapter = new ChapterApi(this.client);
		this.lesson = new LessonApi(this.client);
	}
}
