// Template types for admin panel
export type Template = {
	id: number;
	name: string;
	price: number;
	previewUrl?: string;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
};

export type TemplateRequest = {
	name: string;
	price: number;
	previewUrl?: string;
	isActive?: boolean;
};

export type TemplateResponse = {
	status: number;
	message: string;
	data: Template;
};

export type TemplatesListResponse = {
	status: number;
	message: string;
	data: Template[];
};
