// Matrix utility functions and helpers

export const DIFFICULTY_LEVELS = {
	EASY: "easy",
	MEDIUM: "medium",
	HARD: "hard",
	VERY_HARD: "very-hard",
} as const;

export const DIFFICULTY_LABELS = {
	easy: "Nhận biết",
	medium: "Thông hiểu",
	hard: "Vận dụng",
	"very-hard": "Vận dụng cao",
} as const;

export const QUESTION_TYPES = {
	MCQ: "mcq",
	ESSAY: "essay",
} as const;

export const QUESTION_TYPE_LABELS = {
	mcq: "Trắc nghiệm",
	essay: "Tự luận",
} as const;

// Get difficulty badge color
export const getDifficultyBadgeColor = (level: string): string => {
	switch (level) {
		case DIFFICULTY_LEVELS.EASY:
			return "bg-green-500";
		case DIFFICULTY_LEVELS.MEDIUM:
			return "bg-blue-500";
		case DIFFICULTY_LEVELS.HARD:
			return "bg-orange-500";
		case DIFFICULTY_LEVELS.VERY_HARD:
			return "bg-red-500";
		default:
			return "bg-gray-500";
	}
};

// Get difficulty label
export const getDifficultyLabel = (level: string): string => {
	return DIFFICULTY_LABELS[level as keyof typeof DIFFICULTY_LABELS] || level;
};

// Get question type label
export const getQuestionTypeLabel = (type: string): string => {
	return (
		QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS] || type
	);
};

// Calculate total questions from matrix details
export const calculateTotalQuestions = (details: any[]): number => {
	return details.reduce((total, detail) => {
		return (
			total +
			(detail.easyMCQ || 0) +
			(detail.mediumMCQ || 0) +
			(detail.hardMCQ || 0) +
			(detail.easyEssay || 0) +
			(detail.mediumEssay || 0) +
			(detail.hardEssay || 0)
		);
	}, 0);
};

// Calculate total score from matrix details
export const calculateTotalScore = (details: any[]): number => {
	return details.reduce((total, detail) => {
		return (
			total +
			(detail.easyMCQScore || 0) +
			(detail.mediumMCQScore || 0) +
			(detail.hardMCQScore || 0) +
			(detail.easyEssayScore || 0) +
			(detail.mediumEssayScore || 0) +
			(detail.hardEssayScore || 0)
		);
	}, 0);
};

// Format date
export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
};

// Format datetime
export const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

// Validate matrix form
export interface MatrixFormData {
	name: string;
	code: string;
	description?: string;
	duration: number;
	totalScore: number;
	subjectId: number;
}

export const validateMatrixForm = (
	data: MatrixFormData,
): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (!data.name || data.name.trim().length === 0) {
		errors.push("Tên ma trận không được để trống");
	}

	if (!data.code || data.code.trim().length === 0) {
		errors.push("Mã ma trận không được để trống");
	}

	if (data.duration <= 0) {
		errors.push("Thời gian làm bài phải lớn hơn 0");
	}

	if (data.totalScore <= 0) {
		errors.push("Tổng điểm phải lớn hơn 0");
	}

	if (!data.subjectId) {
		errors.push("Vui lòng chọn môn học");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

// Generate matrix code from name
export const generateMatrixCode = (name: string): string => {
	// Remove Vietnamese accents and special characters
	const normalized = name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toUpperCase()
		.replace(/[^A-Z0-9\s]/g, "")
		.trim()
		.replace(/\s+/g, "_");

	// Add timestamp to ensure uniqueness
	const timestamp = Date.now().toString().slice(-6);

	return `${normalized.slice(0, 20)}_${timestamp}`;
};

// Parse import file results
export interface ImportResult {
	total: number;
	success: number;
	error: number;
	duplicate: number;
	questions: any[];
}

export const parseImportResults = (response: any): ImportResult => {
	return {
		total: response.total || 0,
		success: response.success || 0,
		error: response.error || 0,
		duplicate: response.duplicate || 0,
		questions: response.questions || [],
	};
};

// Download file helper
export const downloadFile = (blob: Blob, filename: string) => {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

// Generate filename for export
export const generateExportFilename = (
	matrixName: string,
	extension: "pdf" | "docx" | "xlsx",
): string => {
	const normalized = matrixName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.replace(/[^a-zA-Z0-9\s]/g, "")
		.trim()
		.replace(/\s+/g, "_");

	const timestamp = new Date().toISOString().split("T")[0];

	return `${normalized}_${timestamp}.${extension}`;
};
