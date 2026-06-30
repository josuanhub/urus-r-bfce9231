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
  RefreshCw,
  User,
  Mail,
  Phone,
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

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 ${
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
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded-lg animate-pulse" style={{ width: `${60 + i * 5}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilter, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center mb-6">
        <Users size={36} className="text-[#6C63FF]/60" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">
        {hasFilter ? "Sin resultados" : "No hay usuarios aún"}
      </h3>
      <p className="text-white/40 text-sm max-w-xs mb-6">
        {hasFilter
          ? "Intenta con otros términos de búsqueda o limpia los filtros."
          : "Crea el primer usuario para comenzar a gestionar tu equipo."}
      </p>
      {!hasFilter && (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/80 text-white text-sm font-semibold transition-all duration-200"
        >
          <Plus size={16} />
          Crear primer usuario
        </button>
      )}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Eliminar usuario</h3>
            <p className="text-white/50 text-sm">Esta acción es irreversible</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-6">
          ¿Confirmas que deseas eliminar a{" "}
          <span className="text-white font-medium">
            {user?.name || user?.email}
          </span>
          ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Form Modal ──────────────────────────────────────────────────────────
function UserModal({ user, onClose, onSave, loading }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "user",
    status: user?.status || "active",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    if (!isEdit && !form.password) e.password = "La contraseña es requerida";
    if (form.password && form.password.length < 6)
      e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    onSave(payload);
  };

  const inputCls = (k) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
      errors[k]
        ? "border-red-500/50 focus:ring-red-500/30"
        : "border-white/10 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/25 flex items-center justify-center">
              <User size={18} className="text-[#6C63FF]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">
                {isEdit ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <p className="text-white/40 text-xs">
                {isEdit ? "Modifica los datos del usuario" : "Completa el formulario"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Nombre completo *
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className={`${inputCls("name")} pl-10`}
                placeholder="Juan Pérez"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Email *
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                className={`${inputCls("email")} pl-10`}
                placeholder="juan@empresa.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Teléfono
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className={`${inputCls("phone")} pl-10`}
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Rol
              </label>
              <div className="relative">
                <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <select
                  className={`${inputCls("role")} pl-10 appearance-none cursor-pointer`}
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                >
                  <option value="admin" className="bg-[#1A1A2E]">Admin</option>
                  <option value="user" className="bg-[#1A1A2E]">Usuario</option>
                  <option value="viewer" className="bg-[#1A1A2E]">Visor</option>
                  <option value="manager" className="bg-[#1A1A2E]">Manager</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Estado
              </label>
              <select
                className={`${inputCls("status")} appearance-none cursor-pointer`}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="active" className="bg-[#1A1A2E]">Activo</option>
                <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
                <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Contraseña {isEdit ? "(dejar vacío para no cambiar)" : "*"}
            </label>
            <input
              type="password"
              className={inputCls("password")}
              placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/80 disabled:opacity-50 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active: { label: "Activo", cls: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20" },
    inactive: { label: "Inactivo", cls: "bg-white/5 text-white/40 border-white/10" },
    suspended: { label: "Suspendido", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const { label, cls } = map[status] || map.inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </span>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    admin: "bg-[#6C63FF]/15 text-[#6C63FF] border-[#6C63FF]/25",
    manager: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    user: "bg-white/5 text-white/50 border-white/10",
    viewer: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border capitalize ${
        map[role] || map.user
      }`}
    >
      {role || "user"}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VistaGeneral() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'delete', user? }

  // ── Toast helpers
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // ── Fetch users
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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Filter + search
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  // ── Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filtered.length, totalPages, page]);

  // ── CRUD
  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      setUsers((p) => [created.data || created, ...p]);
      addToast("Usuario creado exitosamente");
      setModal(null);
    } catch (err) {
      addToast("Error al crear usuario: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    const id = modal.user.id;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setUsers((p) =>
        p.map((u) => (u.id === id ? { ...u, ...(updated.data || updated) } : u))
      );
      addToast("Usuario actualizado correctamente");
      setModal(null);
    } catch (err) {
      addToast("Error al actualizar usuario: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const id