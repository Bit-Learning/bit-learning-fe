import type React from "react";
import { memo } from "react";
import Header from "@/layouts/header";

interface Props {
	children?: React.ReactNode;
}

const PresentationLayoutInner: React.FC<Props> = ({ children }) => {
	return (
		<div className="mx-auto">
			<Header />
			{children}
		</div>
	);
};

const PresentationLayout = memo(PresentationLayoutInner);

export default PresentationLayout;
