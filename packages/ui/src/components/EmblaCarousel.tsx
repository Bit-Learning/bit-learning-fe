"use client";

import type { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import type * as React from "react";
import { cn } from "../lib/utils";

interface CarouselProps extends React.PropsWithChildren {
	options?: EmblaOptionsType;
	className?: string;
}

export function Carousel({ children, options, className }: CarouselProps) {
	const [emblaRef] = useEmblaCarousel(
		{ loop: true, align: "start", ...options },
		[Autoplay({ delay: 3000 })],
	);

	return (
		<div className={cn("overflow-hidden", className)} ref={emblaRef}>
			<div className="flex gap-4">{children}</div>
		</div>
	);
}

export function CarouselItem({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("min-w-[250px] flex-shrink-0", className)}>
			{children}
		</div>
	);
}
