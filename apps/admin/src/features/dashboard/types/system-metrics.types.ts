export interface RequestStats {
	totalRequests: number | null;
}

export interface CpuStats {
	/** CPU usage in percent (0-100). */
	usagePercent: number | null;
}

export interface MemoryStats {
	/** Used heap memory in bytes. */
	usedBytes: number | null;
	/** Max heap memory in bytes. */
	maxBytes: number | null;
}

export interface JvmStats {
	liveThreads: number | null;
}

export interface DbPoolStats {
	poolName?: string | null;
	activeConnections?: number | null;
	idleConnections?: number | null;
	totalConnections?: number | null;
	maxConnections?: number | null;
	threadsAwaitingConnection?: number | null;
}

export interface MetricsSummary {
	timestamp: string;
	requests: RequestStats;
	cpu: CpuStats;
	memory: MemoryStats;
	jvm: JvmStats;
	db: DbPoolStats;
}

export interface HealthComponent {
	name: string;
	status: string;
	details?: HealthComponentDetails;
}

export interface DbHealthDetails {
	database?: string;
	validationQuery?: string;
}

export interface RedisHealthDetails {
	version?: string;
}

export interface DiskSpaceHealthDetails {
	total: number;
	free: number;
	threshold?: number;
	path?: string;
	exists?: boolean;
}

export interface SslHealthDetails {
	expiringChains?: unknown[];
	invalidChains?: unknown[];
	validChains?: unknown[];
}

export type HealthComponentDetails =
	| Record<string, unknown>
	| DbHealthDetails
	| RedisHealthDetails
	| DiskSpaceHealthDetails
	| SslHealthDetails;

export interface MetricsHealth {
	status: string;
	components: HealthComponent[];
}

export interface MetricPoint {
	timestamp: string;
	value: number;
}

export interface MetricsTrends {
	requestCount: MetricPoint[];
	cpu: MetricPoint[];
	memory: MetricPoint[];
}

export interface AdvancedMetricsLink {
	title: string;
	url: string;
	purpose: string;
}
