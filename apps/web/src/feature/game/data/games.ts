export interface Game {
	id: string;
	title: string;
	category: string;
	categorySlug: string;
	image: string;
	rating: number;
	tag?: string;
}

export interface GameDetail extends Game {
	subtitle: string;
	description: string;
	views: string;
	likes: string;
	heroImage: string;
	developerName: string;
	developerTitle: string;
	developerBio: string;
	developerImage: string;
	instructions: string[];
	relatedGames: Game[];
	comments: Comment[];
}

export interface Comment {
	id: string;
	username: string;
	level: number;
	avatar: string;
	body: string;
	likes: number;
	timeAgo: string;
}

export const typingGames: Game[] = [
	{
		id: "keyboard-warriors",
		title: "Keyboard Warriors",
		category: "Typing",
		categorySlug: "typing",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBkOklGCYMDhZS5apaqr62yyk2wOlSiW1JjVVuYwkRE742WOSvU3NCEJ8TWGwuef389isEOPF9mIOEIJ1fBuskz-szzpHNAvwE2O0GVfCoP9UEXDfzCtaFdsP6jMeHb9h3cBsj5iKU2El9K9_OJL6JJdpOPuJIa2nvXCEw0s6BpxhscbsanJMoz9iuO7aPvJ6UmHIz2b9WY2xt4tmu4ynTlli6XuPDT8L7LBLCP3RRPusfOFtq_sjJ75SsrNbuHRZYRdkfj3b9KYPQC",
		rating: 4.8,
	},
	{
		id: "speed-racer-typing",
		title: "Speed Racer Typing",
		category: "Typing",
		categorySlug: "typing",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDIcJBnr1K9NyhpRHuffHRuUQabgLEVpDA_Pg6Sx5DoKbIC_Ct72x-Rz3kknSKrgZO6SkcAXyX60gxV22yICWHOxfIqjTOSFelqqreIV_kDnsspH-sBl7nlWGcdBS2h81REz-KlPkl4pniRsQuN_hkGudnfTNWm9uB-I1nnP0pfssecgVdGvOgcK6xu67j36leEfaHvLXwu1R_dGAzzZ4W176NbXAjqOvnZGJjHUY4lyyz9eTLnHQcrR11M-lEc3GLwIgQg7jFQSHMR",
		rating: 4.6,
	},
	{
		id: "letter-rain",
		title: "Letter Rain",
		category: "Typing",
		categorySlug: "typing",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAR_nRiBhmsN6Wp7KA0WUcYkOvloJiIqCEpkT9f7Kq7YaaPtQZ8pzOy-8iEswBy7zb8qJ49hgGIpXEJtkzrr3PTX6nu_FPwtndNduHZw9afNFwA8nwT4xWe_TZav2MLGbTJwo_HBiHcleG56YXENIzXoOZXjAz5IcEMy3sPdtiObg5Msfav4zJI6Zp0WqkcmDgb2aJ9n2Mz6flxnsJzvmjqP29ZnbySSr9l0r-tDG_l2pxMrdT1UuQ5AL5EmN8o5qR0shf53XUTYpjY",
		rating: 4.5,
	},
	{
		id: "code-breaker",
		title: "Code Breaker",
		category: "Typing",
		categorySlug: "typing",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAMiiZmQT0XvbRZ3QGZDGuKQG-WeyF2yDW1bxm0VohM-rAF6b1WSMZEnkT44p0v_lpC7jclx_HD3wlUv_i--F6ZuwHw3ZSvtKdDYZhKlTsl1VMZ_nXjVL0LvSimyqO27YGSYcK02CFv8wN59tRCK4YtPb2ar6gXm6wnDYBvvkbQZMLrUU5rzfDOx_RGWAZCyrWVLd-Q9NNG8kkvXaLm1Mw5Iu4io8_2B5bzzrMRpxGU-mvfQHYgP6FYFLGQrC5fbUjWSWdtzkhFRsfX",
		rating: 4.7,
	},
	{
		id: "scroll-master",
		title: "Scroll Master",
		category: "Typing",
		categorySlug: "typing",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBqXUMSqtFO3QHlXENWQYg884FZNwcyi5W97SH7VK247k7Rsg7UZUG3-4-wrTdDlMHV4vIXyfcJEf2pleVDnX9jnjF0IrC8j5UK541tdlpr0NWJRcX371CDUvMpvPTkMMThD79PW7RXxYBbA9xsJKm-eARKzKE7V9Wj4dd7ZxEwEpEz0mE2HYqTW6hG5x67GxqkGaNd9gmOJ130ssa_uWfR4cctlB5MQ-3iutqEvpOpA-csdVEMbNmgq5p2rHxFQj4rR7QTHUzqbb5W",
		rating: 4.3,
	},
	{
		id: "swift-fingers",
		title: "Swift Fingers",
		category: "Typing",
		categorySlug: "typing",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBOfSbZ9FERICSO6fh7rKXYpvLNvvVl2TwmSAPeQXHEH_0D5ZNfVkC8kknURbnIEIxOLAehedyzEOeSxNL_tDwa2oCa1PD5I4-FjsK_Sc8JWYpWkL5fwHgg6u1N7yiUfB0NuYpYm6rjyA-SrdJIC2rJkPaMfgCsciplZXMvFU4JcYYn-kKgrdIf_kXpEc7dWIdxBGjdGFVNcMRCbYyvGMVUhDgUdKV6aY17E6rXD6zOzddjXRx2PkkCn2FKBc78dWj7sOzD2Jm2X08-",
		rating: 4.4,
	},
];

