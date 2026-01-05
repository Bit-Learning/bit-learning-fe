// Matrix Types
export interface SubjectBriefResponse {
	id: number;
	name: string;
	code: string;
}

export interface MatrixVersionBriefResponse {
	id: number;
	versionNo: number;
	name: string;
	createdAt: string;
}

export interface MatrixResponse {
	id: number;
	name: string;
	code: string;
	description: string;
	duration: number;
	totalScore: number;
	isActive: boolean;
	subject: SubjectBriefResponse;
	versions: MatrixVersionBriefResponse[];
	createdAt: string;
	updatedAt: string;
}

export interface MatrixRequest {
	name: string;
	code: string;
	description?: string;
	duration: number;
	totalScore: number;
	subjectId: number;
}

export interface LessonBriefResponse {
	id: number;
	name: string;
	lessonNo: number;
}

export interface MatrixDetailResponse {
	id: number;
	matrixVersionId: number;
	lesson: LessonBriefResponse;
	easyMCQ: number;
	mediumMCQ: number;
	hardMCQ: number;
	easyEssay: number;
	mediumEssay: number;
	hardEssay: number;
	easyMCQScore: number;
	mediumMCQScore: number;
	hardMCQScore: number;
	easyEssayScore: number;
	mediumEssayScore: number;
	hardEssayScore: number;
	createdAt: string;
	updatedAt: string;
}

export interface MatrixDetailRequest {
	lessonId?: number;
	easyMCQ?: number;
	mediumMCQ?: number;
	hardMCQ?: number;
	easyEssay?: number;
	mediumEssay?: number;
	hardEssay?: number;
	easyMCQScore?: number;
	mediumMCQScore?: number;
	hardMCQScore?: number;
	easyEssayScore?: number;
	mediumEssayScore?: number;
	hardEssayScore?: number;
}

export interface MatrixBriefResponse {
	id: number;
	name: string;
	code: string;
	isActive: boolean;
}

export interface MatrixVersionResponse {
	id: number;
	versionNo: number;
	name: string;
	notes: string;
	matrix: MatrixBriefResponse;
	matrixDetails: MatrixDetailResponse[];
	createdAt: string;
	updatedAt: string;
}

export interface MatrixVersionRequest {
	matrixId: number;
	name: string;
	notes?: string;
	matrixDetails: MatrixDetailRequest[];
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

export interface PageMatrixResponse {
	totalElements: number;
	totalPages: number;
	size: number;
	content: MatrixResponse[];
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
