import { Main } from "@/layout/main";
import { Header } from "@/layout/header";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { advancedMetricsLinks } from "../data/metrics-links";
import { AdvancedMetricsLink } from "../types/system-metrics.types";

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

function AdvancedMetricsLinksPanel({
	links,
}: {
	links: AdvancedMetricsLink[];
}) {
	return (
		<section className="text-card-foreground">
			<div className="">
				<h2 className="text-lg font-semibold">Công cụ giám sát nâng cao</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Các hệ thống giám sát và quan sát — mở trong tab mới để quản trị.
				</p>
			</div>

			<div className="px-6 py-5">
				{links.length === 0 ? (
					<p className="text-xs text-muted-foreground">
						Chưa cấu hình URL giám sát nâng cao.
					</p>
				) : (
					<div className="overflow-hidden rounded-lg border">
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-muted/40">
									<tr className="border-b">
										<th className="h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground">
											Tool
										</th>
										<th className="h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground">
											Mô tả
										</th>
										<th className="hidden h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground md:table-cell">
											Endpoint
										</th>
										<th className="h-11 px-4 text-right align-middle text-xs font-semibold text-muted-foreground">
											Hành động
										</th>
									</tr>
								</thead>

								<tbody>
									{links.map((link) => {
										let hostname = link.url;

										try {
											hostname = new URL(link.url).hostname.replace(
												/^www\./,
												"",
											);
										} catch {
											hostname = link.url;
										}

										return (
											<tr
												key={link.url}
												className="border-b transition-colors hover:bg-muted/40"
											>
												<td className="px-4 py-3 align-middle">
													<div className="flex items-center gap-3">
														<ToolIcon title={link.title} />
														<div className="min-w-0">
															<p className="font-medium text-foreground">
																{link.title}
															</p>
															<p className="mt-0.5 text-[11px] text-muted-foreground md:hidden">
																{hostname}
															</p>
														</div>
													</div>
												</td>

												<td className="max-w-[420px] px-4 py-3 align-middle text-xs leading-relaxed text-muted-foreground">
													{link.purpose}
												</td>

												<td className="hidden px-4 py-3 align-middle font-mono text-xs text-muted-foreground/70 md:table-cell">
													{hostname}
												</td>

												<td className="px-4 py-3 text-right align-middle">
													<a
														href={link.url}
														target="_blank"
														rel="noreferrer"
														className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-primary transition hover:border-primary/40 hover:bg-primary/5"
													>
														Mở
														<ExternalLink className="h-3 w-3" />
													</a>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

export function ToolsMetricsPage() {
	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<AdvancedMetricsLinksPanel links={advancedMetricsLinks} />
			</div>
		</>
	);
}
