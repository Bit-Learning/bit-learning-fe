import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import AIAssistantSection from "../components/AIAssistantSection";
import CodingPracticeSection from "../components/CodingPracticeSection";
import ForumSection from "../components/ForumSection";
import PageMeta from "@/shared/components/seo/page-meta";

const HomePage: React.FC = () => {
  return (
    <div className=" text-slate-900 font-sans">
      <PageMeta />
      <main className="max-w-7xl mx-auto px-6 lg:px-20 ">
        <HeroSection />
        <FeaturesSection />
        <AIAssistantSection />
        <CodingPracticeSection />
        <ForumSection />
      </main>
    </div>
  );
};

export default HomePage;
