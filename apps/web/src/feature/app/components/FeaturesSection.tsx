import type { FC } from "react";
import FeatureCard from "./FeatureCard";
import AuroraView from "@workspace/ui/components/custom/aurora";
import { HOME_FEATURES } from "../config/home-features";

const FeaturesSection: FC = () => {
	return (
		<section id="tour-features" className="py-16">
			<div className="text-center mb-12">
				<AuroraView />
				<p className="text-slate-600 max-w-2xl mx-auto mt-3">
					Nền tảng tích hợp đầy đủ công cụ giúp học sinh từ lớp 1 đến lớp 12
					tiếp cận công nghệ một cách tự nhiên và vui vẻ nhất.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{HOME_FEATURES.map((feature, index) => (
					<FeatureCard key={index} {...feature} />
				))}
			</div>
		</section>
	);
};

export default FeaturesSection;
