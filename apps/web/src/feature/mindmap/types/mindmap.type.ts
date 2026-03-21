// ─── Tree ─────────────────────────────────────────────────────────────────────

export interface MindMapTreeNode {
    id: string;
    label: string;
    description?: string;
    type?: "root" | "branch" | "leaf";
    children?: MindMapTreeNode[];
}

// ─── Structure & Theme Config ─────────────────────────────────────────────────
// Tất cả fields camelCase (Jackson default, không có @JsonProperty)

export interface StructureConfig {
    id: number;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    elkAlgorithm: string;
    /** Truyền thẳng vào ELK.js layoutOptions */
    elkOptions: Record<string, string>;
    /** React Flow edge type: "smoothstep", "bezier", ... */
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
    /** Màu theo depth: index 0 = root, 1 = branch, 2+ = leaf */
    colors: string[];
    /** Key: "root" | "branch" | "leaf" */
    nodeStyles: Record<string, ThemeNodeStyle>;
    edgeStyle: ThemeEdgeStyle;
    /** Canvas background color */
    background: string;
    isActive: boolean;
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export interface MindMapGalleryResponse {
    structures: StructureConfig[];
    themes: ThemeConfig[];
}

// ─── Generate ─────────────────────────────────────────────────────────────────

export interface GenerateMindMapRequest {
    topic: string;
    grade: number;
    max_depth?: number;
    max_branches?: number;
    structure_id?: number;
    theme_id?: number;
    /** null → dùng title AI generate */
    name?: string;
}

export interface MindMapMetadata {
    total_nodes: number;    // @JsonProperty
    total_edges: number;    // @JsonProperty
    max_depth: number;      // @JsonProperty
    sources?: Record<string, string>;
    generated_at?: string;  // @JsonProperty
}

/** Trả về bởi: generate, refine, restore */
export interface MindMapGenerateResponse {
    id: number;
    title: string;
    topic: string;
    status: string;
    current_version: number;           // @JsonProperty
    tree: MindMapTreeNode;
    structure_config: StructureConfig; // @JsonProperty
    theme_config: ThemeConfig;         // @JsonProperty
    metadata: MindMapMetadata;
    processing_time: number;           // @JsonProperty
}

// ─── Refine ───────────────────────────────────────────────────────────────────

export interface RefineRequest {
    instruction: string;
}

// ─── Saved ────────────────────────────────────────────────────────────────────
// Dùng cho cả GET /saved (list) và GET /saved/{id} — cùng một DTO

export interface SavedMindMapDto {
    id: number;
    name: string;
    title: string;
    topic: string;
    current_version: number;           // @JsonProperty
    treeData: MindMapTreeNode;         // camelCase
    structure_config: StructureConfig; // @JsonProperty
    theme_config: ThemeConfig;         // @JsonProperty
    metadata: MindMapMetadata | null;
    createdAt: string;                 // camelCase
    updatedAt: string;                 // camelCase
}

// ─── Version History ──────────────────────────────────────────────────────────
// Dùng cho cả GET /versions (list) và GET /versions/{vn} — cùng một DTO
// Không có structure_config/theme_config → dùng config của mindmap hiện tại khi preview

export interface MindMapVersionDto {
    id: number;
    version_number: number;     // @JsonProperty
    change_description: string; // @JsonProperty
    treeData: MindMapTreeNode;  // camelCase
    created_at: string;         // @JsonProperty
}
