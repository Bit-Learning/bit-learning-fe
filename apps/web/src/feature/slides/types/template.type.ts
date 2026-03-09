export interface TemplateResponse {
  id: number;
  name: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}
export interface TemplateListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
