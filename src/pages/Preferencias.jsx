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
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api/users";
const HEADERS = {
  "Content-Type": "application/json",
  "x-factory-key": "factory2026",
};
const PAGE_SIZE = 20;

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: "",
  status: "active",
  phone: "",
};

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#0A0A0F]/95 border-[#00D4AA]/40 text-[#00D4AA]"
              : "bg-[#0A0A0F]/95 border-red-500/40 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <Check size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          )}
          <span className="text-sm font-medium flex-1 text-white/90">
            {t.message}
          </span>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/5 rounded-lg animate-pulse w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, userName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">
              Eliminar usuario
            </h3>
            <p className="text-white/50 text-xs mt-0.5">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-6">
          ¿Estás seguro de que deseas eliminar a{" "}
          <span className="text-white font-medium">"{userName}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all border border-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 text-sm font-medium transition-all border border-red-500/30"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({ open, onClose, onSave, editData, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editData ? { ...INITIAL_FORM, ...editData, password: "" } : INITIAL_FORM);
      setErrors({});
      setShowPass(false);
    }
  }, [open, editData]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio";
    if (!form.email.trim()) e.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    if (!editData && !form.password.trim())
      e.password = "La contraseña es obligatoria";
    else if (form.password && form.password.length < 6)
      e.password = "Mínimo 6 caracteres";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    onSave(payload);
  };

  const field = (key, label, type = "text", extra = {}) => (
    <div>
      <label className="block text-xs font-medium text-white/60 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={(e) => {
          setForm((p) => ({ ...p, [key]: e.target.value }));
          if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
        }}
        className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
          errors[key]
            ? "border-red-500/60 focus:ring-red-500/30"
            : "border-white/10 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50"
        }`}
        {...extra}
      />
      {errors[key] && (
        <p className="text-red-400 text-xs mt-1">{errors[key]}</p>
      )}
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center">
              <UserPlus size={18} className="text-[#6C63FF]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">
                {editData ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <p className="text-white/40 text-xs">
                {editData ? "Modifica los datos del usuario" : "Completa el formulario"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("name", "Nombre completo", "text", {
              placeholder: "Juan García",
            })}
            {field("email", "Correo electrónico", "email", {
              placeholder: "juan@email.com",
            })}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              {editData ? "Nueva contraseña (opcional)" : "Contraseña"}
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password || ""}
                onChange={(e) => {
                  setForm((p) => ({ ...p, password: e.target.value }));
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: null }));
                }}
                placeholder="••••••••"
                className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-red-500/60 focus:ring-red-500/30"
                    : "border-white/10 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("phone", "Teléfono", "tel", { placeholder: "+1 234 567 8900" })}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Rol
              </label>
              <input
                type="text"
                value={form.role || ""}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                placeholder="admin, user, editor..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Estado
            </label>
            <select
              value={form.status || "active"}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50 transition-all"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              }}
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {editData ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Preferencias() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || data.users || []);
    } catch (err) {
      addToast("No se pudieron cargar los usuarios", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || (u.status || "active") === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const isEdit = !!modal.data;
      const url = isEdit ? `${API_URL}/${modal.data.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (isEdit) {
        setUsers((p) =>
          p.map((u) =>
            u.id === modal.data.id ? { ...u, ...formData, ...result } : u
          )
        );
        addToast("Usuario actualizado correctamente");
      } else {
        setUsers((p) => [result.data || result, ...p]);
        addToast("Usuario creado correctamente");
      }
      setModal({ open: false, data: null });
    } catch {
      addToast(
        modal.data
          ? "Error al actualizar el usuario"
          : "Error al crear el usuario",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${confirm.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error();
      setUsers((p) => p.filter((u) => u.id !== confirm.id));
      addToast("Usuario eliminado correctamente");
    } catch {
      addToast("Error al eliminar el usuario", "error");
    } finally {
      setConfirm({ open: false, id: null, name: "" });
    }
  };

  const statusBadge = (status) => {
    const map = {
      active: "bg-[#00D4AA]/15 text-[#00D4AA] border-[#00D4AA]/30",
      inactive: "bg-white/5 text-white/50 border-white/10",
      suspended: "bg-red-500/15 text-red-400 border-red-500/30",
    };
    const label = {
      active: "Activo",
      inactive: "Inactivo",
      suspended: "Suspendido",
    };
    const s = status || "active";
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[s] || map.inactive}`}
      >
        {label[s] || s}
      </span>
    );
  };

  const avatar = (name) => {
    const initials = (name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          background: "linear-gradient(135deg, #6C63FF33, #00D4AA33)",
          border: "1px solid #6C63FF40",
          color: "#6C63FF",
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-4 sm:p-6 lg:p-8">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        open={confirm.open}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        userName={confirm.name}
      />
      <UserModal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        onSave={handleSave}
        editData={modal.data}
        loading={saving}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
          <span>Configuración del Sistema</span>
          <span>/</span>
          <span className="text-[#6C63FF]">Preferencias</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Preferencias
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Gestiona los usuarios del sistema y sus configuraciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setModal({ open: true, data: null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo usuario</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6