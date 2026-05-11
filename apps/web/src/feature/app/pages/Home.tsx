// import OnboardingTour from "@/feature/onboarding/components/OnboardingTour";
import PageMeta from "@/shared/components/seo/page-meta";
import {
	createOrganizationJsonLd,
	createWebsiteJsonLd,
} from "@/shared/components/seo/site-meta";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import MarqueeText from "@workspace/ui/components/custom/marqueeText";
import React, { useEffect } from "react";
import AIAssistantSection from "../components/AIAssistantSection";
import CodingPracticeSection from "../components/CodingPracticeSection";
import FeaturesSection from "../components/FeaturesSection";
import ForumSection from "../components/ForumSection";
import HeroSection from "../components/HeroSection";
import SnapHeroSections from "../components/SnapHeroSections";
import { TechSlider } from "../components/TechSlider";

const HomePage: React.FC = () => {
	const marqueeRef = useScrollReveal<HTMLDivElement>();
	const aiRef = useScrollReveal<HTMLDivElement>();
	const codingRef = useScrollReveal<HTMLDivElement>();
	const forumRef = useScrollReveal<HTMLDivElement>();

	// Enable smooth scroll on html element for the whole page
	useEffect(() => {
		document.documentElement.style.scrollBehavior = "smooth";
		return () => {
			document.documentElement.style.scrollBehavior = "";
		};
	}, []);

	return (
		<div className="text-slate-900 font-sans">
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

			{/* ── Snap zone: first 2 sections ── */}
			<SnapHeroSections>
				{[
					<div
						key="hero"
						className="container mx-auto lg:px-20 h-full flex flex-col justify-center"
					>
						<HeroSection />
						<TechSlider />
					</div>,

					<div
						key="features"
						className="max-w-7xl mx-auto px-6 lg:px-20 h-full flex flex-col justify-center"
					>
						<FeaturesSection />
					</div>,
				]}
			</SnapHeroSections>

			{/* ── Normal scroll zone ── */}
			<main className="max-w-7xl mx-auto px-6 lg:px-20">
				<div ref={marqueeRef} className="scroll-reveal">
					<MarqueeText />
				</div>
				<div ref={aiRef} className="scroll-reveal">
					<AIAssistantSection />
				</div>
				<div ref={codingRef} className="scroll-reveal">
					<CodingPracticeSection />
				</div>
				<div ref={forumRef} className="scroll-reveal">
					<ForumSection />
				</div>
			</main>
		</div>
	);
};

export default HomePage;
