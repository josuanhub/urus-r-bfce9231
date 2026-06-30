import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  UserCircle,
  Key,
  Sliders,
  Plug,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Lock,
  Mail,
  User,
  Globe,
  Database,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Star,
  Tag,
} from "lucide-react";

// ─────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const API_BASE = "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api";
const UPLOAD_URL = "https://www.urusverify.com/v1/factory/project/bfce9231-63b4-4c0e-a369-4f484f044096/upload-data";
const HEADERS = { "Content-Type": "application/json", "x-factory-key": "factory2026" };

const apiFetch = async (table, options = {}) => {
  const res = await fetch(`${API_BASE}/${table}`, {
    ...options,
    headers: { ...HEADERS, ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

const uploadData = async (data) => {
  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "x-factory-key": "factory2026" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Upload error: ${res.status}`);
  return res.json();
};

// ─────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────
const useApi = (table, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_ = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(table);
      setData(Array.isArray(res) ? res : res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, deps);
  return { data, loading, error, refetch: fetch_ };
};

// ─────────────────────────────────────────
// UTILS / UI ATOMS
// ─────────────────────────────────────────
const Spinner = ({ size = "md" }) => {
  const s = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  return (
    <div className={`${s} border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin`} />
  );
};

const Badge = ({ children, color = "purple" }) => {
  const colors = {
    purple: "bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30",
    teal: "bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/30",
    red: "bg-red-500/20 text-red-400 border border-red-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    gray: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const styles = {
    success: "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]",
    error: "border-red-500 bg-red-500/10 text-red-400",
    info: "border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]",
  };
  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info;
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${styles[type]} shadow-2xl`}>
      <Icon size={16} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  );
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (message, type = "success") => setToast({ message, type });
  const hide = () => setToast(null);
  const ToastEl = toast ? <Toast {...toast} onClose={hide} /> : null;
  return { show, ToastEl };
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#1A1A2E] border border-white/5 rounded-2xl ${className}`}>{children}</div>
);

const Input = ({ label, icon: Icon, type = "text", ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />}
      <input
        type={type}
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 transition-all text-sm ${Icon ? "pl-10" : ""}`}
        {...props}
      />
    </div>
  </div>
);

const Button = ({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) => {
  const variants = {
    primary: "bg-gradient-to-r from-[#6C63FF] to-[#5a52d5] hover:from-[#5a52d5] hover:to-[#4a44c0] text-white shadow-lg shadow-[#6C63FF]/25",
    teal: "bg-gradient-to-r from-[#00D4AA] to-[#00b894] hover:from-[#00b894] hover:to-[#009d7c] text-[#0A0A0F] shadow-lg shadow-[#00D4AA]/25",
    ghost: "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const StatCard = ({ title, value, change, icon: Icon, color = "purple" }) => {
  const colors = {
    purple: { bg: "bg-[#6C63FF]/10", icon: "text-[#6C63FF]", border: "border-[#6C63FF]/20" },
    teal: { bg: "bg-[#00D4AA]/10", icon: "text-[#00D4AA]", border: "border-[#00D4AA]/20" },
    red: { bg: "bg-red-500/10", icon: "text-red-400", border: "border-red-500/20" },
    yellow: { bg: "bg-yellow-500/10", icon: "text-yellow-400", border: "border-yellow-500/20" },
  };
  const c = colors[color] || colors.purple;
  const isPos = change >= 0;
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isPos ? "text-[#00D4AA]" : "text-red-400"}`}>
              {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(change)}% vs mes anterior
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────
const navItems = [
  { section: "Principal", items: [
    { path: "/dashboard", label: "Vista General", icon: LayoutDashboard },
    { path: "/dashboard/kpis", label: "KPIs Principales", icon: BarChart3 },
    { path: "/dashboard/actividad", label: "Actividad Reciente", icon: Activity },
  ]},
  { section: "Usuarios", items: [
    { path: "/usuarios/perfil", label: "Perfil de Usuario", icon: UserCircle },
    { path: "/usuarios/gestion", label: "Gestión de Roles", icon: Shield },
  ]},
  { section: "Configuración", items: [
    { path: "/config/general", label: "Config. General", icon: Settings },
    { path: "/config/preferencias", label: "Preferencias", icon: Sliders },
    { path: "/config/integraciones", label: "Integraciones", icon: Plug },
  ]},
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const NavItem = ({ path, label, icon: Icon }) => {
    const active = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
    return (
      <button
        onClick={() => { navigate(path); setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          active
            ? "bg-gradient-to-r from-[#6C63FF]/20 to-[#6C63FF]/5 border border-[#6C63FF]/30 text-white"
            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        }`}
      >
        <Icon size={18} className={active ? "text-[#6C63FF]" : "group-hover:text-[#6C63FF] transition-colors"} />
        {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
        {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6C63FF]" />}
      </button>
    );
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-white text-sm">URUS Core</span>
            <div className="text-[10px] text-gray-600 font-mono">v2.0.1</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navItems.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-2">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => <NavItem key={item.path} {...item} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{user?.name?.[0] || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "Usuario"}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email || ""}</p>
            </div>
            <button onClick={logout} className="text-gray-600 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center p-2 text-gray-600 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#1A1A2E] border-r border-white/5 transition-all duration-300 flex-shrink-0 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {content}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-20 translate-x-full bg-[#1A1A2E] border border-white/10 rounded-r-lg p-1.5 text-gray-600 hover:text-white hover:border-[#6C63FF]/50 transition-all z-10"
          style={{ marginLeft: collapsed ? "64px" : "240px", position: "fixed", top: "80px", zIndex: 20 }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 h-full bg-[#1A1A2E] border-r border-white/5">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-white"
            >
              <X size={20} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────
const Topbar = ({ setMobileOpen }) => {
  const location = useLocation();
  const titles = {
    "/dashboard": "Vista General",
    "/dashboard/kpis": "KPIs Principales",
    "/dashboard/actividad": "Actividad Reciente",
    "/usuarios/perfil": "Perfil de Usuario",
    "/usuarios/gestion": "Gestión de Roles",
    "/config/general": "Configuración General",
    "/config/preferencias": "Preferencias",
    "/config/integraciones": "Integraciones",
  };
  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-gray-500 hover:text-white"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-semibold text-gray-300 text-sm">{titles[location.pathname] || "Panel"}</h2>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            placeholder="Buscar..."
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-400 placeholder-gray-700 focus:outline-none focus:border-[#6C63FF]/50 w-40"
          />
        </div>
        <button className="relative p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#6C63FF] rounded-full" />
        </button>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────
// PAGE: LOGIN
// ─────────────────────────────────────────
const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const users = await apiFetch("users");
      const list = Array.isArray(users) ? users : users.data || [];
      const found = list.find((u) => u.email === email);
      if (!found) throw new Error("Credenciales inválidas");
      login({ ...found, name: found.name || found.email });
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#00D4AA]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#6C63FF]/30">
            <Zap size={24} className="text-white" />
          </div