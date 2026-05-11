import { Link } from "@tanstack/react-router";
import type React from "react";

interface Props {
	children: React.ReactNode;
	showBackGround?: boolean;
	/** Optional background image path, defaults to '/auth.jpg' */
	backgroundImageUrl?: string;
}

export default function AuthLayout({
	children,
	showBackGround = true,
	backgroundImageUrl = "/auth.jpg",
}: Props) {
	return (
		<div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
			<div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
				{children}
				{showBackGround && (
					<div
						className="hidden h-full w-full items-center lg:grid lg:w-1/2 dark:bg-white/5"
						style={{
							backgroundImage: `url('${backgroundImageUrl}')`,
							backgroundSize: "cover, cover",
							backgroundPosition: "center, center",
							backgroundRepeat: "no-repeat, no-repeat",
							backgroundBlendMode: "overlay, normal",
						}}
					></div>
				)}
				<div className="fixed right-6 bottom-6 z-50 hidden sm:block" />
			</div>
		</div>
	);
}
