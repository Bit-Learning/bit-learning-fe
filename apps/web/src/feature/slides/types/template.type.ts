export interface SlidePlaceholder {
	slideIndex: number;
	placeholders: string[];
}

export interface TemplateResponse {
	id: number;
	name: string;
	description?: string;
	url: string;
	thumbnailUrl?: string;
	previewPdfUrl?: string;
	slidePlaceholders?: SlidePlaceholder[];
	createdAt: string;
	updatedAt: string;
}
export interface TemplateListParams {
	page?: number;
	size?: number;
	sortBy?: string;
	sortDir?: "asc" | "desc";
}
