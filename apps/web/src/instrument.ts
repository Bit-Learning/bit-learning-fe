import * as Sentry from "@sentry/react";

// import { router } from './main'

Sentry.init({
	dsn: "https://8cc8881dd0a53305d70072a1a7eb7362@o4510429049389056.ingest.us.sentry.io/4510429052076032",
	// Adds request headers and IP for users, for more info visit:
	// https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
	sendDefaultPii: true,
	integrations: [
		// If you're using react router, use the integration for your react router version instead.
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
		Sentry.browserTracingIntegration(),
		Sentry.replayIntegration(),
		Sentry.feedbackIntegration({
			// Additional SDK configuration goes in here, for example:
			colorScheme: "system",
		}),
		// Sentry.tanstackRouterBrowserTracingIntegration(router),
	],
	// Enable logs to be sent to Sentry
	enableLogs: true,
	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for tracing.
	// Learn more at
	// https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
	tracesSampleRate: 1.0,
	// Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
	tracePropagationTargets: [/^\//, /^https:\/\/yourserver\.io\/api/],
	// Capture Replay for 10% of all sessions,
	// plus for 100% of sessions with an error
	// Learn more at
	// https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
});