export const matchingGames: Game[] = [
	{
		id: "pattern-finder",
		title: "Pattern Finder",
		category: "Matching",
		categorySlug: "matching",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCR7p3m9wySOmqvlKg8Dd0_tTUuz0xMR5_yLWFuipbSguFDma5fHFK0gFfVejcH7Q6jT6_oVl1gVvTxNBjC6XRGQOEPO5IDSUjUTLhszSHbb1t_XT2iLeQsLdFUPi9GO5yyqa-IapR64kvGEbwvJZ7G7_X8s7w8Khlpduyao6zBBYa61VYA5WSavoRQzqPbr-Dxbbgva_Dbmo9KT-hT0SawYWr0VfPtTbDFXqXXzt_l3HiSzoOhXPlS6F-cAi-JTXHOh0X0ct_tBAXV",
		rating: 4.4,
	},
	{
		id: "fruit-matcher",
		title: "Fruit Matcher",
		category: "Matching",
		categorySlug: "matching",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBQHp6IplP_By70c0n5VJUlwi8pbXHSLDFgnMqxkOXayEd6Xjksm5aNwIPsmV_DHm1CnHiez4lBj9UgWrwhG7054anGKrMX0Ra8lh-8_7H-6Zj5t8EkxVGP7_Ec1vMKYQR9E0D9mgR2Tf_N9FK_P8vcuHOG6s1bFcnpuInwfwm2_MrrniFIXDIkCJid-mtg247Tbf2pj0m7DtCIRhkB430DcWx9tyPZlXoYjm3KT5NJe1EWjFsqeWO7dtihidVdSmTd0Hg6i1QwQs5i",
		rating: 4.2,
	},
	{
		id: "gem-quest",
		title: "Gem Quest",
		category: "Matching",
		categorySlug: "matching",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBQVHVyeyV3wMByjzskAvbx0WdCCinqU6qAGbIznIomdGtrx0S_GROChYAzskr5LmjNxhXNNmvav-aVK29VRa4amOL79X4nUDQXh2pObgptoG0Bb0dJyPbRaLpo5gza-avzY-mAT0yDMzwbhnqullUc-qOFyRDtprM3dfUFl5A24MyKV_s30N7zgAB9_VdMlepHapmRIpzXixWhD9Kde7jyAdkgV_9g-SbAPeRanqAVKH2GTC2ErAj2TYQIUpNng5OlyGP-OLCtOsTV",
		rating: 4.6,
	},
	{
		id: "web-spinner",
		title: "Web Spinner",
		category: "Matching",
		categorySlug: "matching",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuB_hQ4gI5L17aZn3W-87ETk1weu2bMhzYZuWeRAnMjcmsgO2dXVXeHrjvRc1e01UqpoOOYbhMCC9g_-uO23UvUAAmhiqib1azmFlppnxKU1L2b-wCw8yn5-dlTwON5yEmo783qu19VGIGV3mL4Bd9o2LXjBIECMlwvkOGUm4HDy2D_cDNOkaVJKWAA6EgqbnLSIujtu9B1LpDKCLtS9-PhSiBMNUPpLTgZJFaM4FNdMr_yn8J_OeakjfBRkqltqpMUrALPW1OWCf8Kr",
		rating: 4.1,
	},
	{
		id: "memory-quest",
		title: "Memory Quest",
		category: "Matching",
		categorySlug: "matching",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCzSkLQUtZxUUyJ50fWc3P6jJxthVzovqBI7P6f7Pnu8ADprFFhdF-s48NHFatg_nFkJev-n4S3JzpXC_WWA-xhcR9Idldpv6saP_zwUPIqRb5Js0EHbvR1Hx-ChUlMNKjIPG4YcKgcqIahlEMTsv8D9aTxRHFuTiFUOhJ3-WSzmaAlvpZ-c3YOnxumMRN9cS9J_RlF6EMpcWAuzKBPHn_OpU6CeRjJZstjP7akwKWISV3PfeCirKz-BZbWz_m7ysfSlBS1L_Tovm5T",
		rating: 4.5,
	},
];

