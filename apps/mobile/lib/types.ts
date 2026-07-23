export type ApiEnvelope<T> = {
	status: number;
	message?: string;
	data?: T;
	error?: string;
};
export type User = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	avatar?: string;
	grade?: number;
	role: string;
	bio?: string;
	phoneNumber?: string;
};
export type Course = {
	id: number;
	title: string;
	subtitle?: string;
	description?: string;
	thumbnailUrl?: string;
	instructorName?: string;
	ratingStar?: number;
	level?: string;
	grade?: number;
	price?: number;
	progressPercentage?: number;
	totalLectures?: number;
	sections?: Section[];
};
export type Section = {
	id: number;
	title: string;
	lectures: Lecture[];
	progressPercentage?: number;
};
export type Lecture = {
	id: number;
	title: string;
	description?: string;
	type: "VIDEO" | "TEXT" | "QUIZ" | "EMPTY";
	isPreviewable: boolean;
	orderIndex: number;
};
export type Quiz = {
	id: number;
	questionText: string;
	answers: { id: number; answerText: string; isCorrect: boolean }[];
};
export type Session = {
	accessToken: string;
	refreshToken?: string;
	user: User;
};
