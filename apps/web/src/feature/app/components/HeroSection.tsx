import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import CodeProfile from "@workspace/ui/components/custom/codeprofile";
import { ArrowRight } from "lucide-react";
import NumberTicker from "@workspace/ui/components/custom/ticker";

import BlueButton from "../../../shared/components/button/BlueButton";

const getRandomAvatar = () => {
	const gender = Math.random() > 0.5 ? "men" : "women";
	const id = Math.floor(Math.random() * 100);
	return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
};

const HeroSection: React.FC = () => {
	return (
		<section
			id="tour-hero"
			className="py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center"
		>
			<div className="space-y-8">
				<Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-lg font-bold uppercase tracking-wider border-0">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
					</span>
					Nền tảng học lập trình số 1 cho K-12
				</Badge>
				<h2 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900">
					Khám Phá Thế Giới{" "}
					<span className="text-primary italic">Lập Trình</span>
				</h2>
				<p className="text-lg text-slate-600 leading-relaxed max-w-lg">
					Xây dựng kỹ năng tương lai cùng lộ trình học tập được cá nhân hóa, kết
					hợp giữa tư duy logic, trò chơi và trí tuệ nhân tạo.
				</p>
				<div className="flex flex-wrap gap-4">
					<Link to="/courses">
						<BlueButton />
					</Link>
				</div>
				<div className="flex items-center gap-4 pt-4">
					<div className="flex -space-x-3">
						<div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
							<img
								className="w-full h-full object-cover"
								alt="Student avatar"
								src={getRandomAvatar()}
							/>
						</div>
						<div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
							<img
								className="w-full h-full object-cover"
								alt="Student avatar"
								src={getRandomAvatar()}
							/>
						</div>
						<div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
							<img
								className="w-full h-full object-cover"
								alt="Student avatar"
								src={getRandomAvatar()}
							/>
						</div>
						<div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-[10px] font-bold glass">
							+10k
						</div>
					</div>
					<p className="text-sm text-slate-500 font-medium flex items-center gap-1">
						Hơn
						<NumberTicker
							value={10000}
							duration={2500}
							className="font-semibold text-primary"
							decimalPlaces={0}
						/>
						học sinh đang tham gia mỗi ngày
					</p>
				</div>
			</div>
			<CodeProfile />
		</section>
	);
};

export default HeroSection;
