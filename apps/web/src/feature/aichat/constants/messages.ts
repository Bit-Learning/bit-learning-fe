/**
 * Message mappings for AI Chat and Slide Generation features
 * Maps backend response codes to user-friendly Vietnamese messages
 */

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
	// Template operations
	TEMPLATE_CREATED: "Tạo template thành công",
	TEMPLATE_UPDATED: "Cập nhật template thành công",
	TEMPLATE_DELETED: "Xóa template thành công",
	TEMPLATE_RETRIEVED: "Lấy thông tin template thành công",
	TEMPLATE_UPLOADED: "Tải lên template thành công",
	TEMPLATES_LISTED: "Lấy danh sách template thành công",

	// Slide generation operations
	SLIDE_GENERATED: "Tạo slide thành công",
	SLIDES_GENERATED: "Tạo slides thành công",
	SLIDE_BATCH_GENERATED: "Tạo hàng loạt slides thành công",

	// Question operations
	QUESTION_ANSWERED: "Đã trả lời câu hỏi",
	QUESTIONS_BATCH_ANSWERED: "Đã trả lời hàng loạt câu hỏi",

	// Chat operations (custom)
	MESSAGE_SENT: "Gửi tin nhắn thành công",
	CONVERSATION_CREATED: "Tạo cuộc hội thoại thành công",
	CONVERSATION_DELETED: "Xóa cuộc hội thoại thành công",
} as const;

// ============================================================================
// ERROR MESSAGES - SERVICE SPECIFIC
// ============================================================================

export const SERVICE_ERROR_MESSAGES = {
	// Template errors
	TEMPLATE_NOT_FOUND: "Không tìm thấy template",
	TEMPLATE_ALREADY_EXISTS: "Template đã tồn tại",
	INVALID_TEMPLATE_FORMAT: "Định dạng template không hợp lệ",
	TEMPLATE_PROCESSING_FAILED: "Xử lý template thất bại",
	TEMPLATE_UPLOAD_FAILED: "Tải lên template thất bại",
	TEMPLATE_READ_FAILED: "Đọc template thất bại",
	TEMPLATE_URL_INVALID: "URL template không hợp lệ",
	TEMPLATE_DOWNLOAD_FAILED: "Tải xuống template thất bại",

	// File errors
	FILE_UPLOAD_FAILED: "Tải lên file thất bại",
	FILE_READ_FAILED: "Đọc file thất bại",
	FILE_WRITE_FAILED: "Ghi file thất bại",
	INVALID_FILE_TYPE: "Loại file không hợp lệ",
	FILE_TOO_LARGE: "File quá lớn",
	FILE_EMPTY: "File rỗng",

	// Slide generation errors
	SLIDE_GENERATION_FAILED: "Tạo slide thất bại",
	INVALID_SLIDE_FORMAT: "Định dạng slide không hợp lệ",
	INVALID_SLIDE_COUNT: "Số lượng slide không hợp lệ",
	SLIDE_TOPIC_EMPTY: "Chủ đề slide không được để trống",
	PLACEHOLDER_REPLACEMENT_FAILED: "Thay thế placeholder thất bại",
	SLIDE_CONTENT_INVALID: "Nội dung slide không hợp lệ",

	// PowerPoint processing errors
	PPTX_PARSING_FAILED: "Phân tích file PowerPoint thất bại",
	PPTX_WRITING_FAILED: "Ghi file PowerPoint thất bại",
	PPTX_SHAPE_NOT_FOUND: "Không tìm thấy hình dạng trong PowerPoint",
	PPTX_TABLE_PROCESSING_FAILED: "Xử lý bảng trong PowerPoint thất bại",
	PPTX_CODE_BLOCK_FAILED: "Thêm code block vào PowerPoint thất bại",

	// Question errors
	QUESTION_NOT_FOUND: "Không tìm thấy câu hỏi",
	QUESTION_PROCESSING_FAILED: "Xử lý câu hỏi thất bại",
	INVALID_QUESTION_TYPE: "Loại câu hỏi không hợp lệ",

	// AI/LLM errors
	AI_SERVICE_UNAVAILABLE: "Dịch vụ AI tạm thời không khả dụng",
	AI_QUOTA_EXCEEDED: "Đã vượt quá giới hạn sử dụng AI",
	AI_RESPONSE_INVALID: "Phản hồi từ AI không hợp lệ",
	PYTHON_API_CONNECTION_FAILED: "Kết nối đến Python API thất bại",
	PYTHON_API_TIMEOUT: "Python API hết thời gian chờ",

	// Collection/Vector DB errors
	COLLECTION_NOT_FOUND: "Không tìm thấy bộ sưu tập",
	VECTOR_SEARCH_FAILED: "Tìm kiếm vector thất bại",

	// Cloudinary errors
	CLOUDINARY_UPLOAD_FAILED: "Tải lên Cloudinary thất bại",
	CLOUDINARY_DELETE_FAILED: "Xóa file trên Cloudinary thất bại",
	CLOUDINARY_CONNECTION_FAILED: "Kết nối đến Cloudinary thất bại",

	// Network/IO errors
	NETWORK_CONNECTION_FAILED: "Kết nối mạng thất bại",
	IO_OPERATION_FAILED: "Thao tác I/O thất bại",
	STREAM_PROCESSING_FAILED: "Xử lý stream thất bại",
} as const;

