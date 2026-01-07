export interface NoteResponse {
  id: number;
  videoTimestamp: number;
  content: string;
  createdAt: string;
}

export interface NoteRequest {
  lectureId: number;
  videoTimestamp: number;
  content: string;
}
