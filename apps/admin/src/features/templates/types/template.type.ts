export enum TextAlignment {
	LEFT = "LEFT",
	CENTER = "CENTER",
	RIGHT = "RIGHT",
	JUSTIFY = "JUSTIFY",
}

export interface TableCell {
	text: string;
	bold?: boolean;
	background_color?: string;
	align?: TextAlignment;
}

export interface Position {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface TableData {
	headers: string[];
	rows: TableCell[][];
	position?: Position;
	has_header_row?: boolean;
}

export interface TemplateResponse {
	id: number;
	name: string;
	description?: string;
	url: string;
	thumbnailUrl?: string;
	previewPdfUrl: string;
	createdAt: string;
	updatedAt: string;
}

export interface TemplateListParams {
	page?: number;
	size?: number;
	sortBy?: string;
	sortDir?: "asc" | "desc";
}
