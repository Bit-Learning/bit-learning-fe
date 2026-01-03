export interface CreateLectureRequest {
	sectionId: number;
	title: string;
	description?: string;
	isPreviewable?: boolean;
	orderIndex: number;
}

export interface UpdateLectureRequest {
	sectionId: number;
	title: string;
	description?: string;
	isPreviewable?: boolean;
	orderIndex: number;
}

export interface CreateLectureVideoRequest {
	lecture: CreateLectureRequest;
	video: File;
}

export interface AnswerCreateRequest {
	answerText: string;
	isCorrect: boolean;
	orderIndex: number;
}

export interface QuizCreateRequest {
	questionText: string;
	orderIndex: number;
	answers: AnswerCreateRequest[];
}

export interface CreateLectureQuizRequest {
	lecture: CreateLectureRequest;
	quizzes: QuizCreateRequest[];
	passPercent: number;
	maxAttempts: number;
}

export interface AnswerUpdateRequest {
	id?: number;
	answerText: string;
	isCorrect: boolean;
	orderIndex: number;
}

export interface QuizUpdateRequest {
	id?: number;
	questionText: string;
	orderIndex: number;
	answers: AnswerUpdateRequest[];
}

export interface CreateLectureTextRequest {
	lecture: CreateLectureRequest;
	content: string;
}

export interface UpdateLectureTextRequest {
	content: string;
}
