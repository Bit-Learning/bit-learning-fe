// Core game types (matching activity)

export type ItemType = "text" | "image" | "audio";

export interface Item {
	type: ItemType;
	value: string;
	alt?: string;
}

export interface Pair {
	id: string;
	left: Item;
	right: Item;
	hint?: string;
}

export interface StageConfig {
	shuffle?: boolean;
	timeLimit?: number | null;
	maxMistakes?: number | null;
	showHints?: boolean;
	// Optional layout type for the stage. If omitted, defaults to classic matching layout.
	layoutType?: "match" | "media-quiz";
}

export interface Stage {
	id: string;
	title: string;
	description?: string;
	config?: StageConfig;
	pairs: Pair[];
}

export interface GameData {
	meta: {
		gameId?: number;
		title: string;
		version: string;
		language: string;
		baseScoreMax?: number;
		difficultyMultiplier?: number;
		passingThreshold?: number;
	};
	stages: Stage[];
}

// Curriculum types (MOET-aligned, lớp 3–12, chủ đề A–F)

export type TopicCode = "A" | "B" | "C" | "D" | "E" | "F";

export interface Topic {
	code: TopicCode;
	title: string;
	description?: string;
	hasGame: boolean;
	gameData?: GameData;
}

export interface Grade {
	id: number; // 3–12
	label: string; // "Lớp 3" ... "Lớp 12"
	topics: Topic[];
}

export interface CurriculumData {
	grades: Grade[];
}

// UI config enums

export enum SymbolAnimationMode {
	Off = "off",
	On = "on",
}

