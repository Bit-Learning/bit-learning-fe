import type React from "react";
import { Helmet } from "react-helmet-async";

interface PageMetaProps {
	title?: string;
	description?: string;
	keywords?: string | string[];
	url?: string;
	image?: string;
	type?: "website" | "article" | "service";
	jsonLd?: object;
	noIndex?: boolean;
}

const PageMeta: React.FC<PageMetaProps> = ({
	title = "Bit Learning - Nơi đào tạo lập trình hàng đầu Việt Nam",
	description = "Trung tâm đào tạo lập trình hàng đầu Việt Nam, khóa học, tư duy lập trình",
	keywords = "website, khóa học, tư duy lập trình",
	url = "https://bithub.edu.vn",
	image = "./Logo.png",
	type = "website",
	jsonLd,
	noIndex = false,
}) => {
	const siteTitle = "Bit Learning";
	const fullTitle = title.includes(siteTitle)
		? title
		: `${title} | ${siteTitle}`;

	return (
		<Helmet>
			{/* Basic Meta Tags */}
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			{keywords && (
				<meta
					name="keywords"
					content={Array.isArray(keywords) ? keywords.join(", ") : keywords}
				/>
			)}
			<link rel="canonical" href={url} />

			{/* Robots */}
			{noIndex && <meta name="robots" content="noindex, nofollow" />}

			{/* Open Graph */}
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={url} />
			<meta property="og:image" content={image} />
			<meta property="og:type" content={type} />
			<meta property="og:site_name" content={siteTitle} />
			<meta property="og:locale" content="vi_VN" />

			{/* Twitter Card */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />

			{/* Additional Meta */}
			<meta name="author" content="Sky Việt Agency" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />

			{/* JSON-LD Structured Data */}
			{jsonLd && (
				<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
			)}
		</Helmet>
	);
};

export default PageMeta;
