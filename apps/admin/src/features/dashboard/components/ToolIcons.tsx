import { useState } from "react";

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
		url: "https://uptime.kuma.pet/icon.svg",
		fallback: "UK",
		bg: "#E1F5EE",
		color: "#0F6E56",
	},
	Dozzle: {
		type: "favicon",
		url: "https://dozzle.dev/favicon.svg",
		fallback: "DZ",
		bg: "#E6F1FB",
		color: "#185FA5",
	},
	Netdata: {
		type: "favicon",
		url: "https://www.netdata.cloud/favicon.ico",
		fallback: "ND",
		bg: "#E1F5EE",
		color: "#005c24",
	},
};

export function ToolIcon({ title }: { title: string }) {
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
