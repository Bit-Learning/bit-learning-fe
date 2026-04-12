import siteConfig from "./site-config.json";

type JsonLdValue = Record<string, unknown>;

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const ROOT_PATH = "/";
const INDEXABLE_ROBOTS =
	"index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large";
const NO_INDEX_ROBOTS = "noindex, nofollow";

const normalizeSiteUrl = (value: string) => value.replace(/\/+$/, "");

export const SITE_NAME = siteConfig.siteName;
export const SITE_URL = normalizeSiteUrl(
	import.meta.env.VITE_SITE_URL ?? siteConfig.siteUrl,
);
export const SITE_LOCALE = siteConfig.locale;
export const SITE_AUTHOR = siteConfig.author;
export const DEFAULT_TITLE = siteConfig.defaultTitle;
export const DEFAULT_DESCRIPTION = siteConfig.defaultDescription;
export const DEFAULT_KEYWORDS = siteConfig.defaultKeywords;
export const DEFAULT_IMAGE = siteConfig.defaultImage;
export const DEFAULT_IMAGE_ALT = siteConfig.defaultImageAlt;

const NO_INDEX_PATHS = new Set(siteConfig.noIndexPaths.map(normalizePathname));
const NO_INDEX_PREFIXES = siteConfig.noIndexPrefixes.map(normalizePathname);
const NO_INDEX_PATTERNS = [
	/^\/contests\/[^/]+\/submissions(?:\/|$)/,
	/^\/forum\/[^/]+\/edit(?:\/|$)/,
	/^\/lectures\/[^/]+(?:\/|$)/,
	/^\/quiz-attempts\/[^/]+(?:\/|$)/,
	/^\/quiz-sessions\/[^/]+(?:\/|$)/,
	/^\/submissions\/[^/]+(?:\/|$)/,
];

export function normalizePathname(pathname: string | undefined) {
	if (!pathname || pathname === ROOT_PATH) {
		return ROOT_PATH;
	}

	const pathOnly = pathname.split("?")[0]?.split("#")[0] ?? ROOT_PATH;
	const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;

	return withLeadingSlash.replace(/\/+$/, "") || ROOT_PATH;
}

export function resolveSeoUrl(pathOrUrl?: string) {
	if (!pathOrUrl) {
		return `${SITE_URL}/`;
	}

	if (ABSOLUTE_URL_PATTERN.test(pathOrUrl)) {
		return pathOrUrl;
	}

	const normalizedPath = normalizePathname(pathOrUrl);
	return normalizedPath === ROOT_PATH
		? `${SITE_URL}/`
		: `${SITE_URL}${normalizedPath}`;
}

export function isNoIndexPath(pathname: string) {
	const normalizedPath = normalizePathname(pathname);

	if (NO_INDEX_PATHS.has(normalizedPath)) {
		return true;
	}

	if (
		NO_INDEX_PREFIXES.some(
			(prefix) =>
				normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
		)
	) {
		return true;
	}

	return NO_INDEX_PATTERNS.some((pattern) => pattern.test(normalizedPath));
}

export function getRobotsContent(pathname: string, noIndex?: boolean) {
	const shouldNoIndex =
		typeof noIndex === "boolean" ? noIndex : isNoIndexPath(pathname);

	return shouldNoIndex ? NO_INDEX_ROBOTS : INDEXABLE_ROBOTS;
}

export function createOrganizationJsonLd(
	overrides: JsonLdValue = {},
): JsonLdValue {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteConfig.organization.name,
		url: `${SITE_URL}/`,
		logo: resolveSeoUrl(siteConfig.organization.logo),
		...overrides,
	};
}

export function createWebsiteJsonLd(overrides: JsonLdValue = {}): JsonLdValue {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE_NAME,
		url: `${SITE_URL}/`,
		description: DEFAULT_DESCRIPTION,
		inLanguage: "vi",
		...overrides,
	};
}
