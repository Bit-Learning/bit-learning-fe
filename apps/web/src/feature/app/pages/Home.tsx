// import OnboardingTour from "@/feature/onboarding/components/OnboardingTour";
import PageMeta from "@/shared/components/seo/page-meta";
import {
	createOrganizationJsonLd,
	createWebsiteJsonLd,
} from "@/shared/components/seo/site-meta";
import MarqueeText from "@workspace/ui/components/custom/marqueeText";
import React from "react";
import AIAssistantSection from "../components/AIAssistantSection";
import CodingPracticeSection from "../components/CodingPracticeSection";
import FeaturesSection from "../components/FeaturesSection";
import ForumSection from "../components/ForumSection";
import HeroSection from "../components/HeroSection";
import { TechSlider } from "../components/TechSlider";

const HomePage: React.FC = () => {
	return (
		<div className=" text-slate-900 font-sans">
			<PageMeta
				title="Bit Learning - Học lập trình và AI cho học sinh Việt Nam"
				description="Khám phá khóa học lập trình, luyện đề, trò chơi học tập và diễn đàn công nghệ dành cho học sinh trên Bit Learning."
				keywords={[
					"Bit Learning",
					"hoc lap trinh cho hoc sinh",
					"khoa hoc lap trinh online",
					"trang hoc tin hoc",
					"luyen de tin hoc",
				]}
				jsonLd={[createOrganizationJsonLd(), createWebsiteJsonLd()]}
			/>
			{/* <OnboardingTour /> */}
			<main className="max-w-7xl mx-auto px-6 lg:px-20 ">
				<HeroSection />
				<TechSlider />
				<FeaturesSection />
				<MarqueeText />
				<AIAssistantSection />
				<CodingPracticeSection />
				<ForumSection />
			</main>
		</div>
	);
};

export default HomePage;