// Game data for Lớp 3 – Chủ đề A: MÁY TÍNH VÀ EM
// CHỦ ĐỀ A: MÁY TÍNH VÀ EM
export const GAME_DATA_CLASS_3_A: GameData = {
	meta: {
		title: "Lớp 3 - A: MÁY TÍNH VÀ EM",
		version: "1.0.0",
		language: "vi",
	},
	stages: [
		{
			id: "info-processing",
			title: "Xử lý thông tin",
			description:
				"Ghép các thành phần xử lý thông tin với chức năng hoặc ví dụ tương ứng.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: null,
				showHints: true,
			},
			pairs: [
				{
					id: "brain-process",
					left: { type: "text", value: "Bộ não con người" },
					right: { type: "text", value: "Bộ phận thực hiện xử lý thông tin." },
					hint: "Nơi tiếp nhận thông tin và đưa ra quyết định [1].",
				},
				{
					id: "input-devices",
					left: { type: "text", value: "Bàn phím, chuột" },
					right: {
						type: "text",
						value: "Thiết bị tiếp nhận thông tin vào (thiết bị vào).",
					},
					hint: "Dùng để nhập dữ liệu vào máy tính [2].",
				},
				{
					id: "output-devices",
					left: { type: "text", value: "Màn hình, loa" },
					right: {
						type: "text",
						value: "Thiết bị đưa thông tin ra (thiết bị ra).",
					},
					hint: "Hiển thị hình ảnh hoặc phát âm thanh từ máy tính [2].",
				},
				{
					id: "info-forms",
					left: { type: "text", value: "Chữ, âm thanh, hình ảnh" },
					right: { type: "text", value: "Ba dạng thông tin thường gặp." },
					hint: "Các cách thông tin được thể hiện trong cuộc sống [1].",
				},
			],
		},
	],
};
// CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET
export const GAME_DATA_CLASS_3_B: GameData = {
	meta: {
		title: "Lớp 3 - B: MẠNG MÁY TÍNH VÀ INTERNET",
		version: "1.0.0",
		language: "vi",
	},
	stages: [
		{
			id: "internet-benefits",
			title: "Lợi ích của Internet",
			description: "Ghép các hoạt động với nội dung tương ứng trên Internet.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: 5,
				showHints: true,
				layoutType: "match",
			},
			pairs: [
				{
					id: "news",
					left: { type: "text", value: "Xem tin tức" },
					right: {
						type: "text",
						value: "Dự báo thời tiết, lịch thi đấu bóng đá.",
					},
					hint: "Thông tin cập nhật hàng ngày trên các trang web [3, 4].",
				},
				{
					id: "entertainment",
					left: { type: "text", value: "Giải trí" },
					right: {
						type: "text",
						value: "Nghe nhạc thiếu nhi, xem phim hoạt hình.",
					},
					hint: "Các hoạt động vui chơi trên Internet [3, 4].",
				},
				{
					id: "knowledge",
					left: { type: "text", value: "Học tập" },
					right: {
						type: "text",
						value: "Tìm hiểu về các hành tinh, truyện cổ tích.",
					},
					hint: "Internet là kho thông tin khổng lồ để khám phá [4].",
				},
				{
					id: "safety-rule",
					left: { type: "text", value: "Quy tắc an toàn" },
					right: {
						type: "text",
						value: "Chỉ xem nội dung phù hợp với lứa tuổi.",
					},
					hint: "Cần sự đồng ý và hướng dẫn của người lớn khi sử dụng [4].",
				},
			],
		},
		{
			id: "internet-benefits-image-quiz",
			title: "Lợi ích của Internet qua hình ảnh",
			description: "Nhìn hình ảnh và chọn nội dung phù hợp nhất.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: 5,
				showHints: true,
				layoutType: "media-quiz",
			},
			pairs: [
				{
					id: "news",
					left: {
						type: "image",
						value:
							"https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1169&auto=format&fit=crop",
					},
					right: {
						type: "text",
						value: "Dự báo thời tiết, lịch thi đấu bóng đá.",
					},
					hint: "Thông tin cập nhật hàng ngày trên các trang web [3, 4].",
				},
				{
					id: "entertainment",
					left: { type: "text", value: "Giải trí" },
					right: {
						type: "text",
						value: "Nghe nhạc thiếu nhi, xem phim hoạt hình.",
					},
					hint: "Các hoạt động vui chơi trên Internet [3, 4].",
				},
				{
					id: "knowledge",
					left: { type: "text", value: "Học tập" },
					right: {
						type: "text",
						value: "Tìm hiểu về các hành tinh, truyện cổ tích.",
					},
					hint: "Internet là kho thông tin khổng lồ để khám phá [4].",
				},
				{
					id: "safety-rule",
					left: { type: "text", value: "Quy tắc an toàn" },
					right: {
						type: "text",
						value: "Chỉ xem nội dung phù hợp với lứa tuổi.",
					},
					hint: "Cần sự đồng ý và hướng dẫn của người lớn khi sử dụng [4].",
				},
			],
		},
		{
			id: "internet-benefits-audio-quiz",
			title: "Lợi ích của Internet qua âm thanh",
			description: "Nghe âm thanh và chọn hoạt động tương ứng.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: 5,
				showHints: true,
				layoutType: "media-quiz",
			},
			pairs: [
				{
					id: "entertainment",
					left: { type: "audio", value: "/sounds/subway-surfers.mp3" },
					right: {
						type: "text",
						value: "Nghe nhạc thiếu nhi, xem phim hoạt hình.",
					},
					hint: "Các hoạt động vui chơi trên Internet [3, 4].",
				},
				{
					id: "news",
					left: { type: "text", value: "Xem tin tức" },
					right: {
						type: "text",
						value: "Dự báo thời tiết, lịch thi đấu bóng đá.",
					},
					hint: "Thông tin cập nhật hàng ngày trên các trang web [3, 4].",
				},
				{
					id: "knowledge",
					left: { type: "text", value: "Học tập" },
					right: {
						type: "text",
						value: "Tìm hiểu về các hành tinh, truyện cổ tích.",
					},
					hint: "Internet là kho thông tin khổng lồ để khám phá [4].",
				},
				{
					id: "safety-rule",
					left: { type: "text", value: "Quy tắc an toàn" },
					right: {
						type: "text",
						value: "Chỉ xem nội dung phù hợp với lứa tuổi.",
					},
					hint: "Cần sự đồng ý và hướng dẫn của người lớn khi sử dụng [4].",
				},
			],
		},
	],
};
// CHỦ ĐỀ C: TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN
export const GAME_DATA_CLASS_3_C: GameData = {
	meta: {
		title: "Lớp 3 - C: TỔ CHỨC LƯU TRỮ VÀ TÌM KIẾM",
		version: "1.0.0",
		language: "vi",
	},
	stages: [
		{
			id: "folder-tree",
			title: "Cấu trúc cây thư mục",
			description: "Ghép các khái niệm lưu trữ với đặc điểm của chúng.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: 5,
				showHints: true,
			},
			pairs: [
				{
					id: "drive",
					left: { type: "text", value: "Ổ đĩa" },
					right: {
						type: "text",
						value: "Được đặt tên bằng các chữ cái như (C:), (D:).",
					},
					hint: "Nơi lưu trữ lớn nhất trong máy tính [5].",
				},
				{
					id: "folder",
					left: { type: "text", value: "Thư mục" },
					right: {
						type: "text",
						value: "Có biểu tượng hình kẹp giấy màu vàng.",
					},
					hint: "Dùng để chứa các tệp hoặc thư mục con [5].",
				},
				{
					id: "file",
					left: { type: "text", value: "Tệp (File)" },
					right: {
						type: "text",
						value: "Chứa thông tin như văn bản, hình ảnh, video.",
					},
					hint: "Nằm bên trong các thư mục hoặc ổ đĩa [5].",
				},
				{
					id: "sorting",
					left: { type: "text", value: "Sắp xếp hợp lý" },
					right: {
						type: "text",
						value: "Giúp việc tìm kiếm thông tin nhanh hơn.",
					},
					hint: "Giống như việc sắp xếp sách trên giá hay quần áo trong tủ [4, 5].",
				},
			],
		},
	],
};
// CHỦ ĐỀ D: ĐẠO ĐỨC, PHÁP LUẬT VỀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ
export const GAME_DATA_CLASS_3_D: GameData = {
	meta: {
		title: "Lớp 3 - D: ĐẠO ĐỨC VÀ VĂN HÓA SỐ",
		version: "1.0.0",
		language: "vi",
	},
	stages: [
		{
			id: "info-protection",
			title: "Bảo vệ thông tin cá nhân",
			description: "Ghép loại thông tin với cách ứng xử an toàn.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: 5,
				showHints: true,
			},
			pairs: [
				{
					id: "personal-info",
					left: { type: "text", value: "Thông tin cá nhân" },
					right: {
						type: "text",
						value: "Họ tên, ngày sinh, địa chỉ nhà, số điện thoại.",
					},
					hint: "Những thông tin riêng tư cần được bảo vệ [6].",
				},
				{
					id: "stranger-danger",
					left: { type: "text", value: "Người lạ hỏi thông tin" },
					right: {
						type: "text",
						value: "Không cung cấp và báo cho người lớn.",
					},
					hint: "Kẻ xấu có thể lợi dụng thông tin này để gây hại [6].",
				},
				{
					id: "password-safety",
					left: { type: "text", value: "Mật khẩu" },
					right: {
						type: "text",
						value: "Không đặt mật khẩu dễ đoán, không chia sẻ.",
					},
					hint: "Dùng để bảo vệ tài khoản máy tính và email [6].",
				},
				{
					id: "bad-link",
					left: { type: "text", value: "Liên kết lạ" },
					right: {
						type: "text",
						value: "Không nháy chuột vào vì có thể chứa virus.",
					},
					hint: "Các đường link giả mạo có thể lừa đảo thông tin [6].",
				},
			],
		},
	],
};
// CHỦ ĐỀ E: ỨNG DỤNG TIN HỌC
export const GAME_DATA_CLASS_3_E: GameData = {
	meta: {
		title: "Lớp 3 - E: ỨNG DỤNG TIN HỌC",
		version: "1.0.0",
		language: "vi",
	},
	stages: [
		{
			id: "software-tools",
			title: "Phần mềm và công cụ",
			description: "Ghép phần mềm với chức năng chính của nó.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: 5,
				showHints: true,
			},
			pairs: [
				{
					id: "ms-powerpoint",
					left: { type: "text", value: "MS PowerPoint" },
					right: {
						type: "text",
						value: "Tạo các trang trình chiếu sinh động.",
					},
					hint: "Dùng để giới thiệu bản thân hoặc trình bày bài học [7].",
				},
				{
					id: "solarsystem",
					left: { type: "text", value: "SolarSystem" },
					right: {
						type: "text",
						value: "Khám phá Hệ Mặt Trời và các hành tinh.",
					},
					hint: "Phần mềm mô phỏng không gian 3D [8].",
				},
				{
					id: "mouse-skills",
					left: { type: "text", value: "Basic Mouse Skills" },
					right: {
						type: "text",
						value: "Luyện tập các thao tác sử dụng chuột.",
					},
					hint: "Giúp rèn luyện nháy chuột, nháy đúp, kéo thả [9].",
				},
				{
					id: "rapid-typing",
					left: { type: "text", value: "RapidTyping" },
					right: { type: "text", value: "Luyện gõ bàn phím bằng 10 ngón tay." },
					hint: "Giúp gõ chữ nhanh và chính xác hơn [3, 10].",
				},
			],
		},
	],
};
// CHỦ ĐỀ F: GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH
export const GAME_DATA_CLASS_3_F: GameData = {
	meta: {
		title: "Lớp 3 - F: GIẢI QUYẾT VẤN ĐỀ",
		version: "1.0.0",
		language: "vi",
	},
	stages: [
		{
			id: "problem-solving",
			title: "Các bước thực hiện công việc",
			description:
				"Ghép các phương pháp giải quyết vấn đề với ý nghĩa của chúng.",
			config: {
				shuffle: true,
				timeLimit: null,
				maxMistakes: 5,
				showHints: true,
			},
			pairs: [
				{
					id: "step-by-step",
					left: { type: "text", value: "Thực hiện theo bước" },
					right: {
						type: "text",
						value: "Các công việc nhỏ cần được sắp xếp thứ tự.",
					},
					hint: "Ví dụ như các bước tưới cây hay làm bánh trôi [11].",
				},
				{
					id: "divide-task",
					left: { type: "text", value: "Chia việc lớn thành việc nhỏ" },
					right: {
						type: "text",
						value: "Giúp công việc dễ hiểu và dễ thực hiện hơn.",
					},
					hint: "Cách đàn kiến khiêng chiếc lá to về tổ [12].",
				},
				{
					id: "conditional",
					left: { type: "text", value: "Thực hiện theo điều kiện" },
					right: { type: "text", value: 'Sử dụng cấu trúc "Nếu... thì...".' },
					hint: 'Ví dụ: "Nếu trời mưa thì em mang áo mưa" [12].',
				},
				{
					id: "computer-help",
					left: { type: "text", value: "Máy tính trợ giúp" },
					right: {
						type: "text",
						value: "Thực hiện tạo bài trình chiếu, gõ văn bản.",
					},
					hint: "Máy tính giúp con người hoàn thành nhiệm vụ hiệu quả hơn [10].",
				},
			],
		},
	],
};

