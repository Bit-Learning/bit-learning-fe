// ─── Gallery ─────────────────────────────────────────────────────────────────

export interface GalleryStructure {
    id: number;
    name: string;
    description?: string;
}

export interface GalleryTheme {
    id: number;
    name: string;
    description?: string;
}

export interface MindMapGalleryResponse {
    structures: GalleryStructure[];
    themes: GalleryTheme[];
}

// ─── Tree (BE format) ─────────────────────────────────────────────────────────

export interface MindMapTreeNode {
    id: string;
    label: string;
    description?: string;
    children?: MindMapTreeNode[];
}

// ─── Generate ─────────────────────────────────────────────────────────────────

export interface GenerateMindMapRequest {
    topic: string;
    grade: number;
    max_depth?: number;
    max_branches?: number;
    structure_id?: number;
    theme_id?: number;
    /** Nếu không truyền, BE tự đặt tên theo title */
    name?: string;
}

export interface MindMapMetadata {
    total_nodes: number;
    total_edges: number;
    max_depth: number;
    sources?: Record<string, string>;
    generated_at?: string;
}

export interface MindMapGenerateResponse {
    id: number;
    title: string;
    topic: string;
    status: string;
    current_version: number;
    tree: MindMapTreeNode;
    structure_config: Record<string, unknown>;
    theme_config: Record<string, unknown>;
    metadata: MindMapMetadata;
    processing_time: number;
}

// ─── Refine ───────────────────────────────────────────────────────────────────

export interface RefineRequest {
    instruction: string;
}

// ─── Saved ────────────────────────────────────────────────────────────────────

export interface SavedMindMapDto {
    id: number;
    name: string;
    title: string;
    topic: string;
    createdAt: string;
}

export interface SavedMindMapDetailDto {
    id: number;
    name: string;
    title: string;
    topic: string;
    current_version: number;
    tree: MindMapTreeNode;
    structure_config: Record<string, unknown>;
    theme_config: Record<string, unknown>;
    metadata: MindMapMetadata;
    createdAt: string;
}

// ─── Version History ──────────────────────────────────────────────────────────

export interface MindMapVersionDto {
    id: number;
    version_number: number;
    change_description: string;
    created_at: string;
}

export interface MindMapVersionDetailDto {
    id: number;
    version_number: number;
    change_description: string;
    tree: MindMapTreeNode;
    structure_config: Record<string, unknown>;
    theme_config: Record<string, unknown>;
    metadata: MindMapMetadata;
    created_at: string;
}
