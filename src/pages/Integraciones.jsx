import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Mail,
  User,
  Shield,
  Calendar,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api/users";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

/* ─── Toast ─── */
function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border pointer-events-auto
            transition-all duration-300 min-w-[280px] max-w-sm
            ${
              t.type === "success"
                ? "bg-[#1A1A2E] border-[#00D4AA]/40 text-[#00D4AA]"
                : "bg-[#1A1A2E] border-red-500/40 text-red-400"
            }`}
        >
          {t.type === "success" ? (
            <Check size={16} className="shrink-0" />
          ) : (
            <AlertTriangle size={16} className="shrink-0" />
          )}
          <span className="text-sm flex-1 text-white/90">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    []
  );
  return { toasts, add, remove };
}

/* ─── Skeleton ─── */
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-center text-lg mb-2">
          Eliminar Usuario
        </h3>
        <p className="text-white/50 text-sm text-center mb-6">
          ¿Estás seguro de eliminar a{" "}
          <span className="text-white/80 font-medium">
            {user?.name || user?.email}
          </span>
          ? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60
              hover:border-white/20 hover:text-white/80 transition-all text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40
              text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium
              flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Form Modal ─── */
const EMPTY_FORM = {
  name: "",
  email: "",
  role: "",
  status: "active",
  phone: "",
};

function UserModal({ user, onClose, onSaved, toast }) {
  const [form, setForm] = useState(
    user
      ? {
          name: user.name || "",
          email: user.email || "",
          role: user.role || "",
          status: user.status || "active",
          phone: user.phone || "",
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const method = user ? "PUT" : "POST";
      const url = user ? `${API_URL}/${user.id}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const data = await res.json();
      toast(
        user ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
        "success"
      );
      onSaved(data?.data || data, !!user);
    } catch {
      toast("Error al guardar el usuario", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-[#0A0A0F] border rounded-xl px-4 py-2.5 text-white text-sm
     placeholder-white/25 outline-none transition-all
     ${
       errors[field]
         ? "border-red-500/60 focus:border-red-500"
         : "border-white/10 focus:border-[#6C63FF]/60"
     }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
              <User size={15} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">
              {user ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40
              hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Nombre *
            </label>
            <input
              className={inputClass("name")}
              placeholder="Juan García"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Email *
            </label>
            <input
              type="email"
              className={inputClass("email")}
              placeholder="juan@empresa.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Teléfono
              </label>
              <input
                className={inputClass("phone")}
                placeholder="+52 55 0000 0000"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Rol
              </label>
              <input
                className={inputClass("role")}
                placeholder="admin, editor…"
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Estado
            </label>
            <select
              className={`${inputClass("status")} cursor-pointer`}
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60
                hover:border-white/20 hover:text-white/80 transition-all text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0]
                text-white text-sm font-medium transition-all flex items-center justify-center gap-2
                disabled:opacity-50 shadow-lg shadow-[#6C63FF]/20"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {user ? "Actualizar" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const map = {
    active: {
      label: "Activo",
      cls: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
    },
    inactive: {
      label: "Inactivo",
      cls: "bg-white/5 text-white/40 border-white/10",
    },
    suspended: {
      label: "Suspendido",
      cls: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };
  const s = map[status?.toLowerCase()] || map.inactive;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

/* ─── Main Page ─── */
export default function Integraciones() {
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', user }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* Fetch */
  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(API_URL, {
        headers: { "x-factory-key": "factory2026" },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const list = Array.isArray(json)
        ? json
        : json?.data ?? json?.users ?? [];
      setUsers(list);
    } catch {
      addToast("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* Filter + Search */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (u.status || "").toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  /* CRUD handlers */
  const handleSaved = (savedUser, isEdit) => {
    if (isEdit) {
      setUsers((p) =>
        p.map((u) => (u.id === savedUser.id ? { ...u, ...savedUser } : u))
      );
    } else {
      setUsers((p) => [savedUser, ...p]);
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "x-factory-key": "factory2026" },
      });
      if (!res.ok) throw new Error();
      setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
      addToast("Usuario eliminado correctamente", "success");
      setDeleteTarget(null);
    } catch {
      addToast("Error al eliminar el usuario", "error");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white/30 text-xs mb-2 uppercase tracking-widest">
              <span>Configuración del Sistema</span>
              <span>/</span>
              <span className="text-[#6C63FF]">Integraciones · Usuarios</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Gestión de Usuarios
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}{" "}
              {filterStatus !== "all" ? `(${filterStatus})` : "en total"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center
                text-white/40 hover:text-white/80 hover:border-white/20 transition-all"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={() => setModal({ mode: "create", user: null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0]
                text-white text-sm font-medium transition-all shadow-lg shadow-[#6C63FF]/25"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo Usuario</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5
                text-white text-sm placeholder-white/25 outline-none focus:border-[#6C63FF]/50 transition-all"
              placeholder="Buscar por nombre, email o rol…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              resetPage();
            }}
            className="bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-white/70
              text-sm outline-none focus:border-[#6C63FF]/50 transition-all cursor-pointer
              sm:w-44"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total",
              value: users.length,
              color: "text-[#6C63FF]",
              icon: Users,
            },
            {
              label: "Activos",
              value: users.filter(
                (u) => (u.status || "").toLowerCase() === "active"
              ).length,
              color: "text-[#00D4AA]",
              icon: Check,
            },
            {
              label: "Inactivos