export const quizGames: Game[] = [
	{
		id: "trivia-master",
		title: "Trivia Master",
		category: "Quiz",
		categorySlug: "quiz",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBmf0zLQrg4Y8CCiEzlO9rK0wSDfOPoibNIn2skiivNPqTlHlmDEPDTx7msudpc0WGZ-GOqbnXwziGqVkPrmu01fqT4saByrBY9IFDjm8Hij6qLmwp4TdP09Z2znHxEvYnY2Xv0qME7Ko0Xw-UfD-ppLDWLZqO1VkcCF31gQxehljwAzuPZe-Zt-lwk7TlimJkHOkaup9b_VdhgEtUKoJAfIsEG0jbPxUZy_i7MwX2Z-NX_mwVZXLITj_E0U7nS7IiLGJXLRVB5GgQU",
		rating: 4.8,
	},
	{
		id: "math-blitz",
		title: "Math Blitz",
		category: "Quiz",
		categorySlug: "quiz",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCccBB3NpEqKGI97qD5ZA2kHBwoHDjoa47NtUKAKJAxtvtAvrPShMrs_ZbNWS0pqI2rd0xB_BbDKJmqfpye1TRu9USrFGr_xW0lNzNre4aiqS6hrIDninEFecmZdBBRuoq7EpUmm5al73cmuWSBPHMsEPRDgOdLGCQPNOWsF4Cjpl5vU_l6C8B1hYR01m_8s0x8UMVjzTORLo0m4kOFqh_4TEtARUrRcugVC5XO24Nfin71EXhTCIHjs1KqF4MLo118twtkE5PRVP3p",
		rating: 4.7,
	},
	{
		id: "history-explorer",
		title: "History Explorer",
		category: "Quiz",
		categorySlug: "quiz",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDsY4c7NPDDNhI8_uEeXGL-xSn9JiZF95jencrRUzq38X0UcgqnsK_njZZ_BjKs4kyBDsuJNL4viII7IvUN6pVUWafumli0Sp0hfzHZAsZYhWc6bLHbQvRBfesOIh_dSNqR6xQotz9tABP0i1_JRytQJtgyf0HepTPEYLLDTvslzWQ_OVskgGaQvT2zDq2XGDN7Gt3CXSc1jrK4DoLbbfyuXbjMMdlbtQn3ytAXiWUKVrjfda8Pzn6EC7oQoFimvsypsZlVR7G4-QXi",
		rating: 4.6,
	},
	{
		id: "science-lab",
		title: "Science Lab",
		category: "Quiz",
		categorySlug: "quiz",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAlszVQj2gjje-GINNX5hxHLbcB5JFNzBaPxGhfoFpJy6fprhHnZ7E7c7Awqnor1uXS9Yo3dnTgVjNqRdvP5qJoqnpJKhe0AQnQ6UoCov58N61e8wW8MHEq0ku7_govI-h1LM98gO5902Y-GVLJtdvZYDe-W6oVG7FhEXVEpdx8E92x3tWjBjgImiWO_9B94adIChsPUnCwgbJNdZ2FxjJsgA__kf7NyVf8YhlSvZW7D44kxqsn7C20LveLaoncC-sJuSnC6bKMBc5T",
		rating: 4.4,
	},
	{
		id: "tech-guru",
		title: "Tech Guru",
		category: "Quiz",
		categorySlug: "quiz",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuD8hNwIJMoG5OANY8RzNh4A7wiU8RR2FrM9lv_zyxnKDnTSIPFTr0_dOY0GVcyNKubWfcwZ2Y7RdnsmJ7zalQELAknuWGbFPzpHDAdG0GSsjU7VA2BPNn2ExrfKFYIChfY_T-Bzxr3-cicszYAkFRAkuHApruIWveE-O-tzu6sdLrR46R9oO92K41UasEjiH9o6MKo1pzzi0uTezG0n90xOJUk2qsjG7C6dgVFiY4sh3ALRk88I5uWsh-Iok7vGOYbm1x_XfM5r847p",
		rating: 4.5,
	},
];

