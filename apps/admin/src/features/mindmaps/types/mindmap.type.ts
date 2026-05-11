export interface StructureConfigDto {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  elkAlgorithm: string;
  elkOptions?: Record<string, string>;
  edgeType?: string;
  isActive: boolean;
}

export interface MindMapStructureRequest {
  name: string;
  description?: string;
  thumbnail_url?: string;
  elk_algorithm: string;
  elk_options?: Record<string, string>;
  edge_type?: string;
  is_active?: boolean;
}

export interface MindMapStructurePatchRequest {
  name?: string;
  description?: string;
  thumbnail_url?: string;
  elk_algorithm?: string;
  elk_options?: Record<string, string>;
  edge_type?: string;
  is_active?: boolean;
}

export interface ThemeConfigDto {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  colors?: string[];
  nodeStyles?: Record<string, unknown>;
  edgeStyle?: Record<string, unknown>;
  background?: string;
  isActive: boolean;
}

export interface MindMapThemeRequest {
  name: string;
  description?: string;
  thumbnail_url?: string;
  colors?: string[];
  node_styles?: Record<string, unknown>;
  edge_style?: Record<string, unknown>;
  background?: string;
  is_active?: boolean;
}

export interface MindMapThemePatchRequest {
  name?: string;
  description?: string;
  thumbnail_url?: string;
  colors?: string[];
  node_styles?: Record<string, unknown>;
  edge_style?: Record<string, unknown>;
  background?: string;
  is_active?: boolean;
}

export interface MindMapGalleryResponse {
  structures: StructureConfigDto[];
  themes: ThemeConfigDto[];
}
