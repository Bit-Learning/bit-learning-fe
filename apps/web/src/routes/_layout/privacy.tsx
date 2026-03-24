import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/privacy")({
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
			<p className="mb-2">
				Your privacy is important to us. This Privacy Policy explains how we
				collect, use, and protect your personal information when you use our
				services.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">
				1. Information We Collect
			</h2>
			<p className="mb-2">
				We may collect personal information such as your name, email address,
				and payment information when you use our services.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">
				2. How We Use Your Information
			</h2>
			<p className="mb-2">
				We use your personal information to provide and improve our services,
				process transactions, and communicate with you
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">3. Data Security</h2>
			<p className="mb-2">
				We implement appropriate security measures to protect your personal
				information from unauthorized access, disclosure, or alteration.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">4. Your Rights</h2>
			<p className="mb-2">
				You have the right to access, correct, or delete your personal
				information. You may also opt-out of marketing communications at any
				time.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">
				5. Changes to This Policy
			</h2>
			<p className="mb-2">
				We may update this Privacy Policy from time to time. We will notify you
				of any changes by posting the new Privacy Policy on this page.
			</p>
			<p className="mt-6">
				If you have any questions about this Privacy Policy, please contact us.
			</p>
		</div>
	);
}
