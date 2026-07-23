import api from "@/shared/api/api";
import { ApiResponse } from "@/shared/api/api.type";
import { NoteRequest, NoteResponse } from "../types/note.type";
import { AxiosResponse } from "axios";

export const noteApi = {
	createNote: async (
		request: NoteRequest,
	): Promise<AxiosResponse<ApiResponse<NoteResponse>>> => {
		return await api.post("/learning/notes", request);
	},

	getNotesByLecture: async (
		lectureId: number,
	): Promise<AxiosResponse<ApiResponse<NoteResponse[]>>> => {
		return await api.get(`/learning/lectures/${lectureId}/notes`);
	},

	updateNote: async (
		noteId: number,
		content: string,
	): Promise<AxiosResponse<ApiResponse<NoteResponse>>> => {
		return await api.put(`/learning/notes/${noteId}`, content, {
			headers: {
				"Content-Type": "text/plain",
			},
		});
	},

	deleteNote: async (
		noteId: number,
	): Promise<AxiosResponse<ApiResponse<void>>> => {
		return await api.delete(`/learning/notes/${noteId}`);
	},
};
