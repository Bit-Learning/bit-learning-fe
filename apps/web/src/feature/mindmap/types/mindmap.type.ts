export interface MindMapTreeNode {
	id: string;
	label: string;
	description?: string;
	type?: "root" | "branch" | "leaf";
	children?: MindMapTreeNode[];
}

export interface StructureConfig {
	id: number;
	name: string;
	description?: string;
	thumbnailUrl?: string;
	elkAlgorithm: string;
	elkOptions: Record<string, string>;
	edgeType: string;
	isActive: boolean;
}

export interface ThemeNodeStyle {
	background?: string;
	color?: string;
	borderColor?: string;
	borderRadius?: string;
	[key: string]: string | undefined;
}

export interface ThemeEdgeStyle {
	stroke?: string;
	strokeWidth?: string | number;
	animated?: boolean;
	[key: string]: unknown;
}

export interface ThemeConfig {
	id: number;
	name: string;
	description?: string;
	thumbnailUrl?: string;
	colors: string[];
	nodeStyles: Record<string, ThemeNodeStyle>;
	edgeStyle: ThemeEdgeStyle;
	background: string;
	isActive: boolean;
}

export interface MindMapGalleryResponse {
	structures: StructureConfig[];
	themes: ThemeConfig[];
}

export interface GenerateMindMapRequestBase {
	max_depth?: number;
	max_branches?: number;
	structure_id?: number;
	theme_id?: number;
	name?: string;
}

export interface GenerateMindMapRequestByTopic
	extends GenerateMindMapRequestBase {
	topic: string;
	chapter_id?: never;
}

export interface GenerateMindMapRequestByChapter
	extends GenerateMindMapRequestBase {
	chapter_id: number;
	topic?: never;
}

export type GenerateMindMapRequest =
	| GenerateMindMapRequestByTopic
	| GenerateMindMapRequestByChapter;

export interface MindMapMetadata {
	total_nodes: number; // @JsonProperty
	total_edges: number; // @JsonProperty
	max_depth: number; // @JsonProperty
	sources?: Record<string, string>;
	generated_at?: string; // @JsonProperty
}

export interface MindMapGenerateResponse {
	id: number;
	title: string;
	topic: string;
	status: string;
	current_version: number; // @JsonProperty
	tree: MindMapTreeNode;
	structure_config: StructureConfig; // @JsonProperty
	theme_config: ThemeConfig; // @JsonProperty
	metadata: MindMapMetadata;
	processing_time: number; // @JsonProperty
}

export interface RefineRequest {
	instruction: string;
}

export interface SavedMindMapDto {
	id: number;
	name: string;
	title: string;
	topic: string;
	current_version: number; // @JsonProperty
	treeData: MindMapTreeNode; // camelCase
	structure_config: StructureConfig | null; // @JsonProperty
	theme_config: ThemeConfig | null; // @JsonProperty
	metadata: MindMapMetadata | null;
	createdAt: string; // camelCase
	updatedAt: string; // camelCase
}

export interface SaveTreeRequest {
	treeData: MindMapTreeNode;
}

export interface SaveTreeResponse {
	id: number;
	version_number: number; // @JsonProperty
	change_description: string; // @JsonProperty
	treeData: MindMapTreeNode;
	created_at: string; // @JsonProperty
}

export interface MindMapVersionDto {
	id: number;
	version_number: number; // @JsonProperty
	change_description: string; // @JsonProperty
	treeData: MindMapTreeNode; // camelCase
	created_at: string; // @JsonProperty
}
