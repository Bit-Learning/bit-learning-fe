export interface CreateTagRequest {
	name: string;
}

export interface UpdateTagRequest {
	name: string;
}

export interface TagResponse {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}
