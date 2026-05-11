import React, { useCallback, useEffect, useRef, useState } from "react";

interface FullPageScrollProps {
	children: React.ReactNode[];
	dotColor?: string;
	dotActiveColor?: string;
}

const FullPageScroll: React.FC<FullPageScrollProps> = ({
	children,
	dotColor = "bg-slate-300",
	dotActiveColor = "bg-slate-800",
}) => {
	const [currentSection, setCurrentSection] = useState(0);
	const [isScrolling, setIsScrolling] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const touchStartY = useRef<number>(0);
	const totalSections = children.length;

	const scrollToSection = useCallback(
		(index: number) => {
			if (index < 0 || index >= totalSections || isScrolling) return;

			setIsScrolling(true);
			setCurrentSection(index);

			setTimeout(() => {
				setIsScrolling(false);
			}, 800);
		},
		[isScrolling, totalSections],
	);

	// Wheel scroll — chỉ chuyển section khi nội dung bên trong đã scroll đến đầu/cuối
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			if (isScrolling) return;

			// Tìm section đang hiển thị
			const sectionEl =
				containerRef.current?.querySelectorAll<HTMLDivElement>(
					"[data-section]",
				)[currentSection];

			if (sectionEl) {
				const { scrollTop, scrollHeight, clientHeight } = sectionEl;
				const atTop = scrollTop === 0;
				const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 2;

				// Nếu còn nội dung để scroll bên trong, không chặn
				if (e.deltaY > 0 && !atBottom) return;
				if (e.deltaY < 0 && !atTop) return;
			}

			e.preventDefault();

			if (e.deltaY > 0) {
				scrollToSection(currentSection + 1);
			} else {
				scrollToSection(currentSection - 1);
			}
		};

		const container = containerRef.current;
		container?.addEventListener("wheel", handleWheel, { passive: false });
		return () => container?.removeEventListener("wheel", handleWheel);
	}, [currentSection, isScrolling, scrollToSection]);

	// Touch scroll
	useEffect(() => {
		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches[0]) touchStartY.current = e.touches[0].clientY;
		};

		const handleTouchEnd = (e: TouchEvent) => {
			if (isScrolling) return;
			if (!e.changedTouches[0]) return;
			const delta = touchStartY.current - e.changedTouches[0].clientY;
			if (Math.abs(delta) < 50) return;

			if (delta > 0) {
				scrollToSection(currentSection + 1);
			} else {
				scrollToSection(currentSection - 1);
			}
		};

		const container = containerRef.current;
		container?.addEventListener("touchstart", handleTouchStart, {
			passive: true,
		});
		container?.addEventListener("touchend", handleTouchEnd, { passive: true });
		return () => {
			container?.removeEventListener("touchstart", handleTouchStart);
			container?.removeEventListener("touchend", handleTouchEnd);
		};
	}, [currentSection, isScrolling, scrollToSection]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "PageDown") {
				e.preventDefault();
				scrollToSection(currentSection + 1);
			} else if (e.key === "ArrowUp" || e.key === "PageUp") {
				e.preventDefault();
				scrollToSection(currentSection - 1);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentSection, isScrolling, scrollToSection]);

	return (
		<div
			ref={containerRef}
			className="relative w-full overflow-hidden"
			style={{ height: "100dvh" }}
		>
			{/* Sections container */}
			<div
				className="transition-transform duration-700 ease-in-out will-change-transform"
				style={{
					transform: `translateY(-${currentSection * 100}dvh)`,
					height: `${totalSections * 100}dvh`,
				}}
			>
				{children.map((child, index) => (
					<div
						key={index}
						data-section
						className="w-full overflow-y-auto"
						style={{ height: "100dvh" }}
					>
						{child}
					</div>
				))}
			</div>

			{/* Dot indicator */}
			<nav
				aria-label="Page sections"
				className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
			>
				{children.map((_, index) => (
					<button
						key={index}
						aria-label={`Go to section ${index + 1}`}
						aria-current={currentSection === index ? "true" : undefined}
						onClick={() => scrollToSection(index)}
						className={`
							w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer
							${currentSection === index ? `${dotActiveColor} scale-125` : `${dotColor} hover:scale-110`}
						`}
					/>
				))}
			</nav>
		</div>
	);
};

export default FullPageScroll;
