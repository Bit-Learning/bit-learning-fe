import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport it gets the `visible` class added,
 * triggering a CSS fade+slide-up animation defined in globals.css.
 */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
	const ref = useRef<T>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					el.classList.add("scroll-reveal--visible");
					observer.unobserve(el);
				}
			},
			{ threshold },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold]);

	return ref;
}