// Helper to build topics per grade following MOET structure

const TOPIC_TITLES_PRIMARY: Record<TopicCode, string> = {
	A: "MÁY TÍNH VÀ EM",
	B: "MẠNG MÁY TÍNH VÀ INTERNET",
	C: "TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN",
	D: "ĐẠO ĐỨC, PHÁP LUẬT VỀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ",
	E: "ỨNG DỤNG TIN HỌC",
	F: "GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH",
};

const TOPIC_TITLES_SECONDARY: Record<TopicCode, string> = {
	...TOPIC_TITLES_PRIMARY,
	A: "MÁY TÍNH VÀ CỘNG ĐỒNG",
};

function createTopicsForGrade(grade: number): Topic[] {
	const topics: Topic[] = [];
	const titles = grade <= 5 ? TOPIC_TITLES_PRIMARY : TOPIC_TITLES_SECONDARY;

	// A
	topics.push({
		code: "A",
		title: titles.A,
		description: `Chủ đề A - ${titles.A.toLowerCase()}`,
		hasGame: grade === 3,
		gameData: grade === 3 ? GAME_DATA_CLASS_3_A : undefined,
	});

	// B (Lớp 7 không có B)
	if (grade !== 7) {
		topics.push({
			code: "B",
			title: titles.B,
			description: `Chủ đề B - ${titles.B.toLowerCase()}`,
			hasGame: grade === 3,
			gameData: grade === 3 ? GAME_DATA_CLASS_3_B : undefined,
		});
	}

	// C–F
	const remainingCodes: TopicCode[] = ["C", "D", "E", "F"];
	for (const code of remainingCodes) {
		let gameDataForTopic: GameData | undefined;

		if (grade === 3) {
			if (code === "C") gameDataForTopic = GAME_DATA_CLASS_3_C;
			if (code === "D") gameDataForTopic = GAME_DATA_CLASS_3_D;
			if (code === "E") gameDataForTopic = GAME_DATA_CLASS_3_E;
			if (code === "F") gameDataForTopic = GAME_DATA_CLASS_3_F;
		}

		topics.push({
			code,
			title: titles[code],
			description: `Chủ đề ${code} - ${titles[code].toLowerCase()}`,
			// Chỉ cho phép chơi từ backend với Lớp 3 - A, B.
			hasGame: false,
			gameData: gameDataForTopic,
		});
	}

	return topics;
}

export const CURRICULUM_DATA: CurriculumData = {
	grades: Array.from({ length: 10 }, (_, idx) => {
		const gradeNumber = 3 + idx; // 3..12
		return {
			id: gradeNumber,
			label: `Lớp ${gradeNumber}`,
			topics: createTopicsForGrade(gradeNumber),
		};
	}),
};

// Default game data currently used by the /game route
// (Lớp 3 - Chủ đề A)

export const GAME_DATA: GameData = GAME_DATA_CLASS_3_A;
