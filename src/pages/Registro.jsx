import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
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
            <Check size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          )}
          <p className="text-sm flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
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
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

/* ─── Skeleton ─── */
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
        </td>
      ))}
    </tr>
  );
}

/* ─── Empty State ─── */
function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-20 h-20 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
        <Users size={36} className="text-[#6C63FF]" />
      </div>
      <div className="text-center">
        <h3 className="text-white font-semibold text-lg mb-1">No hay usuarios registrados</h3>
        <p className="text-white/40 text-sm">Comienza creando el primer usuario del sistema.</p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#6C63FF] hover:bg-[#5A52E0] text-white rounded-xl text-sm font-medium transition-colors"
      >
        <UserPlus size={16} />
        Crear primer usuario
      </button>
    </div>
  );
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ open, user, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Eliminar usuario</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">
          ¿Estás seguro de que deseas eliminar a{" "}
          <span className="text-white font-medium">{user?.name || user?.email}</span>? Esta acción no
          se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-white/10 text-white/70 rounded-xl text-sm hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
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
  password: "",
  phone: "",
  status: "active",
  role: "user",
};

function validate(form, isEdit) {
  const errs = {};
  if (!form.name.trim()) errs.name = "El nombre es requerido";
  if (!form.email.trim()) errs.email = "El email es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email inválido";
  if (!isEdit && !form.password.trim()) errs.password = "La contraseña es requerida";
  if (!isEdit && form.password && form.password.length < 6)
    errs.password = "Mínimo 6 caracteres";
  return errs;
}

function FormModal({ open, editData, onClose, onSaved, toast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      setForm(editData ? { ...EMPTY_FORM, ...editData, password: "" } : EMPTY_FORM);
      setErrors({});
      setShowPass(false);
    }
  }, [open, editData]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const body = { ...form };
      if (isEdit && !body.password) delete body.password;
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${API_URL}/${editData.id}` : API_URL;
      const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      toast(isEdit ? "Usuario actualizado correctamente" : "Usuario creado correctamente", "success");
      onSaved(data?.data || data, isEdit);
      onClose();
    } catch (err) {
      toast(err.message || "Error al guardar el usuario", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const Field = ({ label, id, type = "text", value, onChange, error, children }) => (
    <div>
      <label className="block text-xs font-medium text-white/60 mb-1.5">{label}</label>
      {children || (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white/5 border ${
            error ? "border-red-500/50" : "border-white/10"
          } rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all`}
        />
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1A1A2E] z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/25 flex items-center justify-center">
              {isEdit ? <Edit2 size={16} className="text-[#6C63FF]" /> : <UserPlus size={16} className="text-[#6C63FF]" />}
            </div>
            <h2 className="text-white font-semibold">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          <Field label="Nombre completo *" id="name" value={form.name} onChange={(v) => set("name", v)} error={errors.name} />
          <Field label="Correo electrónico *" id="email" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} />

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Contraseña {isEdit ? "(dejar vacío para no cambiar)" : "*"}
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={`w-full bg-white/5 border ${
                  errors.password ? "border-red-500/50" : "border-white/10"
                } rounded-xl px-4 py-2.5 pr-10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all`}
                placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <Field label="Teléfono" id="phone" value={form.phone} onChange={(v) => set("phone", v)} error={errors.phone} />

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all appearance-none"
              >
                <option value="active" className="bg-[#1A1A2E]">Activo</option>
                <option value="inactive" className="bg-[#1A1A2E]">Inactivo</option>
                <option value="suspended" className="bg-[#1A1A2E]">Suspendido</option>
              </select>
            </div>
            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Rol</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/20 transition-all appearance-none"
              >
                <option value="admin" className="bg-[#1A1A2E]">Admin</option>
                <option value="user" className="bg-[#1A1A2E]">Usuario</option>
                <option value="viewer" className="bg-[#1A1A2E]">Viewer</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/10 text-white/70 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#6C63FF] hover:bg-[#5A52E0] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw size={14} className="animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Badge ─── */
function StatusBadge({ status }) {
  const map = {
    active: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
    inactive: "bg-white/5 text-white/50 border-white/10",
    suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${map[status] || map.inactive}`}>
      {labels[status] || status}
    </span>
  );
}

function RoleBadge({ role }) {
  const map = {
    admin: "bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20",
    user: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    viewer: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${map[role] || "bg-white/5 text-white/50 border-white/10"}`}>
      {role}
    </span>
  );
}

/* ─── Avatar ─── */
function Avatar({ name, email }) {
  const initials = (name || email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = ["#6C63FF", "#00D4AA", "#F59E0B", "#EF4444", "#8B5CF6"];
  const idx = (name || email || "").charCodeAt(0) % colors.length;
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: colors[idx] + "33", border: `1px solid ${colors[idx]}55`, color: colors[idx] }}
    >
      {initials}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Registro() {
  const { toasts, add: addToast, remove } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* Fetch */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || json.users || [];
      setUsers(list);
    } catch (err) {
      addToast(err.message || "Error al cargar usuarios", "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* Filtered */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchQ && matchStatus && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filterStatus, filterRole]);

  /* CRUD Handlers */
  const handleSaved = (saved, isEdit) => {
    setUsers((prev) =>
      isEdit ? prev.map((u) => (u.id === saved.id ? { ...u, ...saved } : u)) : [saved, ...prev]
    );
  };

  const openEdit = (user) => { setEditData(user); setModalOpen(true); };
  const openNew = () => { setEditData(null); setModalOpen(true); };
  const openDelete = (user) => { setDeleteTarget(user); setConfirmOpen(true); };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, { method: "DELETE", headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      addToast("Usuario eliminado correctamente", "success");
      setConfirmOpen(false);
    } catch (err) {
      addToast(err.message || "Error al eliminar el usuario", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} remove={remove} />

      <FormModal
        open={modalOpen}
        editData={editData}
        onClose={() => set