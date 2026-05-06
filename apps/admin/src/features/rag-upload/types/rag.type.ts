export interface TextbookUploadResponse {
	id: string;
	bookName: string;
	publisher: string;
	grade?: string;
	productName?: string;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	fileUrl?: string;
	errorMessage?: string;
	createdAt: string;
	updatedAt: string;
	originalFilename?: string;
	chunkCount?: number;
}

export interface UploadFormData {
	file: File | null;
	bookName: string;
	publisher: string;
	grade?: string;
	productName?: string;
}
