export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  model?: string;
  promptToken?: number;
  completionToken?: number;
  totalToken?: number;
  sources?: SourceInfo[];
  attachments?: Attachment[];
  createdAt: string;
}

export type SourceInfo = Record<string, string>;

export interface Attachment {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface AttachmentResult {
  id?: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageHistoryResponse {
  conversation_id: string;
  messages: ChatResult[];
  has_more: boolean;
  next_cursor: number | null;
}

export interface ChatResult {
  id: number;
  role: "user" | "assistant";
  answer: string;
  model?: string;
  sources?: Record<string, string>;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  attachments?: AttachmentResult[];
  created_at: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface ChatRequest {
  question: string;
  files?: File[];
}
