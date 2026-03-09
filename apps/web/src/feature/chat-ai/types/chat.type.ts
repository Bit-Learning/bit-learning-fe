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

export interface SourceInfo {
  [key: string]: string;
}

export interface Attachment {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface Conversation {
  id: string;
  title: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageHistoryResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor: number | null;
}

export interface ChatResult {
  answer: string;
  sources?: Record<string, string>;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  attachments?: Attachment[];
}

export interface CreateConversationRequest {
  title?: string;
}

export interface ChatRequest {
  question: string;
  files?: File[];
}
