export interface SystemPromptResponse {
  id: number;
  prompt_key: string;
  name: string;
  content: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemPromptRequest {
  prompt_key: string;
  name: string;
  content: string;
  description?: string;
  is_active?: boolean;
}

export interface SystemPromptPatchRequest {
  name?: string;
  content?: string;
  description?: string;
  is_active?: boolean;
}
