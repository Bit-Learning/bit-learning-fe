const LOCAL_API_BASE_URL = "http://localhost:8080/api/";
const LOCAL_WS_URL = "http://localhost:8080/ws";
const DEV_API_HOST = "api-dev.bitlearning.local";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function isBrowser() {
	return typeof window !== "undefined";
}

function isBitlearningLocalHost(hostname: string) {
	return hostname.endsWith(".bitlearning.local");
}

function isLocalUrl(url?: string) {
	if (!url) return true;
	if (url.startsWith("/")) return true;

	try {
		return LOCAL_HOSTS.has(new URL(url).hostname);
	} catch {
		return false;
	}
}

function getDevApiOrigin() {
	const protocol = isBrowser() ? window.location.protocol : "http:";
	return `${protocol}//${DEV_API_HOST}`;
}

export function getApiBaseUrl() {
	const configuredUrl = import.meta.env.VITE_API_BASE_URL;

	if (
		isBrowser() &&
		isBitlearningLocalHost(window.location.hostname) &&
		isLocalUrl(configuredUrl)
	) {
		return `${getDevApiOrigin()}/api`;
	}

	return configuredUrl ?? LOCAL_API_BASE_URL;
}

export function getWebSocketUrl() {
	const configuredUrl = import.meta.env.VITE_WS_URL;

	if (
		isBrowser() &&
		isBitlearningLocalHost(window.location.hostname) &&
		isLocalUrl(configuredUrl)
	) {
		return `${getDevApiOrigin()}/ws`;
	}

	return configuredUrl ?? LOCAL_WS_URL;
}
