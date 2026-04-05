import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Main } from "@/layout/main";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  GripVertical,
  RefreshCw,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  getAllDashboardStats,
  getDashboardSettings,
  triggerManualRefresh,
  updateDashboardSettings,
} from "../api/dashboard-api";
import { PaymentRevenueChart } from "../components/payment-revenue-chart";
import type { DashboardStats } from "../types/dashboard.types";

function fmt(n: number): string {
  return n.toLocaleString("vi-VN");
}
function fmtCurrency(n: number): string {
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

interface StatCard {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  cardBg: string;
  cardBorder: string;
  valueColor: string;
}

function buildStats(d: DashboardStats): StatCard[] {
  return [
    {
      id: "users",
      title: "Tổng người dùng",
      value: fmt(d.users.totalUsers),
      description: `Hoạt động: ${fmt(d.users.activeUsers)}`,
      icon: Users,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-950",
      cardBg: "bg-purple-100 dark:bg-purple-950/40",
      cardBorder: "border-purple-300 dark:border-purple-700",
      valueColor: "text-purple-700 dark:text-purple-300",
    },
    {
      id: "new-users",
      title: "Người dùng mới",
      value: `+${fmt(d.users.newUsersThisMonth)}`,
      description: `Tuần: +${fmt(d.users.newUsersThisWeek)} · Hôm nay: +${fmt(d.users.newUsersToday)}`,
      icon: UserPlus,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100 dark:bg-orange-950",
      cardBg: "bg-orange-100 dark:bg-orange-950/40",
      cardBorder: "border-orange-300 dark:border-orange-700",
      valueColor: "text-orange-700 dark:text-orange-300",
    },
    {
      id: "orders",
      title: "Tổng đơn hàng",
      value: fmt(d.orders.totalOrders),
      description: `Doanh thu: ${fmtCurrency(d.orders.totalRevenue)}`,
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-950",
      cardBg: "bg-blue-100 dark:bg-blue-950/40",
      cardBorder: "border-blue-300 dark:border-blue-700",
      valueColor: "text-blue-700 dark:text-blue-300",
    },
    {
      id: "revenue",
      title: "Doanh thu tháng",
      value: fmtCurrency(d.orders.revenueThisMonth),
      description: `Tổng: ${fmtCurrency(d.orders.totalRevenue)}`,
      icon: DollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-950",
      cardBg: "bg-green-100 dark:bg-green-950/40",
      cardBorder: "border-green-300 dark:border-green-700",
      valueColor: "text-green-700 dark:text-green-300",
    },
    {
      id: "pay-rev",
      title: "Doanh thu thanh toán",
      value: fmtCurrency(d.payments.totalRevenue),
      description: `Tháng này: ${fmtCurrency(d.payments.revenueThisMonth)}`,
      icon: Activity,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-100 dark:bg-pink-950",
      cardBg: "bg-pink-100 dark:bg-pink-950/40",
      cardBorder: "border-pink-300 dark:border-pink-700",
      valueColor: "text-pink-700 dark:text-pink-300",
    },
    {
      id: "deposit",
      title: "Nạp tiền",
      value: fmt(d.payments.depositTransactions),
      description: `AI: ${fmt(d.payments.aiRequestTransactions)} · Mua: ${fmt(d.payments.purchaseTransactions)}`,
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
      cardBg: "bg-emerald-100 dark:bg-emerald-950/40",
      cardBorder: "border-emerald-300 dark:border-emerald-700",
      valueColor: "text-emerald-700 dark:text-emerald-300",
    },
  ];
}

// ── Draggable Grid ──
function DraggableStatsGrid({ stats }: { stats: StatCard[] }) {
  const [order, setOrder] = useState(() => stats.map((s) => s.id));
  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  const onDragEnd = useCallback(() => {
    if (dragItem.current && dragOver.current && dragItem.current !== dragOver.current) {
      setOrder((prev) => {
        const c = [...prev];
        const f = c.indexOf(dragItem.current!);
        const t = c.indexOf(dragOver.current!);
        c.splice(f, 1);
        c.splice(t, 0, dragItem.current!);
        return c;
      });
    }
    dragItem.current = null;
    dragOver.current = null;
  }, []);

  const ordered = order.map((id) => stats.find((s) => s.id === id)!).filter(Boolean);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {ordered.map((s) => {
        const Icon = s.icon;
        return (
          <Card
            key={s.id}
            draggable
            onDragStart={() => {
              dragItem.current = s.id;
            }}
            onDragEnter={() => {
              dragOver.current = s.id;
            }}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow select-none ${s.cardBg} ${s.cardBorder}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              <div className="flex items-center gap-1">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                <div className={`rounded-lg p-2 ${s.iconBg}`}>
                  <Icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-2xl font-bold ${s.valueColor}`}>{s.value}</div>
              <p className="text-muted-foreground text-xs mt-1">{s.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Breakdown Bars ──
function BreakdownBars({
  data,
  labels,
  title,
}: {
  data: Record<string, number>;
  labels: Record<string, string>;
  title: string;
}) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const colors = ["bg-blue-500", "bg-green-500", "bg-amber-500", "bg-red-500", "bg-purple-500"];
  const entries = Object.entries(data);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Chưa có dữ liệu</p>
        ) : (
          entries.map(([key, count], i) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{labels[key] || key}</span>
                  <span className="text-muted-foreground">
                    {fmt(count)} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ── Settings Panel ──
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["dashboard-settings"],
    queryFn: getDashboardSettings,
  });
  const [interval, setInterval] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setInterval(settings.refresh_interval_minutes || "30");
    setAutoRefresh(settings.auto_refresh_enabled !== "false");
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: (updates: Record<string, string>) => updateDashboardSettings(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-settings"] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      refresh_interval_minutes: interval,
      auto_refresh_enabled: String(autoRefresh),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-sm w-full p-6 relative border">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-4">Cài đặt Dashboard</h3>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Chu kỳ tự động cập nhật (phút)</label>
              <input
                type="number"
                min={1}
                max={1440}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">Tối thiểu 1 phút, tối đa 1440 phút (24 giờ)</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Tự động cập nhật</label>
                <p className="text-xs text-muted-foreground">Bật/tắt cron job tự động</p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoRefresh ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoRefresh ? "translate-x-5" : ""}`}
                />
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {saveMutation.isPending ? "Đang lưu..." : saveMutation.isSuccess ? "✓ Đã lưu" : "Lưu cài đặt"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stale Data Banner ──
function StaleBanner({
  refreshedAt,
  onRefresh,
  isRefreshing,
}: {
  refreshedAt?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  if (!refreshedAt) return null;
  const refreshedTime = new Date(refreshedAt);
  const minutesAgo = Math.floor((Date.now() - refreshedTime.getTime()) / 60_000);
  const isStale = minutesAgo > 30;

  if (!isStale) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Dữ liệu đã cũ ({minutesAgo} phút trước)
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Nhấn "Đồng bộ ngay" để lấy dữ liệu mới nhất. Quá trình có thể mất vài giây do lượng dữ liệu lớn.
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="shrink-0 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        {isRefreshing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
      </button>
    </div>
  );
}

// ── Main Dashboard ──
export function Dashboard() {
  const qc = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getAllDashboardStats,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: triggerManualRefresh,
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      }, 1500);
    },
  });

  const roleLabels: Record<string, string> = {
    STUDENT: "Học viên",
    MENTOR: "Giảng viên",
    MANAGER: "Quản lý",
    ADMIN: "Admin",
  };
  const orderStatusLabels: Record<string, string> = {
    PENDING: "Đang chờ",
    COMPLETED: "Hoàn thành",
    FAILED: "Thất bại",
  };
  const txTypeLabels: Record<string, string> = {
    DEPOSIT: "Nạp tiền",
    AI_REQUEST: "Yêu cầu AI",
    PURCHASE: "Mua hàng",
  };

  return (
    <>
      <Main className="flex flex-1 flex-col gap-6 p-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Bảng thống kê</h2>
            <p className="text-muted-foreground text-sm">
              Tổng quan hoạt động hệ thống Bit Learning
              {data?.refreshedAt && (
                <span className="ml-2 text-xs opacity-60">
                  · Cập nhật lúc {new Date(data.refreshedAt).toLocaleTimeString("vi-VN")}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 border rounded-lg px-3 py-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
              {refreshMutation.isPending ? "Đang đồng bộ..." : "Đồng bộ"}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border rounded-lg px-3 py-1.5"
            >
              <Settings className="h-3.5 w-3.5" />
              Cài đặt
            </button>
          </div>
        </div>

        {data && (
          <StaleBanner
            refreshedAt={data.refreshedAt}
            onRefresh={() => refreshMutation.mutate()}
            isRefreshing={refreshMutation.isPending}
          />
        )}

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="mb-2 h-8 w-32" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
          </Card>
        )}

        {data && (
          <>
            <DraggableStatsGrid stats={buildStats(data)} />

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo tháng</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {data.payments.monthlyRevenue?.length > 0 ? (
                    <PaymentRevenueChart data={data.payments.monthlyRevenue} />
                  ) : (
                    <div className="flex h-87.5 items-center justify-center text-muted-foreground">Chưa có dữ liệu</div>
                  )}
                </CardContent>
              </Card>
              <BreakdownBars
                data={data.users.roleBreakdown || {}}
                labels={roleLabels}
                title="Phân bổ vai trò người dùng"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <BreakdownBars
                data={data.orders.statusBreakdown || {}}
                labels={orderStatusLabels}
                title="Trạng thái đơn hàng"
              />
              <BreakdownBars
                data={data.payments.typeBreakdown || {}}
                labels={txTypeLabels}
                title="Phân bổ loại giao dịch"
              />
            </div>
          </>
        )}
      </Main>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
