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
  Eye,
  EyeOff,
  RefreshCw,
  UserPlus,
  Shield,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api/users";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <Check size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          )}
          <p className="text-sm flex-1 leading-snug">{t.message}</p>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-md bg-white/5 animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Eliminar usuario</h3>
            <p className="text-white/50 text-sm mt-1">
              ¿Estás seguro de eliminar a{" "}
              <span className="text-white/80 font-medium">{user?.name || user?.email}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Form Modal ─────────────────────────────────────────────────────────────────
function UserModal({ user, onClose, onSave, saving }) {
  const isEdit = !!user?.id;
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "user",
    status: user?.status || "active",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!isEdit && !form.password) e.password = "La contraseña es requerida";
    if (form.password && form.password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    onSave(payload);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <UserPlus size={16} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Nombre completo
            </label>
            <input
              {...field("name")}
              placeholder="John Doe"
              className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all focus:ring-1 ${
                errors.name
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              {...field("email")}
              type="email"
              placeholder="john@example.com"
              className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none transition-all focus:ring-1 ${
                errors.email
                  ? "border-red-500/50 focus:ring-red-500/30"
                  : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Contraseña {isEdit && <span className="normal-case text-white/30">(dejar vacío para no cambiar)</span>}
            </label>
            <div className="relative">
              <input
                {...field("password")}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 pr-10 text-white placeholder-white/20 text-sm outline-none transition-all focus:ring-1 ${
                  errors.password
                    ? "border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Rol</label>
              <select
                {...field("role")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all appearance-none"
              >
                <option value="user" className="bg-[#1A1A2E]">Usuario</option>
                <option value="admin" className="bg-[#1A1A2E]">Admin</option>
                <option value="manager" className="bg-[#1A1A2E]">Manager</option>
                <option value="viewer" className="bg-[#1A1A2E]">Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Estado</label>
              <select
                {...field("status")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all appearance-none"
              >
                <option value="active" className="bg-[#1A1A2E]">Activo</option>
                <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
                <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B52EE] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
    inactive: "bg-white/5 text-white/40 border-white/10",
    suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || map.inactive}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "active" ? "bg-[#00D4AA]" : status === "suspended" ? "bg-red-400" : "bg-white/30"}`} />
      {labels[status] || status}
    </span>
  );
}

// ── Role Badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    admin: "bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20",
    manager: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    user: "bg-white/5 text-white/50 border-white/10",
    viewer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${map[role] || map.user}`}>
      <Shield size={10} />
      {role}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Login() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', user }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast helpers
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || data.users || []);
    } catch (err) {
      addToast("Error al cargar usuarios: " + err.message, "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Filter + search
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter, roleFilter]);

  // CRUD
  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const isEdit = !!modal?.user?.id;
      const url = isEdit ? `${API_URL}/${modal.user.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addToast(isEdit ? "Usuario actualizado correctamente" : "Usuario creado correctamente");
      setModal(null);
      fetchUsers();
    } catch (err) {
      addToast("Error al guardar: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${confirmDelete.id}`, { method: "DELETE", headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addToast("Usuario eliminado correctamente");
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      addToast("Error al eliminar: " + err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(d)); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} remove={removeToast} />
      {modal && (
        <UserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          user={confirmDelete}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deleting}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
              <Users size={20} className="text-[#6C63FF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Usuarios</h1>
              <p className="text-white/40 text-sm">
                {loading ? "Cargando..." : `${filtered.length} usuario${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
              title="Refrescar"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>