import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Main } from "@/layout/main";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { advancedMetricsLinks } from "../data/metrics-links";
import { AdvancedMetricsLink } from "../types/system-metrics.types";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";

// ── Icon config ──
const CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

type IconConfig =
	| { type: "devicon"; name: string; variant?: string }
	| {
			type: "favicon";
			url: string;
			fallback: string;
			bg: string;
			color: string;
	  };

const TOOL_ICONS: Record<string, IconConfig> = {
	Prometheus: { type: "devicon", name: "prometheus", variant: "original" },
	Grafana: { type: "devicon", name: "grafana", variant: "original" },
	"Nginx Proxy Manager": {
		type: "devicon",
		name: "nginx",
		variant: "original",
	},
	Portainer: { type: "devicon", name: "portainer", variant: "original" },
	"Uptime Kuma": {
		type: "favicon",
		url: "https://uptimekuma.org/wp-content/uploads/2025/01/Uptime-Kuma-Logo.png",
		fallback: "UK",
		bg: "#E1F5EE",
		color: "#0F6E56",
	},
	Dozzle: {
		type: "favicon",
		url: "https://dozzle.dev/logo.svg",
		fallback: "DZ",
		bg: "#E6F1FB",
		color: "#185FA5",
	},
	Netdata: {
		type: "favicon",
		url: "https://canada1.discourse-cdn.com/flex029/uploads/netdata2/original/2X/3/34b9a2582d6ce9ab36dd9e69de9e9180c149520e.png",
		fallback: "ND",
		bg: "#E1F5EE",
		color: "#005c24",
	},
};

function ToolIcon({ title }: { title: string }) {
	const cfg = TOOL_ICONS[title];
	const [failed, setFailed] = useState(false);

	if (!cfg || failed) {
		return (
			<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
				{title.slice(0, 2).toUpperCase()}
			</span>
		);
	}

	if (cfg.type === "devicon") {
		return (
			<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<img
					src={`${CDN}/${cfg.name}/${cfg.name}-${cfg.variant ?? "original"}.svg`}
					alt={title}
					className="h-6 w-6 object-contain"
					onError={() => setFailed(true)}
				/>
			</span>
		);
	}

	return (
		<span
			className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
			style={{ background: cfg.bg, color: cfg.color }}
		>
			<img
				src={cfg.url}
				alt={title}
				className="h-6 w-6 object-contain"
				onError={() => setFailed(true)}
			/>
		</span>
	);
}

// ── Advanced Metrics Links Panel ──
function AdvancedMetricsLinksPanel({
	links,
}: {
	links: AdvancedMetricsLink[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-semibold">
					Công cụ giám sát nâng cao
				</CardTitle>
				<p className="text-xs text-muted-foreground mt-1">
					Các hệ thống giám sát và quan sát — mở trong tab mới để quản trị.
				</p>
			</CardHeader>
			<CardContent>
				{links.length === 0 && (
					<p className="text-xs text-muted-foreground">
						Chưa cấu hình URL giám sát nâng cao.
					</p>
				)}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
					{links.map((link) => {
						let hostname = link.url;
						try {
							hostname = new URL(link.url).hostname.replace(/^www\./, "");
						} catch {}

						return (
							<a
								key={link.url}
								href={link.url}
								target="_blank"
								rel="noreferrer"
								className="group flex flex-col gap-2.5 rounded-xl border border-border/50 bg-card p-4
                           transition-colors hover:border-border hover:bg-muted/40 no-underline"
							>
								{/* Header: icon + title */}
								<div className="flex items-center gap-2.5">
									<ToolIcon title={link.title} />
									<span className="text-sm font-medium text-foreground leading-tight">
										{link.title}
									</span>
								</div>

								{/* Purpose */}
								<p className="text-xs text-muted-foreground leading-relaxed flex-1">
									{link.purpose}
								</p>

								{/* Footer */}
								<div className="flex items-center justify-between gap-2 pt-1">
									<span className="truncate font-mono text-[10px] text-muted-foreground/60">
										{hostname}
									</span>
									<span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border/60 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
										Mở
										<ExternalLink className="h-2.5 w-2.5" />
									</span>
								</div>
							</a>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ── Main Dashboard ──
export function ToolsMetricsPage() {
	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>
			<Main className="flex flex-1 flex-col gap-6 p-8">
				<AdvancedMetricsLinksPanel links={advancedMetricsLinks} />
			</Main>
		</>
	);
}