export const featuredGame: GameDetail = {
	id: "5",
	title: "Typing Challenge",
	subtitle: "Educational / Speed",
	category: "Typing",
	categorySlug: "typing",
	description:
		"Test your speed and accuracy in this high-octane typing experience. Compete with global players and unlock legendary keyboard skins.",
	heroImage:
		"https://lh3.googleusercontent.com/aida-public/AB6AXuBvcL9d3KBBZdbSMuCars2WvZvKStbOirEGuV7elK0pT9qIj4VhyUiTthc8qg-PmCabbAWNd58NDRgn915JPpdStQ0df2kzaCIXeMFq1OOkOhy4B9r0U2haGpmt6PlTIMHWUjtqfnW5hW9chufQEPDjNuAP3Ntyg0ZW3pAAkQhArQlwb_cSSL50FN7Ao_lnk-w_oy_y59WeMikQqQxNJZK-54xt2bPKo5jcCDyYyHEaH9xvV_HQG-QA94XpxUtnV9E02GZMhXYOE6fB",
	image:
		"https://lh3.googleusercontent.com/aida-public/AB6AXuBvcL9d3KBBZdbSMuCars2WvZvKStbOirEGuV7elK0pT9qIj4VhyUiTthc8qg-PmCabbAWNd58NDRgn915JPpdStQ0df2kzaCIXeMFq1OOkOhy4B9r0U2haGpmt6PlTIMHWUjtqfnW5hW9chufQEPDjNuAP3Ntyg0ZW3pAAkQhArQlwb_cSSL50FN7Ao_lnk-w_oy_y59WeMikQqQxNJZK-54xt2bPKo5jcCDyYyHEaH9xvV_HQG-QA94XpxUtnV9E02GZMhXYOE6fB",
	views: "15.4K",
	likes: "2.1K",
	rating: 4.9,
	developerName: 'Alex "Shift" Rivers',
	developerTitle: "Top Developer",
	developerBio:
		'Specializing in rhythmic educational games. Creator of the "Quest" series with over 5 million total plays.',
	developerImage:
		"https://lh3.googleusercontent.com/aida-public/AB6AXuDW9CvkfYazJzg-cc2mIbuVUXVXbwlkVK3lA4X3QdkyCQCiYyDeU3bA2DJ00QPENil2X_TmIFuN0pOmxd9E2pqylg4JOiCq20JCNKNYOweS43CU2h8_U697AX6rAEoXueZ4V08Z6YOoiHWc1r1OsgrRRVSxnQAIZWzZwpNEjhCtDYDWKn7GIb2y0W0k1uZTC3q-9u4SgVVW9GLs2Iw_zOk435AzOkkI6wdDXSd7lsSBeg_zvu16SCsEVLsKaUXc7vdsaNq94z0IHlTZ",
	instructions: [
		"Type the words exactly as they appear on the central terminal.",
		"Avoid making mistakes to keep your Combo Multiplier active.",
		"Use ESC to pause the game at any time.",
		"Finish within the time limit to earn bonus XP rewards.",
	],
	relatedGames: [
		{
			id: "word-runner-2",
			title: "Word Runner 2",
			category: "Action / Typing",
			categorySlug: "typing",
			tag: "New Game",
			image:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDlOHy9RU2vG3WYTaxdMfYbKlhtxa18bTd_SvK1lRVC2rsP-ka49dfs1t4MrLnR_0XIw27XtsEFdzniieISxs34r7RJOO9S9oqpPhMgESEa1T9Q3_av1C0R6HYQHhqMX0-Alb-XtT7WLHlGrNwLWH-MpfSWvkdYnT0f8xe0fxfk5Q-grPwnova1YCQXiaoRC59DA3rISpdEnfofPui_cjXioJ83gM33OoBgQnXWaKyUJVOARLG39lIcqOb9iO5xGBN2JqY8ec27sVMJ",
			rating: 4.7,
		},
		{
			id: "code-striker",
			title: "Code Striker",
			category: "Strategy / Dev",
			categorySlug: "typing",
			tag: "Popular",
			image:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuD8D0s_yVSKv5GN_9PL8Xb2DWKKNPdSHzZxgD-Z0jIKTlbK74Jh7rrxtwaPy6ivS7pUlCcxzC-bT8craexQQjpwPHG63lOAHDgcClLv3EV11OeNxj3rU5DGvIE_zSf8xaU42gYKI8v7YtV7iJHWzS_xFzT8s2idv7o5EeAZhBw4xLd3KH6IJ4zArciKuBQI_dxjuEzW9cFVmQtp6QOb1rV6TTweZ5mjnf4jc_uWH8Od17BFK9ZR2JboosTZzAR_45NfuXnvdv2hTU4J",
			rating: 4.9,
		},
		{
			id: "alpha-blitz",
			title: "Alpha-Blitz",
			category: "Arcade / Rhythm",
			categorySlug: "typing",
			tag: "Classic",
			image:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDwLArF15gA190xRK19LjMO8tV4NhunV_Bu9ztnZAN-17o9F1SRcQzOii5DU0DGLiqlblrLejInuOfNGZgcXIeoKBIqOuBt6GbBSE48CqL7eJcvKiiQU40pUsPv_BisVGQMq55hiFCqPU_BNV5CarWFzwGjhtrEppxSk75Ba5HmwK5RHbOHo_hRGd5WZ80M1lFEtenhPJUwLcretoUGdC5xJS6NTQ8vnEKcXy3iD2FclkpsgOMZ8ctOh_aBtK-nb0igE1gu4n4Z-cSv",
			rating: 4.5,
		},
	],
	comments: [
		{
			id: "1",
			username: "SpeedyType88",
			level: 42,
			avatar:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBlnoG-nK03iRdHqf99-2HFB4X1JikZF7qAbJ5ofbWEVK51gWfHIf_EVo9O46eHwxSdQz3BMDwwkQLpFBsy9adEfxCt5RArB2Wj64SLSJe8y03IM35JvwrQtcmOh7QBsRgdSpoI_vr2hPGH8cA8gUiDrlAm0z7XuLH4nb1qjiJupAqkSRcJWZ-xbxi-52Bdl1bdLRWmtPhip7p-6_MTigaZO0fbiEbbtC1JaerEuHy-G4Ch8zmPHtD3-joWX25smkZyDEKJBwmXa6Ci",
			body: "Finally hit 120 WPM on this one! The difficulty spike at Level 10 is insane but so rewarding.",
			likes: 14,
			timeAgo: "2 hours ago",
		},
		{
			id: "2",
			username: "KeyboardQueen",
			level: 15,
			avatar:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuD6vpVN5FoZjXmf9H3Vu-oBZzlbQ1YZ8lBJzadhmb7uHYSM-vWbi7Rdc43JWDwB3CLYK6fC9yEGL3spNDS5iXJgnmrZVMsnNLxlcNsybaJuIo80eXdYNelqULzbbfnKwWO6KF9IMGuASf2wHlL96ux1THh58bOKpRliSpfuQZEkx4dQ-iar2Yfiby0qcTaWW5lqw2n_nGZG6MwNonrnRye3VJyFPppeVTo59znc9MpFodf3QEfkp6VgDmon_hCFxCc7PTMAJB5-6Poc",
			body: "Love the aesthetic of the new cyberpunk theme. Keep it up Alex!",
			likes: 8,
			timeAgo: "5 hours ago",
		},
	],
};

export const allGames: Game[] = [
	...typingGames,
	...matchingGames,
	...quizGames,
];

export function getGameById(id: string): GameDetail | Game | undefined {
	if (id === featuredGame.id) return featuredGame;
	return allGames.find((g) => g.id === id);
}
