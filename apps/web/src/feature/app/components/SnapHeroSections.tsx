import React, { useCallback, useEffect, useRef, useState } from "react";

interface SnapHeroSectionsProps {
	children: [React.ReactNode, React.ReactNode];
	dotColor?: string;
	dotActiveColor?: string;
}

/**
 * Hybrid scroll: first 2 sections behave like full-page snap on the window
 * scroll context (no nested scrollable div). Once the user scrolls past
 * section 1, native page scroll takes over seamlessly.
 *
 * Strategy:
 * - Sections are normal divs with height: 100dvh in the page flow.
 * - We intercept wheel/touch on window while the viewport is within the
 *   snap zone (scrollY < section1.bottom) and programmatically
 *   scrollIntoView with a debounce so it feels snappy but not sticky.
 * - Parallax: section 0 content gets a CSS custom property --parallax-y
 *   driven by scrollY so it drifts upward as the user scrolls down.
 * - Fade-in: IntersectionObserver adds a visible class when each section
 *   enters the viewport.
 */
const SnapHeroSections: React.FC<SnapHeroSectionsProps> = ({
	children,
	dotColor = "bg-slate-300/70",
	dotActiveColor = "bg-slate-800",
}) => {
	const section0Ref = useRef<HTMLDivElement>(null);
	const section1Ref = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const isSnapping = useRef(false);
	const touchStartY = useRef(0);

	// ── helpers ──────────────────────────────────────────────────────────────

	const getSnapZoneBottom = useCallback(() => {
		const el = section1Ref.current;
		if (!el) return 0;
		return el.getBoundingClientRect().bottom + window.scrollY;
	}, []);

	const inSnapZone = useCallback(() => {
		return window.scrollY < getSnapZoneBottom() - 10;
	}, [getSnapZoneBottom]);

	const snapTo = useCallback((index: number) => {
		const el = index === 0 ? section0Ref.current : section1Ref.current;
		if (!el || isSnapping.current) return;
		isSnapping.current = true;
		el.scrollIntoView({ behavior: "smooth", block: "start" });
		// Release snap lock after animation settles
		setTimeout(() => {
			isSnapping.current = false;
		}, 750);
	}, []);

	// ── active dot via IntersectionObserver ──────────────────────────────────

	useEffect(() => {
		const refs = [section0Ref.current, section1Ref.current];
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const idx = refs.indexOf(entry.target as HTMLDivElement);
					if (entry.isIntersecting && idx !== -1) {
						setActiveIndex(idx);
						(entry.target as HTMLElement).classList.add(
							"snap-section--visible",
						);
					}
				}
			},
			{ threshold: 0.5 },
		);
		refs.forEach((el) => el && observer.observe(el));
		// Trigger section 0 immediately
		section0Ref.current?.classList.add("snap-section--visible");
		return () => observer.disconnect();
	}, []);

	// ── wheel snap ───────────────────────────────────────────────────────────

	useEffect(() => {
		let wheelAccum = 0;
		let wheelTimer: ReturnType<typeof setTimeout> | null = null;

		const handleWheel = (e: WheelEvent) => {
			if (!inSnapZone()) return;
			e.preventDefault();

			wheelAccum += e.deltaY;

			if (wheelTimer) clearTimeout(wheelTimer);
			wheelTimer = setTimeout(() => {
				if (Math.abs(wheelAccum) < 30) {
					wheelAccum = 0;
					return;
				}
				if (wheelAccum > 0) {
					// scroll down
					if (activeIndex === 0) snapTo(1);
					else {
						// exit snap zone — scroll past section 1
						isSnapping.current = true;
						window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
						setTimeout(() => {
							isSnapping.current = false;
						}, 750);
					}
				} else {
					// scroll up
					snapTo(activeIndex === 1 ? 0 : 0);
				}
				wheelAccum = 0;
			}, 50);
		};

		window.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			window.removeEventListener("wheel", handleWheel);
			if (wheelTimer) clearTimeout(wheelTimer);
		};
	}, [activeIndex, inSnapZone, snapTo]);

	// ── touch snap ───────────────────────────────────────────────────────────

	useEffect(() => {
		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches[0]) touchStartY.current = e.touches[0].clientY;
		};

		const handleTouchEnd = (e: TouchEvent) => {
			if (!inSnapZone() || !e.changedTouches[0]) return;
			const delta = touchStartY.current - e.changedTouches[0].clientY;
			if (Math.abs(delta) < 40) return;

			if (delta > 0) {
				if (activeIndex === 0) snapTo(1);
				else {
					isSnapping.current = true;
					window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
					setTimeout(() => {
						isSnapping.current = false;
					}, 750);
				}
			} else {
				snapTo(activeIndex === 1 ? 0 : 0);
			}
		};

		window.addEventListener("touchstart", handleTouchStart, { passive: true });
		window.addEventListener("touchend", handleTouchEnd, { passive: true });
		return () => {
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [activeIndex, inSnapZone, snapTo]);

	// ── keyboard ─────────────────────────────────────────────────────────────

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!inSnapZone()) return;
			if (e.key === "ArrowDown" || e.key === "PageDown") {
				e.preventDefault();
				if (activeIndex === 0) snapTo(1);
				else {
					isSnapping.current = true;
					window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
					setTimeout(() => {
						isSnapping.current = false;
					}, 750);
				}
			} else if (e.key === "ArrowUp" || e.key === "PageUp") {
				e.preventDefault();
				snapTo(0);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeIndex, inSnapZone, snapTo]);

	// ── parallax ─────────────────────────────────────────────────────────────

	useEffect(() => {
		const handleScroll = () => {
			const inner = section0Ref.current?.querySelector<HTMLElement>(
				"[data-parallax-inner]",
			);
			if (!inner) return;
			const scrollY = window.scrollY;
			const h = window.innerHeight;
			const progress = Math.min(scrollY / h, 1);
			inner.style.transform = `translateY(${progress * -60}px)`;
			inner.style.opacity = `${1 - progress * 0.55}`;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// ── dot visibility: hide when scrolled past snap zone ────────────────────

	const [dotsVisible, setDotsVisible] = useState(true);

	useEffect(() => {
		const handleScroll = () => {
			setDotsVisible(window.scrollY < getSnapZoneBottom() - 80);
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [getSnapZoneBottom]);

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div className="relative bg-background">
			{/* Section 0 — Hero */}
			<div
				ref={section0Ref}
				className="snap-section relative w-full overflow-hidden bg-background"
				style={{ height: "100dvh" }}
			>
				<div data-parallax-inner className="h-full will-change-transform">
					{children[0]}
				</div>
			</div>

			{/* Section 1 — Features */}
			<div
				ref={section1Ref}
				className="snap-section relative w-full bg-background"
				style={{ height: "100dvh", overflowY: "auto" }}
			>
				{children[1]}
			</div>

			{/* Dot indicator */}
			<nav
				aria-label="Hero sections"
				className={[
					"fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3",
					"transition-opacity duration-300",
					dotsVisible ? "opacity-100" : "opacity-0 pointer-events-none",
				].join(" ")}
			>
				{[0, 1].map((i) => (
					<button
						key={i}
						aria-label={`Go to section ${i + 1}`}
						aria-current={activeIndex === i ? "true" : undefined}
						onClick={() => snapTo(i)}
						className={[
							"w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer",
							activeIndex === i
								? `${dotActiveColor} scale-125`
								: `${dotColor} hover:scale-110`,
						].join(" ")}
					/>
				))}
			</nav>
		</div>
	);
};

export default SnapHeroSections;
