import { getApiBaseUrl } from "@/shared/config/runtime-urls";

export const endpoints = {
	AUTH: "/auth",
	ACCOUNT: "/users",
	PAYMENT: "/payment",
};

export const API_PATH = {
	BASE_URL: getApiBaseUrl(),
};

export const MINIO_GAME_URL =
	import.meta.env.VITE_MINIO_GAME_URL ??
	"https://bit-learning-minio.lch.id.vn/scratch-games";

export const MINIO_THUMBNAIL_URL =
	import.meta.env.VITE_MINIO_THUMBNAIL_URL ??
	"https://bit-learning-minio.lch.id.vn/game-thumbnails";

const LOCAL_PUBLIC_SITE_URL = "http://localhost:5173";
const PRODUCTION_PUBLIC_SITE_URL = "https://bit-learning.lch.id.vn";

const isLocalAdminHost = (hostname: string) =>
	hostname === "localhost" ||
	hostname === "127.0.0.1" ||
	hostname === "0.0.0.0";

const getPublicSiteUrlFromAdminOrigin = () => {
	if (typeof window === "undefined") return undefined;

	return isLocalAdminHost(window.location.hostname)
		? LOCAL_PUBLIC_SITE_URL
		: PRODUCTION_PUBLIC_SITE_URL;
};

export const PUBLIC_SITE_URL =
	(import.meta.env as Record<string, string | undefined>)
		.VITE_PUBLIC_SITE_URL ??
	getPublicSiteUrlFromAdminOrigin() ??
	PRODUCTION_PUBLIC_SITE_URL;

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
