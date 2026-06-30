import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  Check,
  Loader2,
  RefreshCw,
  Shield,
  Mail,
  User,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api/users";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "",
  status: "active",
};

const Toast = ({ toasts, remove }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
          t.type === "success"
            ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
      >
        {t.type === "success" ? (
          <Check size={18} className="mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        )}
        <p className="text-sm flex-1 text-white/90">{t.message}</p>
        <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-white/5">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
      </td>
    ))}
  </tr>
);

const ConfirmDialog = ({ open, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Confirmar eliminación</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const FormModal = ({ open, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialForm, ...initialData, password: "" } : initialForm);
      setErrors({});
      setShowPass(false);
    }
  }, [open, initialData]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!isEdit && !form.password.trim()) e.password = "La contraseña es requerida";
    if (!isEdit && form.password && form.password.length < 6)
      e.password = "Mínimo 6 caracteres";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6C63FF]/20 rounded-lg">
              <User size={18} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold">
              {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Nombre completo
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 outline-none transition-all focus:ring-1 ${
                  errors.name
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
                }`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 outline-none transition-all focus:ring-1 ${
                  errors.email
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
                }`}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
            </label>
            <div className="relative">
              <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder={isEdit ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
                className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-white/20 outline-none transition-all focus:ring-1 ${
                  errors.password
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Rol
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1A1A2E]">Sin rol</option>
                <option value="admin" className="bg-[#1A1A2E]">Admin</option>
                <option value="manager" className="bg-[#1A1A2E]">Manager</option>
                <option value="user" className="bg-[#1A1A2E]">Usuario</option>
                <option value="viewer" className="bg-[#1A1A2E]">Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Estado
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all appearance-none cursor-pointer"
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white font-medium text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    active: { label: "Activo", cls: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20" },
    inactive: { label: "Inactivo", cls: "bg-white/5 text-white/40 border-white/10" },
    suspended: { label: "Suspendido", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const s = map[status] || map.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-[#00D4AA]" : status === "suspended" ? "bg-red-400" : "bg-white/30"}`} />
      {s.label}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  if (!role) return <span className="text-white/20 text-xs">—</span>;
  const map = {
    admin: "bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20",
    manager: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    user: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    viewer: "bg-white/5 text-white/40 border-white/10",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${map[role] || map.viewer}`}>
      {role}
    </span>
  );
};

export default function ConfiguracionGeneral() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || data.users || []);
    } catch (err) {
      addToast(err.message || "Error de conexión", "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (form) => {
    setActionLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al crear usuario");
      addToast("Usuario creado correctamente");
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/${editUser.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al actualizar usuario");
      addToast("Usuario actualizado correctamente");
      setModalOpen(false);
      setEditUser(null);
      await fetchUsers();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/${confirmDelete.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error("Error al eliminar usuario");
      addToast("Usuario eliminado correctamente");
      setConfirmDelete(null);
      await fetchUsers();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreate = () => { setEditUser(null); setModalOpen(true); };
  const openEdit = (u) => { setEditUser(u); setModalOpen(true); };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return "—"; }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} remove={removeToast} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        onSubmit={editUser ? handleEdit : handleCreate}
        initialData={editUser}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        message={`¿Estás seguro de eliminar a "${confirmDelete?.name || confirmDelete?.email}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={actionLoading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-white/30 text-sm mb-3">
            <span>Configuración</span>
            <span>/</span>
            <span className="text-[#6C63FF]">General</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items