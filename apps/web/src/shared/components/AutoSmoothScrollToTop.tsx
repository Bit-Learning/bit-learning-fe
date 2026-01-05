import { useEffect } from "react";

export default function AutoSmoothScrollToTop() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return null;
}
