export type MailTemplateSource =
	| "CLASSPATH"
	| "MINIO_DRAFT"
	| "MINIO_PUBLISHED"
	| "EFFECTIVE";

export interface AdminMailTemplateSummary {
	key: string;
	displayName: string;
	subjectKey?: string | null;
	source: string;
	status: string;
	effectiveSource: string;
	classpathTemplateName?: string | null;
	minioObjectPath?: string | null;
	updatedAt?: string | null;
	updatedBy?: string | null;
}

export interface AdminMailTemplateDetail {
	key: string;
	displayName: string;
	subjectKey?: string | null;
	description?: string | null;
	source: string;
	status: string;
	effectiveSource: string;
	classpathTemplateName?: string | null;
	draftObjectPath?: string | null;
	publishedObjectPath?: string | null;
	updatedAt?: string | null;
	updatedBy?: string | null;
	publishedAt?: string | null;
}

export interface AdminMailTemplateContent {
	key: string;
	source: string;
	status: string;
	html: string;
}

export interface AdminMailTemplateDraftUpsertRequest {
	displayName: string;
	subjectKey?: string;
	description?: string;
	html: string;
}

export interface AdminMailTemplatePreviewRequest {
	source?: MailTemplateSource;
	langKey?: string;
	variables?: Record<string, unknown>;
}
