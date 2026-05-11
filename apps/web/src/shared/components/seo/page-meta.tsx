import type React from "react";
import { useRouterState } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import {
	DEFAULT_DESCRIPTION,
	DEFAULT_IMAGE,
	DEFAULT_IMAGE_ALT,
	DEFAULT_KEYWORDS,
	DEFAULT_TITLE,
	SITE_AUTHOR,
	SITE_LOCALE,
	SITE_NAME,
	getRobotsContent,
	resolveSeoUrl,
} from "./site-meta";

interface PageMetaProps {
	title?: string;
	description?: string;
	keywords?: string | string[];
	url?: string;
	image?: string;
	imageAlt?: string;
	type?: string;
	jsonLd?: object | object[];
	noIndex?: boolean;
}

const PageMeta: React.FC<PageMetaProps> = ({
	title = DEFAULT_TITLE,
	description = DEFAULT_DESCRIPTION,
	keywords = DEFAULT_KEYWORDS,
	url,
	image = DEFAULT_IMAGE,
	imageAlt = DEFAULT_IMAGE_ALT,
	type = "website",
	jsonLd,
	noIndex,
}) => {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const fullTitle = title.includes(SITE_NAME)
		? title
		: `${title} | ${SITE_NAME}`;
	const canonicalUrl = resolveSeoUrl(url ?? pathname);
	const socialImageUrl = resolveSeoUrl(image);
	const robotsContent = getRobotsContent(pathname, noIndex);
	const jsonLdItems = Array.isArray(jsonLd)
		? jsonLd.filter(Boolean)
		: jsonLd
			? [jsonLd]
			: [];

	return (
		<Helmet htmlAttributes={{ lang: "vi" }}>
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			{keywords && (
				<meta
					name="keywords"
					content={Array.isArray(keywords) ? keywords.join(", ") : keywords}
				/>
			)}
			<meta name="author" content={SITE_AUTHOR} />
			<meta name="robots" content={robotsContent} />
			<link rel="canonical" href={canonicalUrl} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={canonicalUrl} />
			<meta property="og:image" content={socialImageUrl} />
			<meta property="og:image:alt" content={imageAlt} />
			<meta property="og:type" content={type} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:locale" content={SITE_LOCALE} />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={socialImageUrl} />
			{jsonLdItems.map((item, index) => (
				<script key={index} type="application/ld+json">
					{JSON.stringify(item)}
				</script>
			))}
		</Helmet>
	);
};

export default PageMeta;
