import React from "react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Bot, MessageCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const AIAssistantSection: React.FC = () => {
	const navigate = useNavigate();

	return (
		<section id="tour-ai-assistant" className="py-16">
			<div className="bg-[#137fec] rounded-4xl overflow-hidden relative p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12">
				<div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right" />
				<div className="relative w-48 h-48 lg:w-64 lg:h-64 shrink-0">
					<div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center animate-bounce duration-3000">
						<div className="w-4/5 h-4/5 bg-white rounded-full flex items-center justify-center shadow-2xl">
							<Bot className="w-20 h-20 text-[#137fec]" />
						</div>
					</div>
					<Badge className="absolute -top-4 -right-4 bg-[#ff8c42] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg rotate-12 border-0">
						Hỏi gì cũng biết!
					</Badge>
				</div>
				<div className="relative z-10 flex-1 text-center lg:text-left">
					<h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">
						Bạn gặp khó khăn? Hỏi Bit Learning Bot ngay!
					</h3>
					<p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-xl">
						Trợ lý AI thân thiện luôn sẵn sàng hỗ trợ bạn giải bài tập, giải
						thích các dòng code khó hiểu và gợi ý ý tưởng sáng tạo 24/7.
					</p>
					<div className="flex flex-wrap justify-center lg:justify-start gap-4">
						<Button
							onClick={() => {
								navigate({ to: "/chat-ai" });
							}}
							className="px-8 py-3 bg-white text-[#137fec] rounded-xl font-extrabold flex items-center gap-2 hover:bg-slate-50 shadow-xl"
						>
							<MessageCircle className="w-5 h-5" />
							Chat với Bit Learning Bot
						</Button>
						<div className="flex items-center gap-3 text-white/80 text-sm italic font-medium">
							<span className="flex gap-1">
								<span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
								<span className="w-2 h-2 rounded-full bg-green-400 animate-pulse delay-75" />
								<span className="w-2 h-2 rounded-full bg-green-400 animate-pulse delay-150" />
							</span>
							Bot đang trực tuyến...
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AIAssistantSection;
