import { useRouterState } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import {
	DEFAULT_DESCRIPTION,
	DEFAULT_IMAGE,
	DEFAULT_IMAGE_ALT,
	DEFAULT_TITLE,
	SITE_AUTHOR,
	SITE_LOCALE,
	SITE_NAME,
	getRobotsContent,
	resolveSeoUrl,
} from "./site-meta";

export default function DefaultSeo() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const canonicalUrl = resolveSeoUrl(pathname);
	const imageUrl = resolveSeoUrl(DEFAULT_IMAGE);

	return (
		<Helmet htmlAttributes={{ lang: "vi" }}>
			<title>{DEFAULT_TITLE}</title>
			<meta name="description" content={DEFAULT_DESCRIPTION} />
			<meta name="author" content={SITE_AUTHOR} />
			<meta name="application-name" content={SITE_NAME} />
			<meta name="theme-color" content="#ffffff" />
			<meta name="robots" content={getRobotsContent(pathname)} />
			<link rel="canonical" href={canonicalUrl} />
			<meta property="og:locale" content={SITE_LOCALE} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:type" content="website" />
			<meta property="og:title" content={DEFAULT_TITLE} />
			<meta property="og:description" content={DEFAULT_DESCRIPTION} />
			<meta property="og:url" content={canonicalUrl} />
			<meta property="og:image" content={imageUrl} />
			<meta property="og:image:alt" content={DEFAULT_IMAGE_ALT} />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={DEFAULT_TITLE} />
			<meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
			<meta name="twitter:image" content={imageUrl} />
		</Helmet>
	);
}
