import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const ScrollToTop: React.FC = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			setVisible(window.scrollY > 300);
		};
		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return visible ? (
		<button
			onClick={scrollToTop}
			className="fixed right-4 bottom-20 z-50 cursor-pointer rounded-full bg-[#222] p-3 text-white shadow-lg transition hover:bg-red-600"
			aria-label="Scroll to top"
		>
			<ChevronUp className="h-6 w-6" />
		</button>
	) : null;
};

export default ScrollToTop;
