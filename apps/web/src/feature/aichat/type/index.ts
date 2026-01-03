// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T = any> {
	status: number;
	code?: string;
	message?: string;
	data?: T;
	errorData?: any;
	error?: string;
	timestamp?: string;
	path?: string;
}

// ============================================================================
// Template Types
// ============================================================================

export interface TemplateResponse {
	id: number;
	name: string;
	description?: string;
	url: string;
	thumbnailUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PageTemplateResponse {
	totalPages: number;
	totalElements: number;
	size: number;
	content: TemplateResponse[];
	number: number;
	first: boolean;
	last: boolean;
	numberOfElements: number;
	empty: boolean;
}

export interface CreateTemplateRequest {
	name: string;
	description?: string;
	templateFile: File;
	thumbnailFile?: File;
}

export interface UpdateTemplateRequest {
	name?: string;
	description?: string;
	templateFile?: File;
	thumbnailFile?: File;
}

export interface ValidateTemplateResponse {
	valid: boolean;
	filename: string;
	required_placeholders?: string[];
}

export interface ExtractPlaceholdersResponse {
	filename: string;
	placeholders: string[];
	count: number;
}

// ============================================================================
// Slide Generation Types
// ============================================================================

export type SlideFormat = "powerpoint" | "markdown" | "html" | "text" | "json";

export type CollectionName = "sgk_tin_kntt" | "sgk_tin_cd" | "sgk_tin_ctst";

export interface SlideRequest {
	topic: string;
	grade?: number; // 3-12
	format?: SlideFormat;
	slide_count?: number; // 1-20
	include_examples?: boolean;
	include_exercises?: boolean;
	collection_name?: CollectionName;
}

export interface GeneratePPTXRequest {
	templateId: number;
	request: SlideRequest;
}

export interface GenerateCustomPPTXRequest {
	template: File;
	placeholders: Record<string, string>;
}

export interface SlideGenerationResponse {
	id: number;
	topic: string;
	grade: number | null;
	templateId: number;
	templateName: string;
	cloudinaryUrl: string;
	filename: string;
	slideCount: number;
	collectionName: string | null;
	fromCache: boolean;
	generatedAt: string;
	message: string;
}

export interface SlideHistoryPageResponse {
	content: SlideGenerationResponse[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number; // current page (0-indexed)
}

// ============================================================================
// Slide Content Types (for JSON response)
// ============================================================================

export type SlideType =
	| "title_slide"
	| "content_slide"
	| "code_slide"
	| "image_slide"
	| "table_slide"
	| "exercise_slide"
	| "summary_slide";

export type LayoutType =
	| "TITLE"
	| "TITLE_AND_CONTENT"
	| "SECTION_HEADER"
	| "TWO_CONTENT"
	| "COMPARISON"
	| "TITLE_ONLY"
	| "BLANK"
	| "CONTENT_WITH_CAPTION"
	| "PICTURE_WITH_CAPTION";

export type PlaceholderType =
	| "TITLE"
	| "BODY"
	| "CENTERED_TITLE"
	| "SUBTITLE"
	| "DATE"
	| "FOOTER"
	| "SLIDE_NUMBER"
	| "CONTENT";

export type TextAlignment = "LEFT" | "CENTER" | "RIGHT" | "JUSTIFY";

export interface BulletPoint {
	text: string;
	level?: number; // 0-4
	bold?: boolean;
	italic?: boolean;
	font_size?: number; // 8-72
}

export interface PlaceholderContent {
	placeholder_type: PlaceholderType;
	text_content?: string;
	bullet_points?: BulletPoint[];
	alignment?: TextAlignment;
}

export interface Position {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface CodeBlock {
	code: string;
	language?: string;
	position?: Position;
	highlight_lines?: number[];
	font_family?: string;
	font_size?: number; // 8-24
}

export interface ImagePlaceholder {
	description: string;
	position?: Position;
	placeholder_id?: string;
	suggested_search?: string;
	alt_text?: string;
}

export interface TableCell {
	text: string;
	bold?: boolean;
	align?: TextAlignment;
	background_color?: string;
}

export interface TableData {
	headers?: string[];
	rows: TableCell[][];
	position?: Position;
	has_header_row?: boolean;
}

export interface JsonSlideContent {
	slide_number: number;
	type: SlideType;
	layout: LayoutType;
	placeholders?: PlaceholderContent[];
	title?: string;
	subtitle?: string;
	content?: any;
	table?: TableData;
	images?: ImagePlaceholder[];
	notes?: string;
	code_block?: CodeBlock;
	key_points?: string[];
	// Deprecated fields (kept for backward compatibility)
	code?: string;
	language?: string;
	explanation?: string;
	caption?: string;
	image_placeholder?: string;
}

export interface JsonSlideMetadata {
	total_slides: number;
	estimated_duration: string;
	sources?: string[];
	generated_at?: string;
	grade_level?: string;
}

export interface JsonSlideResponse {
	title: string;
	topic: string;
	grade?: number;
	slides: JsonSlideContent[];
	metadata: JsonSlideMetadata;
	status: string;
	error?: string;
	processing_time?: number;
}

// ============================================================================
// Question & Answer Types
// ============================================================================

export type QuestionType = "general" | "slide" | "explain" | "example";

export interface QuestionRequest {
	question: string;
	question_type?: QuestionType;
	grade_filter?: number; // 3-12
	return_sources?: boolean;
	max_sources?: number; // 1-10
	collection_name?: CollectionName;
}

export interface QuestionSource {
	content: string;
	grade?: string;
	lesson_title?: string;
	score?: number;
}

export interface QuestionResponse {
	question: string;
	answer: string;
	status: string;
	sources?: QuestionSource[];
	processing_time?: number;
}

export interface BatchQuestionRequest {
	questions: string[]; // 1-10 questions
	question_type?: QuestionType;
	grade_filter?: number; // 3-12
	return_sources?: boolean;
	collection_name?: CollectionName;
}

export interface BatchQuestionResponse {
	results: QuestionResponse[];
	total_questions: number;
	successful: number;
	failed: number;
	processing_time?: number;
}

// ============================================================================
// Mindmap Types
// ============================================================================

export interface MindmapRequest {
	topic: string;
	grade?: number; // 3-12
	maxDepth?: number; // 1-5, default: 3
	maxBranches?: number; // 3-10, default: 6
	includeExamples?: boolean;
	collectionName?: string;
}

export type MindmapNodeType =
	| "center"
	| "primary"
	| "secondary"
	| "tertiary"
	| "leaf";

export interface MindmapNode {
	id: string;
	label: string;
	type: MindmapNodeType;
	level: number;
}

export interface MindmapConnection {
	source: string;
	target: string;
}

export interface MindmapResponse {
	centerNode: MindmapNode;
	nodes: MindmapNode[];
	connections: MindmapConnection[];
	topic: string;
	grade?: number;
	totalNodes: number;
	maxDepth: number;
	status: string;
	processingTime?: number;
	sources?: string[];
}

// ============================================================================
// Chat & Conversation Types
// ============================================================================

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessageRequest {
	conversation_id?: string; // Optional - omit to create new conversation
	message: string;
	grade?: number; // 3-12
	return_sources?: boolean;
	max_history?: number; // 0-50, default: 10
	user_id?: string; // Set by backend from header
}

export interface ChatMessageResponse {
	id: string;
	conversation_id: string;
	role: MessageRole;
	content: string;
	sources?: Record<string, any>[];
	retrieval_mode?: string;
	docs_retrieved?: number;
	web_search_used?: boolean;
	processing_time?: number; // milliseconds
	created_at: string;
	metadata?: Record<string, any>;
}

export interface ChatResponse {
	conversation_id: string;
	message_id: string;
	user_message: ChatMessageResponse;
	assistant_message: ChatMessageResponse;
	status: string;
	error?: string;
}

export interface ConversationCreateRequest {
	title?: string; // Optional - auto-generated if not provided
	user_id?: string; // Set by backend from header
}

export interface ConversationResponse {
	id: string;
	user_id: string;
	title?: string;
	grade?: number;
	subject?: string;
	created_at: string;
	updated_at: string;
	is_archived: boolean;
	metadata?: Record<string, any>;
	message_count?: number;
}

export interface ConversationListResponse {
	conversations: ConversationResponse[];
	total: number;
	page: number;
	page_size: number;
}

export interface ConversationWithMessagesResponse {
	conversation: ConversationResponse;
	messages: ChatMessageResponse[];
	total_messages: number;
}

export interface DeleteResponse {
	success: boolean;
	message: string;
	deleted_id?: string;
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthResponse {
	status: "UP" | "DOWN";
	service: string;
	timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ConvertToPlaceholdersResponse {
	[key: string]: string;
}
