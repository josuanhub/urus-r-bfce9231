import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Key,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  RefreshCw,
  BarChart3,
  Zap,
  Eye,
} from "lucide-react";

const API_BASE =
  "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api";
const HEADERS = { "x-factory-key": "factory2026" };

function SkeletonCard() {
  return (
    <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-white/5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="w-16 h-5 rounded-full bg-white/10" />
      </div>
      <div className="w-20 h-8 rounded-lg bg-white/10 mb-2" />
      <div className="w-32 h-4 rounded bg-white/10" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-white/10 w-full" />
        </td>
      ))}
    </tr>
  );
}

function KPICard({ icon: Icon, label, value, trend, trendValue, color, loading }) {
  if (loading) return <SkeletonCard />;

  const isPositive = trend === "up";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className="bg-[#1A1A2E] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 group relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive
                ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            <TrendIcon size={12} />
            {trendValue}
          </div>
        </div>
        <div className="text-3xl font-bold text-white mb-1 tabular-nums">
          {value?.toLocaleString() ?? "—"}
        </div>
        <div className="text-sm text-white/50 font-medium">{label}</div>
      </div>
    </div>
  );
}

function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-amber-400 font-semibold text-sm mb-1">
            Alertas Críticas ({alerts.length})
          </h3>
          <div className="space-y-1">
            {alerts.map((alert, i) => (
              <p key={i} className="text-amber-300/70 text-xs">
                • {alert.description || alert.message || JSON.stringify(alert)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTable({ data, loading }) {
  const columns = ["Usuario", "Acción", "Módulo", "IP", "Fecha"];

  return (
    <div className="bg-[#1A1A2E] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
            <Activity size={15} className="text-[#6C63FF]" />
          </div>
          <h2 className="text-white font-semibold text-sm">Actividad Reciente</h2>
        </div>
        <span className="text-white/30 text-xs bg-white/5 px-2 py-1 rounded-full">
          Últimos 10 registros
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">
                    No hay actividad registrada
                  </td>
                </tr>
              )
              : data.map((row, i) => (
                  <tr
                    key={row.id || i}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#6C63FF] text-xs font-bold">
                            {(row.user_id || row.userId || "?")
                              .toString()
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white/70 text-sm">
                          {row.user_id || row.userId || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#00D4AA]/10 text-[#00D4AA] font-medium">
                        {row.action || row.type || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">
                      {row.module || row.resource || row.table_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-sm font-mono">
                      {row.ip_address || row.ip || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function KPIsPrincipales() {
  const [kpiData, setKpiData] = useState({
    users: null,
    roles: null,
    permissions: null,
    sessions: null,
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    setError(null);
    try {
      const [usersRes, rolesRes, permissionsRes, sessionsRes, logsRes] =
        await Promise.all([
          fetch(`${API_BASE}/users`, { headers: HEADERS }),
          fetch(`${API_BASE}/roles`, { headers: HEADERS }),
          fetch(`${API_BASE}/permissions`, { headers: HEADERS }),
          fetch(`${API_BASE}/user_sessions`, { headers: HEADERS }),
          fetch(`${API_BASE}/activity_logs`, { headers: HEADERS }),
        ]);

      if (
        !usersRes.ok ||
        !rolesRes.ok ||
        !permissionsRes.ok ||
        !sessionsRes.ok ||
        !logsRes.ok
      ) {
        throw new Error("Error al obtener datos de la API");
      }

      const [users, roles, permissions, sessions, logs] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
        permissionsRes.json(),
        sessionsRes.json(),
        logsRes.json(),
      ]);

      const usersArr = Array.isArray(users)
        ? users
        : users?.data ?? users?.records ?? [];
      const rolesArr = Array.isArray(roles)
        ? roles
        : roles?.data ?? roles?.records ?? [];
      const permissionsArr = Array.isArray(permissions)
        ? permissions
        : permissions?.data ?? permissions?.records ?? [];
      const sessionsArr = Array.isArray(sessions)
        ? sessions
        : sessions?.data ?? sessions?.records ?? [];
      const logsArr = Array.isArray(logs)
        ? logs
        : logs?.data ?? logs?.records ?? [];

      setKpiData({
        users: usersArr.length,
        roles: rolesArr.length,
        permissions: permissionsArr.length,
        sessions: sessionsArr.length,
      });

      const recent = [...logsArr]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      setActivityLogs(recent);

      const urgent = logsArr.filter(
        (item) =>
          item.status === "urgente" ||
          item.severity === "critical" ||
          item.level === "critical"
      );
      setCriticalAlerts(urgent.slice(0, 5));

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Error desconocido al cargar los datos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const kpiCards = [
    {
      icon: Users,
      label: "Usuarios Registrados",
      value: kpiData.users,
      trend: "up",
      trendValue: "+12%",
      color: "#6C63FF",
    },
    {
      icon: Shield,
      label: "Roles Activos",
      value: kpiData.roles,
      trend: "up",
      trendValue: "+3%",
      color: "#00D4AA",
    },
    {
      icon: Key,
      label: "Permisos Configurados",
      value: kpiData.permissions,
      trend: "up",
      trendValue: "+8%",
      color: "#6C63FF",
    },
    {
      icon: Zap,
      label: "Sesiones Activas",
      value: kpiData.sessions,
      trend: kpiData.sessions > 10 ? "up" : "down",
      trendValue: kpiData.sessions > 10 ? "+5%" : "-2%",
      color: "#00D4AA",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center">
                <BarChart3 size={18} className="text-[#6C63FF]" />
              </div>
              <h1 className="text-white text-2xl font-bold tracking-tight">
                KPIs Principales
              </h1>
            </div>
            <p className="text-white/40 text-sm ml-12">
              Panel de métricas y actividad del sistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <Clock size={12} />
                <span>
                  {lastUpdated.toLocaleTimeString("es-MX", {
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A2E] border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Actualizar
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-semibold text-sm">
                  Error al cargar datos
                </p>
                <p className="text-red-400/60 text-xs mt-0.5">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="ml-auto text-red-400/60 hover:text-red-400 text-xs underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Critical Alerts */}
        {!loading && <AlertBanner alerts={criticalAlerts} />}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card, i) => (
            <KPICard key={i} {...card} loading={loading} />
          ))}
        </div>

        {/* Stats Summary Bar */}
        {!loading && !error && (
          <div className="bg-[#1A1A2E] rounded-2xl border border-white/5 p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Eye,
                label: "Total Entidades",
                value:
                  (kpiData.users || 0) +
                  (kpiData.roles || 0) +
                  (kpiData.permissions || 0),
                color: "#6C63FF",
              },
              {
                icon: Activity,
                label: "Logs de Actividad",
                value: activityLogs.length,
                color: "#00D4AA",
              },
              {
                icon: AlertTriangle,
                label: "Alertas Críticas",
                value: criticalAlerts.length,
                color: criticalAlerts.length > 0 ? "#f59e0b" : "#00D4AA",
              },
              {
                icon: Shield,
                label: "Sesiones Abiertas",
                value: kpiData.sessions || 0,
                color: "#6C63FF",
              },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon size={14} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-white font-bold text-base tabular-nums">
                    {stat.value?.toLocaleString() ?? "—"}
                  </div>
                  <div className="text-white/30 text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Table */}
        <ActivityTable data={activityLogs} loading={loading} />

        {/* Footer */}
        <div className="mt-6 text-center text-white/20 text-xs">
          URUS Core — Dashboard de KPIs &nbsp;·&nbsp; Datos en tiempo real
        </div>
      </div>
    </div>
  );
}