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
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api/users";
const UPLOAD_URL =
  "https://www.urusverify.com/v1/factory/project/bfce9231-63b4-4c0e-a369-4f484f044096/upload-data";
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
          className={`flex items-start gap-3 rounded-xl p-4 shadow-2xl border text-sm animate-slide-in ${
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
          <button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Skeleton ─── */
function Skeleton({ className }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#1A1A2E] ${className}`}
    />
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-white/5">
          {[40, 120, 160, 120, 90, 80].map((w, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className={`h-4 w-${w === 40 ? "8" : "full"} max-w-[${w}px]`} style={{ width: `${w}px` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ open, onConfirm, onCancel, userName }) {
  if (!open) return null;
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
              <span className="text-white font-medium">{userName}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition text-sm font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ onNew, filtered }) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
            <Users size={36} className="text-[#6C63FF]/60" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-lg">
              {filtered ? "Sin resultados" : "Sin usuarios"}
            </p>
            <p className="text-white/40 text-sm mt-1">
              {filtered
                ? "Intenta con otros filtros de búsqueda."
                : "Crea el primer usuario para comenzar."}
            </p>
          </div>
          {!filtered && (
            <button
              onClick={onNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-sm font-medium transition"
            >
              <Plus size={16} />
              Nuevo usuario
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ─── User Modal Form ─── */
const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "",
  status: "active",
  password: "",
};

function UserModal({ open, onClose, onSave, editData, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(editData ? { ...EMPTY_FORM, ...editData, password: "" } : EMPTY_FORM);
      setErrors({});
      setAvatarFile(null);
      setAvatarPreview(editData?.avatar || null);
      setShowPass(false);
    }
  }, [open, editData]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio.";
    if (!form.email.trim()) e.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email no válido.";
    if (!editData && !form.password.trim()) e.password = "La contraseña es obligatoria.";
    if (form.password && form.password.length < 6)
      e.password = "Mínimo 6 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form, avatarFile);
  };

  if (!open) return null;

  const Field = ({ label, name, type = "text", icon: Icon, placeholder, right }) => (
    <div>
      <label className="block text-white/60 text-xs font-medium mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        )}
        <input
          type={type}
          value={form[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#0A0A0F] border rounded-xl py-2.5 text-white text-sm placeholder-white/20 outline-none transition
            ${Icon ? "pl-9" : "pl-3"} ${right ? "pr-10" : "pr-3"}
            ${errors[name] ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#6C63FF]/60"}`}
        />
        {right}
      </div>
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <User size={18} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold text-base">
              {editData ? "Editar usuario" : "Nuevo usuario"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0A0A0F] border-2 border-[#6C63FF]/30 overflow-hidden shrink-0 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-white/20" />
              )}
            </div>
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-[#6C63FF]/40 text-white/60 hover:text-white text-sm transition">
              <Upload size={14} />
              Subir foto
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo *" name="name" icon={User} placeholder="Ej. Juan Pérez" />
            <Field label="Correo electrónico *" name="email" type="email" icon={Mail} placeholder="correo@ejemplo.com" />
            <Field label="Teléfono" name="phone" icon={Phone} placeholder="+52 000 000 0000" />
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Rol</label>
              <div className="relative">
                <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-[#6C63FF]/60 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm outline-none transition appearance-none"
                >
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visor</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">
              {editData ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[#0A0A0F] border rounded-xl pl-3 pr-10 py-2.5 text-white text-sm placeholder-white/20 outline-none transition
                  ${errors.password ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#6C63FF]/60"}`}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Estado</label>
            <div className="flex gap-3">
              {["active", "inactive", "suspended"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange("status", s)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition ${
                    form.status === s
                      ? s === "active"
                        ? "bg-[#00D4AA]/20 border-[#00D4AA]/40 text-[#00D4AA]"
                        : s === "inactive"
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-red-500/20 border-red-500/40 text-red-400"
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {s === "active" ? "Activo" : s === "inactive" ? "Inactivo" : "Suspendido"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            {editData ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const map = {
    active: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
    inactive: "bg-white/5 text-white/50 border-white/10",
    suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const label = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || map.inactive}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "active" ? "bg-[#00D4AA]" : status === "suspended" ? "bg-red-400" : "bg-white/30"}`} />
      {label[status] || status}
    </span>
  );
}

/* ─── Avatar ─── */
function UserAvatar({ user }) {
  const initials = (user.name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = ["#6C63FF", "#00D4AA", "#FF6584", "#F9A825"];
  const color = colors[(user.id || 0) % colors.length];

  return user.avatar ? (
    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
  ) : (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}40`, color }}
    >
      {initials}
    </div>
  );
}

/* ─── Main Component ─── */
export default function PerfilDeUsuario() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [toasts, setToasts] = useState([]);

  /* ─ Toasts ─ */
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  /* ─ Fetch ─ */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = Array.isArray(json) ? json : json.data || json.users || [];
      setUsers(data);
    } catch (err) {
      addToast("Error al cargar usuarios: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ─ Upload avatar ─ */
  const uploadAvatar = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "x-factory-key": "factory2026" },
      body: fd,
    });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url || json.data?.url || null;
  };

  /* ─ Save ─ */
  const handleSave = async (form, avatarFile) => {
    setSaving(true);
    try {
      let payload = { ...form };
      if (!payload.password) delete payload.password;

      if (avatarFile) {
        const url = await uploadAvatar(avat