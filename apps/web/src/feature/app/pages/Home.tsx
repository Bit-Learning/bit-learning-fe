import OnboardingTour from "@/feature/onboarding/components/OnboardingTour";
import PageMeta from "@/shared/components/seo/page-meta";
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
			<PageMeta />
			<OnboardingTour />
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
