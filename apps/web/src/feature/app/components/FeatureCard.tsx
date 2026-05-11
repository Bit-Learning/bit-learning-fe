import { Card, CardContent } from "@workspace/ui/components/Card";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { FC } from "react";
import { FeatureCardProps } from "../types";

const FeatureCard: FC<FeatureCardProps> = ({
	color,
	title,
	description,
	link,
	linkText,
	thumbnail,
}) => {
	const colorClasses = {
		blue: "text-blue-600",
		orange: "text-orange-600",
		purple: "text-purple-600",
		green: "text-green-600",
		red: "text-red-600",
		cyan: "text-cyan-600",
	};

	const textClass = colorClasses[color] || "text-blue-600";

	return (
		<Card
			className="
      group
      p-0
      overflow-hidden
      rounded-2xl
      bg-white
      border
      border-slate-200
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl
      cursor-pointer
      dark:bg-slate-800
      dark:border-slate-700
    "
		>
			<div className="relative w-full h-40 overflow-hidden">
				<div
					className="
          absolute inset-0
          bg-cover bg-center
          transition-transform duration-500
          group-hover:scale-105
        "
					style={{ backgroundImage: `url(${thumbnail})` }}
				/>
			</div>

			<CardContent className="p-6">
				<h4 className="text-lg font-semibold mb-2 text-slate-900">{title}</h4>

				<p className="text-slate-600 text-sm leading-relaxed mb-4">
					{description}
				</p>

				<Link
					className={`
            ${textClass}
            inline-flex
            items-center
            gap-1
            font-semibold
            text-sm
            transition-all
            group-hover:gap-2
          `}
					to={link}
				>
					{linkText}

					<ArrowRight
						className="
            w-4 h-4
            transition-transform
            group-hover:translate-x-1
          "
					/>
				</Link>
			</CardContent>
		</Card>
	);
};

export default FeatureCard;
