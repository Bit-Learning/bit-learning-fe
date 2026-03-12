import React from "react";
import {
	Video,
	FileText,
	Bot,
	MessageCircle,
	Gamepad2,
	Terminal,
} from "lucide-react";
import FeatureCard from "./FeatureCard";
import { FeatureCardProps } from "../types";

const FeaturesSection: React.FC = () => {
	const features: FeatureCardProps[] = [
		{
			color: "blue",
			icon: Video,
			title: "Khóa học Online",
			description:
				"Video bài giảng sinh động, dễ hiểu từ chuyên gia đầu ngành informatics.",
			link: "/courses",
			linkText: "Học ngay",
		},
		{
			color: "orange",
			icon: FileText,
			title: "Ma trận đề thi",
			description:
				"Kho đề thi đa dạng theo sát chương trình giáo dục phổ thông mới.",
			link: "/",
			linkText: "Luyện tập",
		},
		{
			color: "purple",
			icon: Bot,
			title: "Trợ lý AI",
			description:
				"Bit Learning Bot - Người bạn đồng hành thông minh, giải đáp thắc mắc 24/7.",
			link: "#",
			linkText: "Hỏi AI",
		},
		{
			color: "green",
			icon: MessageCircle,
			title: "Diễn đàn học tập",
			description:
				"Kết nối cùng bạn bè, chia sẻ kinh nghiệm và cùng nhau tiến bộ.",
			link: "/forum",
			linkText: "Tham gia",
		},
		{
			color: "red",
			icon: Gamepad2,
			title: "Game Logic",
			description:
				"Rèn luyện tư duy lập trình qua hàng trăm trò chơi trí tuệ hấp dẫn.",
			link: "#",
			linkText: "Chơi ngay",
		},
		{
			color: "cyan",
			icon: Terminal,
			title: "Luyện Code",
			description:
				"Thử thách lập trình thực tế với trình soạn thảo code hiện đại.",
			link: "/problem",
			linkText: "Thử thách",
		},
	];

	return (
		<section className="py-16">
			<div className="text-center mb-12">
				<h3 className="text-3xl font-extrabold text-slate-900 mb-4">
					Mọi thứ bạn cần để trở thành Hacker nhí
				</h3>
				<p className="text-slate-600 max-w-2xl mx-auto">
					Nền tảng tích hợp đầy đủ công cụ giúp học sinh từ lớp 1 đến lớp 12
					tiếp cận công nghệ một cách tự nhiên và vui vẻ nhất.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{features.map((feature, index) => (
					<FeatureCard key={index} {...feature} />
				))}
			</div>
		</section>
	);
};

export default FeaturesSection;
