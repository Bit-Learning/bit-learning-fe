import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { motion } from "framer-motion";

export default function SlideBanner() {
	return (
		<section className="relative overflow-hidden bg-[#F5FAFF]">
			{/* Subtle background pattern (optional) */}
			<div className="absolute inset-0 opacity-20">
				<svg
					className="h-full w-full"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
					viewBox="0 0 800 400"
				>
					<circle cx="100" cy="100" r="200" fill="url(#grad)" />
					<defs>
						<linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor="#DCE8FF" />
							<stop offset="100%" stopColor="#EDF3FF" />
						</linearGradient>
					</defs>
				</svg>
			</div>

			{/* Content */}
			<div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-16 md:flex-row md:px-12 md:py-24">
				{/* LEFT SIDE (TEXT) */}
				<motion.div
					initial={{ opacity: 0, x: -50 }}
					whileInView={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className="flex-1 text-left"
				>
					<Badge className="mb-4 inline-block rounded-full bg-[#FBDBB11A] px-4 py-1 text-sm font-semibold text-[#FF8C00]">
						GIÁO DỤC THẾ KỶ 21
					</Badge>

					<h1 className="mb-4 text-3xl leading-tight font-extrabold text-[#14244A] md:text-4xl lg:text-5xl">
						Dự án STEAM mầm non
						<br />
						Phát triển tư duy và
						<br />
						Kỹ năng giải quyết vấn đề
					</h1>

					<p className="mb-8 max-w-xl text-base text-[#5C6672] md:text-lg">
						Dự án STEAM theo phương pháp Project Based Learning, Design Thinking
						nhằm phát triển năng lực tư duy và kỹ năng giải quyết vấn đề cho học
						sinh từ 2 – 6 tuổi.
					</p>

					<Button
						size="lg"
						variant="secondary"
						className="bg-[#FF8C00] text-white hover:bg-[#e97e00]"
					>
						Mua ngay
					</Button>
				</motion.div>

				{/* RIGHT SIDE (IMAGE) */}
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					viewport={{ once: true }}
					className="flex flex-1 justify-center"
				>
					<img
						src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
						alt="Slide Banner"
						className="w-full max-w-md rounded-lg shadow-lg md:max-w-lg lg:max-w-xl"
					/>
				</motion.div>
			</div>
		</section>
	);
}
