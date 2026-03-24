import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/terms")({
	component: TermsPage,
});

function TermsPage() {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<h1 className="mb-4 text-3xl font-bold">Terms of Service</h1>
			<p className="mb-2">
				Welcome to our application. By using our services, you agree to comply
				with and be bound by the following terms and conditions.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">
				1. Acceptance of Terms
			</h2>
			<p className="mb-2">
				By accessing or using our services, you agree to be bound by these Terms
				of Service and our Privacy Policy.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">
				2. User Responsibilities
			</h2>
			<p className="mb-2">
				You are responsible for maintaining the confidentiality of your account
				information and for all activities that occur under your account.
			</p>

			<h2 className="mb-2 mt-6 text-2xl font-semibold">
				3. Prohibited Activities
			</h2>
			<p className="mb-2">
				You agree not to engage in any activities that may harm our services or
				interfere with other users' access to our services.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">4. Termination</h2>
			<p className="mb-2">
				We reserve the right to terminate or suspend your account at our sole
				discretion, without prior notice, for conduct that we believe violates
				these Terms of Service or is harmful to other users of our services.
			</p>
			<h2 className="mb-2 mt-6 text-2xl font-semibold">5. Changes to Terms</h2>
			<p className="mb-2">
				We may update these Terms of Service from time to time. We will notify
				you of any changes by posting the new Terms of Service on this page.
			</p>
			<p className="mt-6">
				If you have any questions about these Terms of Service, please contact
				us.
			</p>
		</div>
	);
}
