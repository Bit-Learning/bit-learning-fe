export enum LectureType {
	VIDEO = "VIDEO",
	TEXT = "TEXT",
	QUIZ = "QUIZ",
	EMPTY = "EMPTY",
}

export interface LectureDetail {
	id: number;
	sectionId: number;
	title: string;
	description: string;
	type: LectureType;
	isPreviewable: boolean;
	orderIndex: number;
	isDeleted: boolean;
}

export interface LectureTextDetail {
	lecture: LectureDetail;
	content: string;
}

export interface AnswerDetail {
	id: number;
	answerText: string;
	isCorrect: boolean;
	orderIndex: number;
}

export interface QuizDetail {
	id: number;
	questionText: string;
	orderIndex: number;
	answers: AnswerDetail[];
}

export interface LectureQuizDetail {
	lecture: LectureDetail;
	passPercent: number;
	maxAttempts: number;
	quizzes: QuizDetail[];
}
