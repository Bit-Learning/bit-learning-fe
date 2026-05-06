import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TextbookUploadResponse } from "../types/rag.type";

export const ragApi = {
	uploadTextbook(
		file: File,
		bookName: string,
		publisher: string,
		grade?: string,
		productName?: string,
	): Promise<AxiosResponse<ApiResponse<TextbookUploadResponse>>> {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("book_name", bookName);
		formData.append("publisher", publisher);
		if (grade) formData.append("grade", grade);
		if (productName) formData.append("product_name", productName);

		return api.post("/rag/upload", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	getUploads(
		page = 0,
		size = 10,
	): Promise<AxiosResponse<ApiResponse<TextbookUploadResponse[]>>> {
		return api.get("/rag/uploads", { params: { page, size } });
	},
};
