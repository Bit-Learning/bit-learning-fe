import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, "..");
const routesDir = path.join(webRoot, "src", "routes");
const publicDir = path.join(webRoot, "public");
const configPath = path.join(
	webRoot,
	"src",
	"shared",
	"components",
	"seo",
	"site-config.json",
);

const ROOT_PATH = "/";

const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL ?? config.siteUrl);

const routeFiles = await collectRouteFiles(routesDir);
const sitemapPaths = buildSitemapPaths(routeFiles, config.sitemap);

await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(
	path.join(publicDir, "sitemap.xml"),
	buildSitemapXml(siteUrl, sitemapPaths, config.sitemap.overrides),
	"utf8",
);
await fs.writeFile(
	path.join(publicDir, "robots.txt"),
	buildRobotsTxt(siteUrl),
	"utf8",
);

console.log(`Generated sitemap.xml with ${sitemapPaths.length} URLs`);

function normalizeSiteUrl(value) {
	return value.replace(/\/+$/, "");
}

function normalizePathname(pathname) {
	if (!pathname || pathname === ROOT_PATH) {
		return ROOT_PATH;
	}

	const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
	return withLeadingSlash.replace(/\/+$/, "") || ROOT_PATH;
}

async function collectRouteFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return collectRouteFiles(entryPath);
			}

			if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
				return [entryPath];
			}

			return [];
		}),
	);

	return files.flat();
}

function buildSitemapPaths(files, sitemapConfig) {
	const paths = files
		.map((filePath) =>
			path.relative(routesDir, filePath).replaceAll(path.sep, "/"),
		)
		.filter((relativeFile) => !relativeFile.includes("$"))
		.filter(
			(relativeFile) => !sitemapConfig.excludeRouteFiles.includes(relativeFile),
		)
		.filter(
			(relativeFile) =>
				!sitemapConfig.excludeRoutePrefixes.some((prefix) =>
					relativeFile.startsWith(prefix),
				),
		)
		.map(toRoutePath)
		.filter(Boolean)
		.filter((routePath) => !sitemapConfig.excludePaths.includes(routePath))
		.filter(
			(routePath) =>
				!sitemapConfig.excludePathPrefixes.some(
					(prefix) =>
						routePath === prefix || routePath.startsWith(`${prefix}/`),
				),
		);

	return [...new Set(paths)].sort((left, right) => {
		if (left === ROOT_PATH) {
			return -1;
		}

		if (right === ROOT_PATH) {
			return 1;
		}

		return left.localeCompare(right);
	});
}

function toRoutePath(relativeFile) {
	const withoutExtension = relativeFile.replace(/\.(ts|tsx)$/, "");
	const withoutLayouts = withoutExtension
		.replace(/^_layout\//, "")
		.replace(/^_headerOnly\//, "");
	const withoutIndex = withoutLayouts
		.replace(/\/index$/, "")
		.replace(/^index$/, "");
	const dottedPath = withoutIndex.replaceAll(".", "/");
	const normalized = normalizePathname(dottedPath);

	return normalized === "/404" ? null : normalized;
}

function buildSitemapXml(siteUrlValue, paths, overrides) {
	const urls = paths
		.map((routePath) => {
			const routeOverride = overrides[routePath] ?? {};
			const loc =
				routePath === ROOT_PATH
					? `${siteUrlValue}/`
					: `${siteUrlValue}${routePath}`;
			const changefreq = routeOverride.changefreq
				? `\n    <changefreq>${routeOverride.changefreq}</changefreq>`
				: "";
			const priority =
				typeof routeOverride.priority === "number"
					? `\n    <priority>${routeOverride.priority.toFixed(1)}</priority>`
					: "";

			return `  <url>\n    <loc>${loc}</loc>${changefreq}${priority}\n  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobotsTxt(siteUrlValue) {
	return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrlValue}/sitemap.xml\n`;
}
