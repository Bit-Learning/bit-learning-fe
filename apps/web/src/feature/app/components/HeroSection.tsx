import { useMemo } from "react";
import type { FC } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import CodeProfile from "@workspace/ui/components/custom/codeprofile";
import NumberTicker from "@workspace/ui/components/custom/ticker";

import BlueButton from "../../../shared/components/button/BlueButton";
import {
	usePublicStudentAvatars,
	usePublicStudentCount,
} from "../queries/usePublicStats";
import { formatCompactNumber } from "@/shared/format";

const HERO_AVATARS = [
	"/avatars/student-01.svg",
	"/avatars/student-02.svg",
	"/avatars/student-03.svg",
	"/avatars/student-04.svg",
	"/avatars/student-05.svg",
	"/avatars/student-06.svg",
];

const HeroSection: FC = () => {
	const { data: studentCount = 0, isLoading } = usePublicStudentCount();
	const { data: studentAvatars = [] } = usePublicStudentAvatars(3);

	const fallbackAvatars = useMemo(() => {
		const shuffled = [...HERO_AVATARS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 3);
	}, []);

	const avatars = studentAvatars.length
		? studentAvatars.map((student, index) => ({
				id: student.id,
				src: student.avatar || fallbackAvatars[index % fallbackAvatars.length],
				alt:
					`${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
					"Hoc sinh Bit Learning",
			}))
		: fallbackAvatars.map((src, index) => ({
				id: `fallback-${index}`,
				src,
				alt: "Hoc sinh Bit Learning",
			}));

	return (
		<section
			id="tour-hero"
			className="relative py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center"
		>
			<div className="relative z-10 space-y-6">
				<Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-md font-bold uppercase tracking-wider border-0">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
					</span>
					Nền tảng học lập trình số 1 cho K-12
				</Badge>
				<h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.1] text-slate-900">
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
						{avatars.map((avatar) => (
							<div
								key={avatar.id}
								className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
							>
								<img
									className="w-full h-full object-cover"
									alt={avatar.alt}
									src={avatar.src}
									loading="lazy"
								/>
							</div>
						))}
						<div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-[10px] font-bold glass">
							{isLoading ? "..." : `+${formatCompactNumber(studentCount)}`}
						</div>
					</div>
					<p className="text-sm text-slate-500 font-medium flex items-center gap-1">
						Hơn
						<NumberTicker
							value={studentCount}
							duration={2500}
							className="font-semibold text-primary"
							decimalPlaces={0}
						/>
						học sinh đã tham gia
					</p>
				</div>
			</div>
			<div className="relative z-10">
				<CodeProfile />
			</div>
		</section>
	);
};

export default HeroSection;
