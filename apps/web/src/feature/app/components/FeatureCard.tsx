import React from "react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { ArrowRight } from "lucide-react";
import { FeatureCardProps } from "../types";

const FeatureCard: React.FC<FeatureCardProps> = ({ color, icon: Icon, title, description, link, linkText }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    green: "bg-green-50 border-green-100 text-green-600",
    red: "bg-red-50 border-red-100 text-red-600",
    cyan: "bg-cyan-50 border-cyan-100 text-cyan-600",
  };

  const bgClass = colorClasses[color]?.split(" ")[0] || "bg-blue-50";
  const borderClass = colorClasses[color]?.split(" ")[1] || "border-blue-100";
  const textClass = colorClasses[color]?.split(" ")[2] || "text-blue-600";

  return (
    <Card className={`group p-8 rounded-2xl ${bgClass} border ${borderClass} hover:shadow-xl transition-all`}>
      <CardContent className="p-0">
        <div
          className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center ${textClass} mb-6 shadow-sm group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">{description}</p>
        <a
          className={`${textClass} font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}
          href={link}
        >
          {linkText} <ArrowRight className="w-4 h-4" />
        </a>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
