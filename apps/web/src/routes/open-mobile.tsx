import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/open-mobile")({
	component: OpenMobilePage,
});

const PLAY_STORE_URL =
	"https://play.google.com/store/apps/details?id=com.app.bitlearning";

const APP_DEEP_LINK = "https://bit-learning.lch.id.vn/open-mobile";

function OpenMobilePage() {
	const [countdown, setCountdown] = useState(3);

	useEffect(() => {
		// Countdown timer — if the app opens, the browser tab loses focus
		// and this timer effectively pauses/becomes irrelevant.
		// If the app is NOT installed, user stays on this page and gets
		// redirected to the Play Store after countdown reaches 0.
		const interval = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					window.location.href = PLAY_STORE_URL;
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-900 p-8 text-white">
			<img
				src="/Logo.png"
				alt="Bit Learning"
				className="h-14 w-auto object-contain"
			/>

			<div className="flex flex-col items-center gap-3 text-center">
				<h1 className="text-2xl font-bold">Opening Bit Learning App…</h1>
				<p className="max-w-sm text-gray-400">
					If the app doesn't open automatically, you'll be redirected to the
					Play Store in{" "}
					<span className="font-semibold text-blue-400">{countdown}s</span>
				</p>
			</div>

			<div className="flex flex-wrap justify-center gap-4">
				{/* Primary CTA — triggers App Link on Android mobile browsers */}
				<a
					href={APP_DEEP_LINK}
					className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition-colors hover:bg-blue-700"
				>
					Open App
				</a>

				{/* Fallback — manual Play Store redirect */}
				<a
					href={PLAY_STORE_URL}
					className="rounded-lg border border-gray-600 px-6 py-3 font-semibold transition-colors hover:border-blue-400 hover:text-blue-400"
				>
					Download on Play Store
				</a>
			</div>
		</div>
	);
}
