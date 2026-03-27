import React from "react";
import { Joyride } from "react-joyride";
import { useOnboardingTour } from "../hooks/useOnboardingTour";

const OnboardingTour: React.FC = () => {
	const { run, steps, stepIndex, handleEvent } = useOnboardingTour();

	return (
		<Joyride
			steps={steps}
			run={run}
			stepIndex={stepIndex}
			onEvent={handleEvent}
			continuous
			scrollToFirstStep
			options={{
				primaryColor: "#137fec",
				zIndex: 10000,
				arrowColor: "#fff",
				backgroundColor: "#fff",
				textColor: "#1e293b",
				showProgress: true,
				spotlightRadius: 16,
				overlayColor: "rgba(0, 0, 0, 0.5)",
				buttons: ["back", "close", "primary", "skip"],
			}}
			locale={{
				back: "Quay lại",
				close: "Đóng",
				last: "Hoàn tất",
				next: "Tiếp theo",
				skip: "Bỏ qua",
			}}
			styles={{
				tooltip: {
					borderRadius: 16,
					padding: 20,
					fontSize: 14,
				},
				tooltipContent: {
					padding: "12px 4px",
				},
				buttonPrimary: {
					borderRadius: 10,
					padding: "8px 20px",
					fontWeight: 600,
				},
				buttonBack: {
					borderRadius: 10,
					padding: "8px 16px",
					color: "#64748b",
					fontWeight: 600,
				},
				buttonSkip: {
					color: "#94a3b8",
					fontWeight: 500,
				},
			}}
		/>
	);
};

export default OnboardingTour;