// ============================================================================
// ERROR MESSAGES - GENERAL SYSTEM
// ============================================================================

export const GENERAL_ERROR_MESSAGES = {
	// Validation errors (400)
	VALIDATION_FAILED: "Xác thực dữ liệu thất bại",
	INVALID_REQUEST: "Yêu cầu không hợp lệ",
	INVALID_PARAMETER: "Tham số không hợp lệ",
	MISSING_REQUIRED_FIELD: "Thiếu trường bắt buộc",

	// Authentication errors (401)
	UNAUTHORIZED: "Bạn cần đăng nhập để tiếp tục",
	INVALID_TOKEN: "Token không hợp lệ",
	TOKEN_EXPIRED: "Token đã hết hạn. Vui lòng đăng nhập lại",
	INVALID_CREDENTIALS: "Thông tin đăng nhập không chính xác",

	// Authorization errors (403)
	FORBIDDEN: "Bạn không có quyền truy cập",
	ACCESS_DENIED: "Truy cập bị từ chối",
	INSUFFICIENT_PERMISSIONS: "Bạn không có đủ quyền để thực hiện thao tác này",

	// Generic resource errors (404)
	RESOURCE_NOT_FOUND: "Không tìm thấy tài nguyên",

	// Generic conflict errors (409)
	RESOURCE_ALREADY_EXISTS: "Tài nguyên đã tồn tại",
	DUPLICATE_ENTRY: "Dữ liệu bị trùng lặp",

	// Business logic errors (422)
	BUSINESS_LOGIC_ERROR: "Lỗi logic nghiệp vụ",
	OPERATION_NOT_ALLOWED: "Thao tác không được phép",
	INVALID_STATE_TRANSITION: "Chuyển đổi trạng thái không hợp lệ",

	// File errors (413, 415) - duplicate from SERVICE but kept for consistency
	FILE_TOO_LARGE: "File quá lớn",
	UNSUPPORTED_FILE_TYPE: "Loại file không được hỗ trợ",
	FILE_UPLOAD_FAILED: "Tải lên file thất bại",

	// Server errors (500, 503)
	INTERNAL_SERVER_ERROR: "Lỗi máy chủ nội bộ",
	SERVICE_UNAVAILABLE: "Dịch vụ tạm thời không khả dụng",
	DATABASE_ERROR: "Lỗi cơ sở dữ liệu",
	EXTERNAL_SERVICE_ERROR: "Lỗi dịch vụ bên ngoài",
} as const;

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const LOADING_MESSAGES = {
	SENDING_MESSAGE: "Đang gửi tin nhắn...",
	AI_RESPONDING: "AI đang trả lời...",
	LOADING_CONVERSATIONS: "Đang tải cuộc hội thoại...",
	LOADING_MESSAGES: "Đang tải tin nhắn...",
	GENERATING_SLIDE: "Đang tạo slide...",
	UPLOADING_FILE: "Đang tải lên file...",
	PROCESSING: "Đang xử lý...",
} as const;

// ============================================================================
// INFO MESSAGES
// ============================================================================

export const INFO_MESSAGES = {
	NEW_CONVERSATION: "Bắt đầu cuộc hội thoại mới",
	NO_CONVERSATIONS: "Chưa có cuộc hội thoại nào. Bắt đầu chat ngay!",
	NO_MESSAGES: "Chưa có tin nhắn nào trong cuộc hội thoại này",
	EMPTY_MESSAGE: "Tin nhắn không được để trống",
} as const;

// ============================================================================
// CODE TO MESSAGE MAPPING
// ============================================================================

/**
 * Complete mapping from backend codes to Vietnamese messages
 */
export const CODE_TO_MESSAGE_MAP: Record<string, string> = {
	// Success codes
	...Object.entries(SUCCESS_MESSAGES).reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: value,
		}),
		{},
	),

	// Service error codes
	...Object.entries(SERVICE_ERROR_MESSAGES).reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: value,
		}),
		{},
	),

	// General error codes
	...Object.entries(GENERAL_ERROR_MESSAGES).reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: value,
		}),
		{},
	),
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getMessageFromCode(
	code?: string,
	fallbackMessage?: string,
): string {
	if (!code) {
		return fallbackMessage || GENERAL_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
	}

	return (
		CODE_TO_MESSAGE_MAP[code] ||
		fallbackMessage ||
		GENERAL_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
	);
}

export function getMessageWithTime(
	baseMessage: string,
	processingTime?: number,
): string {
	if (!processingTime) return baseMessage;

	const seconds = (processingTime / 1000).toFixed(2);
	return `${baseMessage} (${seconds}s)`;
}

export function isSuccessCode(code?: string): boolean {
	if (!code) return false;
	return code in SUCCESS_MESSAGES;
}

export function isErrorCode(code?: string): boolean {
	if (!code) return false;
	return code in SERVICE_ERROR_MESSAGES || code in GENERAL_ERROR_MESSAGES;
}
