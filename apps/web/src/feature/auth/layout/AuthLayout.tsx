import { Link } from "@tanstack/react-router";
import type React from "react";

interface Props {
	children: React.ReactNode;
	showBackGround?: boolean;
}

export default function AuthLayout({ children, showBackGround = true }: Props) {
	return (
		<div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
			<div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
				{children}
				{showBackGround && (
					<div
						className="hidden h-full w-full items-center lg:grid lg:w-1/2 dark:bg-white/5"
						style={{
							backgroundImage:
								"url('https://eccommonstorage.blob.core.windows.net/codered/uploads/EAS6DoeQg3SWYqxcytORUj831DFxSibNCJpbiRqq.jpg')",
							backgroundSize: "cover, cover",
							backgroundPosition: "center, center",
							backgroundRepeat: "no-repeat, no-repeat",
							backgroundBlendMode: "overlay, normal",
						}}
					>
						<div className="relative z-1 flex items-center justify-center">
							<div className="flex max-w-xs flex-col items-center">
								<Link to="/" className="mb-4 block">
									<div className="flex items-center space-x-2">
										<img
											src="./Logo.png"
											alt="Bit Learning Logo"
											className="h-10 w-10 object-contain"
										/>
									</div>
								</Link>
							</div>
						</div>
					</div>
				)}
				<div className="fixed right-6 bottom-6 z-50 hidden sm:block" />
			</div>
		</div>
	);
}
