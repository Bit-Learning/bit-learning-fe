import { useState, useCallback, useEffect } from "react";
import type { Step, EventData, Controls } from "react-joyride";

const TOUR_STORAGE_KEY = "bitlearning_onboarding_completed";

const steps: Step[] = [
	{
		target: "#tour-logo",
		content:
			"Chào mừng bạn đến với Bit Learning! Nhấn vào logo để quay về trang chủ bất cứ lúc nào.",
		skipBeacon: true,
		placement: "bottom",
	},
	{
		target: "#tour-navbar",
		content:
			"Đây là thanh điều hướng chính. Bạn có thể truy cập Khóa học, Bài tập, Diễn đàn, Công cụ AI và nhiều hơn nữa.",
		placement: "bottom",
	},
	{
		target: "#tour-header-actions",
		content: "Khu vực này chứa giỏ hàng, thông báo và hồ sơ cá nhân của bạn.",
		placement: "bottom-end",
	},
	{
		target: "#tour-hero",
		content:
			"Đây là phần giới thiệu chính. Nhấn 'Bắt đầu học ngay' để khám phá các khóa học lập trình dành cho bạn!",
		placement: "bottom",
	},
	{
		target: "#tour-features",
		content:
			"Khám phá tất cả tính năng: Khóa học Online, Đề thi, Trợ lý AI, Diễn đàn, Game Logic và Luyện Code.",
		placement: "top",
	},
	{
		target: "#tour-ai-assistant",
		content:
			"Gặp khó khăn? Bit Bot luôn sẵn sàng hỗ trợ bạn giải bài tập và giải thích code 24/7!",
		placement: "top",
	},
	{
		target: "#tour-coding-practice",
		content:
			"Môi trường luyện code chuyên nghiệp với trình soạn thảo trực quan, hỗ trợ nhiều ngôn ngữ lập trình.",
		placement: "top",
	},
	{
		target: "#tour-forum",
		content:
			"Tham gia Diễn đàn để giao lưu, hỏi đáp và chia sẻ kiến thức cùng cộng đồng BitLearners!",
		placement: "top",
	},
];

export function useOnboardingTour() {
	const [run, setRun] = useState(() => {
		return !localStorage.getItem(TOUR_STORAGE_KEY);
	});
	const [stepIndex, setStepIndex] = useState(0);

	// Safety net: if the tour is running but the current step's target element
	// doesn't exist in the DOM after mount, stop the tour to prevent an invisible
	// overlay from blocking all user interactions (especially the profile dropdown).
	useEffect(() => {
		if (!run) return;

		const timer = setTimeout(() => {
			const currentStep = steps[stepIndex];
			if (
				currentStep &&
				!document.querySelector(currentStep.target as string)
			) {
				setRun(false);
				localStorage.setItem(TOUR_STORAGE_KEY, "true");
			}
		}, 2000);

		return () => clearTimeout(timer);
	}, [run, stepIndex]);

	const handleEvent = useCallback((data: EventData, _controls: Controls) => {
		const { status, index, type } = data;

		if (status === "finished" || status === "skipped") {
			setRun(false);
			localStorage.setItem(TOUR_STORAGE_KEY, "true");
		}

		if (type === "step:after") {
			setStepIndex(index + 1);
		}
	}, []);

	const restartTour = useCallback(() => {
		localStorage.removeItem(TOUR_STORAGE_KEY);
		setStepIndex(0);
		setRun(true);
	}, []);

	return { run, steps, stepIndex, handleEvent, restartTour };
}
