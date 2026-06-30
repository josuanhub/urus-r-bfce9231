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
  Activity,
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

const Toast = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
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
        <span className="text-sm font-medium flex-1">{t.message}</span>
        <button
          onClick={() => removeToast(t.id)}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-white/5">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
      </td>
    ))}
  </tr>
);

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-lg">Confirmar acción</h3>
      </div>
      <p className="text-white/60 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
  phone: "",
};

const FormModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...EMPTY_FORM, ...initialData, password: "" } : EMPTY_FORM);
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "El nombre es requerido";
    if (!form.email?.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
    if (!isEdit && !form.password?.trim())
      e.password = "La contraseña es requerida";
    else if (!isEdit && form.password.length < 6)
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
    if (isEdit && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  const field = (key, label, type = "text", extra = {}) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
        {label}
      </label>
      {type === "select" ? (
        <select
          value={form[key] || ""}
          onChange={(e) => {
            setForm((p) => ({ ...p, [key]: e.target.value }));
            setErrors((p) => ({ ...p, [key]: "" }));
          }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF]/50 focus:ring-1 focus:ring-[#6C63FF]/30 transition-all"
        >
          {extra.options?.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#1A1A2E]">
              {o.label}
            </option>
          ))}
        </select>
      ) : type === "password" ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={form[key] || ""}
            placeholder={isEdit ? "Dejar vacío para no cambiar" : ""}
            onChange={(e) => {
              setForm((p) => ({ ...p, [key]: e.target.value }));
              setErrors((p) => ({ ...p, [key]: "" }));
            }}
            className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white text-sm pr-10 focus:outline-none focus:ring-1 transition-all ${
              errors[key]
                ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/30"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          value={form[key] || ""}
          onChange={(e) => {
            setForm((p) => ({ ...p, [key]: e.target.value }));
            setErrors((p) => ({ ...p, [key]: "" }));
          }}
          className={`bg-white/5 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 transition-all placeholder-white/20 ${
            errors[key]
              ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              : "border-white/10 focus:border-[#6C63FF]/50 focus:ring-[#6C63FF]/30"
          }`}
          {...extra}
        />
      )}
      {errors[key] && (
        <span className="text-red-400 text-xs">{errors[key]}</span>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center">
              <Users size={16} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold text-lg">
              {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("name", "Nombre completo")}
            {field("email", "Correo electrónico", "email")}
          </div>
          {field("password", "Contraseña", "password")}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("phone", "Teléfono", "text", {
              placeholder: "+1 234 567 8900",
            })}
            {field("role", "Rol", "select", {
              options: [
                { value: "admin", label: "Administrador" },
                { value: "manager", label: "Manager" },
                { value: "user", label: "Usuario" },
                { value: "viewer", label: "Visor" },
              ],
            })}
          </div>
          {field("status", "Estado", "select", {
            options: [
              { value: "active", label: "Activo" },
              { value: "inactive", label: "Inactivo" },
              { value: "suspended", label: "Suspendido" },
            ],
          })}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white transition-all text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#6C63FF]/20"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? (
                <>
                  <Check size={14} />
                  Actualizar
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Crear Usuario
                </>
              )}
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
  const cfg = map[status] || map.inactive;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "active"
            ? "bg-[#00D4AA]"
            : status === "suspended"
            ? "bg-red-400"
            : "bg-white/30"
        }`}
      />
      {cfg.label}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const map = {
    admin: "bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20",
    manager: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    user: "bg-white/5 text-white/50 border-white/10",
    viewer: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        map[role] || map.user
      }`}
    >
      {role || "user"}
    </span>
  );
};

export default function ActividadReciente() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    []
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || data.users || []);
    } catch (err) {
      addToast(err.message || "Error al cargar datos", "error");
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
      (u.phone || "").toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" || (u.status || "active") === filterStatus;
    const matchRole = filterRole === "all" || (u.role || "user") === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterRole]);

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Error al crear usuario");
      const created = await res.json();
      setUsers((p) => [created.data || created, ...p]);
      addToast("Usuario creado exitosamente", "success");
      setModalOpen(false);
    } catch (err) {
      addToast(err.message || "Error al crear usuario", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${editTarget.id}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Error al actualizar usuario");
      const updated = await res.json();
      const newUser = updated.data || updated;
      setUsers((p) => p.map((u) => (u.id === editTarget.id ? newUser : u)));
      addToast("Usuario actualizado correctamente", "success");
      setModalOpen(false);
      setEditTarget(null);
    } catch (err) {
      addToast(err.message || "Error al actualizar usuario", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error("Error al eliminar usuario");
      setUsers((p) => p.filter((u) => u.id !== id));
      addToast("Usuario eliminado correctamente", "success");
    } catch (err) {
      addToast(err.message || "Error al eliminar usuario", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setModalOpen(true);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const avatarColor = (name) => {
    const colors = [
      "bg-[#6C63FF]/20 text-[#6C63FF]",
      "bg-[#00D4AA]/20 text-[#00D4AA]",
      "bg-blue-500/20 text-blue-400",
      "bg-yellow-500/20 text-yellow-400",
      "bg-pink-500/20 text-pink-400",
    ];
    const idx = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} removeToast={removeToast} />

      {confirmDelete && (
        <ConfirmDialog
          message={`¿Estás seguro de que deseas eliminar al usuario "${confirmDelete.name || confirmDelete.email}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <FormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSubmit={editTarget ? handleEdit : handleCreate}
        initialData={editTarget}
        loading={saving}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/20 flex items-center justify-center border border-[#6C63FF]/20">
              <Activity size={22} className="text-[#6C63FF]" />