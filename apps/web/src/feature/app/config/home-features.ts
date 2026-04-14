import {
	Bot,
	FileText,
	Gamepad2,
	MessageCircle,
	Terminal,
	Video,
} from "lucide-react";
import type { FeatureCardProps } from "../types";

export const HOME_FEATURES: FeatureCardProps[] = [
	{
		color: "blue",
		icon: Video,
		title: "Khóa học Online",
		description:
			"Video bài giảng sinh động, dễ hiểu từ chuyên gia đầu ngành informatics.",
		thumbnail: "/online_courses.jpg",
		link: "/courses",
		linkText: "Học ngay",
	},
	{
		color: "orange",
		icon: FileText,
		title: "Ma trận đề thi",
		description:
			"Kho đề thi đa dạng theo sát chương trình giáo dục phổ thông mới.",
		thumbnail: "/library.jpg",
		link: "/exams",
		linkText: "Luyện tập",
	},
	{
		color: "purple",
		icon: Bot,
		title: "Trợ lý AI",
		description:
			"Bit Bot - Người bạn đồng hành thông minh, giải đáp thắc mắc 24/7.",
		thumbnail: "/bot.webp",
		link: "/chat-ai",
		linkText: "Hỏi AI",
	},
	{
		color: "green",
		icon: MessageCircle,
		title: "Diễn đàn học tập",
		description:
			"Kết nối cùng bạn bè, chia sẻ kinh nghiệm và cùng nhau tiến bộ.",
		thumbnail: "/home_forum.jpg",
		link: "/forum",
		linkText: "Tham gia",
	},
	{
		color: "red",
		icon: Gamepad2,
		title: "Game Logic",
		description:
			"Rèn luyện tư duy lập trình qua hàng trăm trò chơi trí tuệ hấp dẫn.",
		thumbnail: "/console.jpg",
		link: "/games",
		linkText: "Chơi ngay",
	},
	{
		color: "cyan",
		icon: Terminal,
		title: "Luyện Code",
		description:
			"Thử thách lập trình thực tế với trình soạn thảo code hiện đại.",
		thumbnail: "/coding.jpg",
		link: "/problem",
		linkText: "Thử thách",
	},
];
