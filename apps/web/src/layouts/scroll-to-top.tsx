import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const ScrollToTop: React.FC = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		let ticking = false;

		const toggleVisibility = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setVisible((prev) => {
						const next = window.scrollY > 300;
						return prev === next ? prev : next;
					});
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0 }); // test bỏ smooth
	};

	return (
		<button
			onClick={scrollToTop}
			className={`fixed right-4 bottom-20 z-50 rounded-full bg-[#222] p-3 text-white shadow-lg transition-all duration-200
			${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
		>
			<ChevronUp className="h-6 w-6" />
		</button>
	);
};

export default ScrollToTop;
