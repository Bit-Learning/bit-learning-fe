export interface MindMapNodeData {
    label: string;
    description: string;
}

export interface MindMapPosition {
    x: number;
    y: number;
}

export interface MindMapNode {
    id: string;
    /** React Flow node type: "mindMapRoot", "mindMapBranch", "mindMapLeaf" */
    type: string;
    data: MindMapNodeData;
    position: MindMapPosition;
}

export interface MindMapEdge {
    id: string;
    source: string;
    target: string;
    /** React Flow edge type, e.g. "smoothstep" */
    type: string;
    animated: boolean;
}

export interface MindMapMetadata {
    total_nodes: number;
    total_edges: number;
    max_depth: number;
    sources: Record<string, string>;
    generated_at: string;
}

export interface MindMapResponse {
    title: string;
    topic: string;
    nodes: MindMapNode[];
    edges: MindMapEdge[];
    metadata: MindMapMetadata;
    status: string;
    processing_time: number;
}

export interface GenerateMindMapRequest {
    topic: string;
    grade: number;
    /** Độ sâu tối đa của cây mindmap (2-4, default: 3) */
    max_depth?: number;
    /** Số nhánh con tối đa từ mỗi node (2-8, default: 5) */
    max_branches?: number;
}

export interface SaveMindMapRequest {
    /** Tên do user tự đặt */
    name: string;
    /** Title lấy từ AI response */
    title: string;
    topic: string;
    layoutType: string;
    nodes: MindMapNode[];
    edges: MindMapEdge[];
    metadata: MindMapMetadata;
}

export interface SavedMindMapDto {
    id: number;
    name: string;
    title: string;
    topic: string;
    layoutType: string;
    createdAt: string;
}

export interface SavedMindMapDetailDto {
    id: number;
    name: string;
    title: string;
    topic: string;
    layoutType: string;
    nodes: MindMapNode[];
    edges: MindMapEdge[];
    metadata: MindMapMetadata;
    createdAt: string;
}
