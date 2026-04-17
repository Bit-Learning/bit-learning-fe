export const endpoints = {
	AUTH: "/auth",
	ACCOUNT: "/users",
	PAYMENT: "/payment",
};

export const API_PATH = {
	BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "/api",
};

export const MINIO_GAME_URL =
	import.meta.env.VITE_MINIO_GAME_URL ??
	"https://bit-learning-minio.lch.id.vn/scratch-games";

const getPublicSiteUrlFromCurrentOrigin = () => {
	if (typeof window === "undefined") return undefined;

	const currentUrl = new URL(window.location.origin);

	if (currentUrl.hostname.startsWith("bit-learning-admin.")) {
		currentUrl.hostname = currentUrl.hostname.replace(
			"bit-learning-admin.",
			"bit-learning.",
		);
		return currentUrl.origin;
	}

	if (currentUrl.hostname.startsWith("admin.")) {
		currentUrl.hostname = currentUrl.hostname.replace(/^admin\./, "");
		return currentUrl.origin;
	}

	return currentUrl.origin;
};

export const PUBLIC_SITE_URL =
	(import.meta.env as Record<string, string | undefined>).VITE_SITE_URL ??
	getPublicSiteUrlFromCurrentOrigin() ??
	"https://bit-learning.lch.id.vn";

export const getMatchingGamePlayUrl = ({
	gameId,
	grade,
	topicCode,
}: {
	gameId: number;
	grade?: number;
	topicCode?: string;
}) => {
	const query = new URLSearchParams({
		gameId: String(gameId),
	});

	if (grade !== undefined) {
		query.set("grade", String(grade));
	}

	if (topicCode) {
		query.set("topic", topicCode.trim().toUpperCase());
	}

	return `${PUBLIC_SITE_URL}/matching/game?${query.toString()}`;
};
