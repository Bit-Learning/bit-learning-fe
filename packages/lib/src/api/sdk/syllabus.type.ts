// Syllabus Types
export interface SubjectBriefResponse {
	id: number;
	name: string;
	code: string;
}

export interface SyllabusVersionBriefResponse {
	id: number;
	versionNo: number;
	name: string;
	createdAt: string;
}

export interface SyllabusResponse {
	id: number;
	name: string;
	code: string;
	description: string;
	isActive: boolean;
	subject: SubjectBriefResponse;
	versions: SyllabusVersionBriefResponse[];
	createdAt: string;
	updatedAt: string;
}

export interface SyllabusRequest {
	name: string;
	code: string;
	description?: string;
	subjectId: number;
}

export interface LessonBriefResponse {
	id: number;
	name: string;
	lessonNo: number;
}

export interface SyllabusDetailResponse {
	id: number;
	syllabusVersionId: number;
	lesson: LessonBriefResponse;
	duration: number;
	learningObjectives: string;
	materials: string;
	studentTasks: string;
	createdAt: string;
	updatedAt: string;
}

export interface SyllabusDetailRequest {
	lessonId: number;
	duration: number;
	learningObjectives: string;
	materials: string;
	studentTasks: string;
}

export interface SyllabusBriefResponse {
	id: number;
	name: string;
	code: string;
	isActive: boolean;
}

export interface SyllabusVersionResponse {
	id: number;
	versionNo: number;
	name: string;
	notes: string;
	syllabus: SyllabusBriefResponse;
	syllabusDetails: SyllabusDetailResponse[];
	createdAt: string;
	updatedAt: string;
}

export interface SyllabusVersionRequest {
	syllabusId: number;
	name: string;
	notes?: string;
	syllabusDetails: SyllabusDetailRequest[];
}

// Pagination
export interface Pageable {
	page: number;
	size: number;
	sort?: string[];
}

export interface PageableObject {
	offset: number;
	sort: SortObject;
	pageNumber: number;
	pageSize: number;
	paged: boolean;
	unpaged: boolean;
}

export interface SortObject {
	empty: boolean;
	sorted: boolean;
	unsorted: boolean;
}

export interface PageSyllabusResponse {
	totalElements: number;
	totalPages: number;
	size: number;
	content: SyllabusResponse[];
	number: number;
	sort: SortObject;
	pageable: PageableObject;
	first: boolean;
	last: boolean;
	numberOfElements: number;
	empty: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
	errorData?: T;
	error?: string;
	timestamp: string;
	path: string;
}
