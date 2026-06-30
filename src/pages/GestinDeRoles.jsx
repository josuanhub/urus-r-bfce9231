import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

const API_URL =
  "https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api/roles";
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
          className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 ${
            t.type === "success"
              ? "bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {t.type === "success" ? (
            <Check size={16} className="shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-md bg-white/5 animate-pulse" style={{ width: `${[60, 40, 80, 50, 40][i]}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ role, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">Eliminar rol</h3>
            <p className="text-white/50 text-xs">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-6">
          ¿Estás seguro de que deseas eliminar el rol{" "}
          <span className="text-white font-semibold">"{role?.name}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────
function RoleModal({ role, onClose, onSave, saving }) {
  const isEdit = !!role?.id;
  const [form, setForm] = useState({
    name: role?.name || "",
    description: role?.description || "",
    is_active: role?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio";
    else if (form.name.trim().length < 2) e.name = "Mínimo 2 caracteres";
    return e;
  };

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);
    onSave({ ...role, ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
              <Shield size={16} className="text-[#6C63FF]" />
            </div>
            <h2 className="text-white font-semibold text-base">
              {isEdit ? "Editar rol" : "Nuevo rol"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Nombre del rol <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="ej. Administrador"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 transition ${
                errors.name
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : "border-white/10 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50"
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              placeholder="Describe brevemente las responsabilidades..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50 transition resize-none"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handle}
                className="sr-only"
              />
              <div
                className={`w-10 h-5.5 h-[22px] rounded-full transition-colors duration-200 ${
                  form.is_active ? "bg-[#6C63FF]" : "bg-white/15"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
                    form.is_active ? "translate-x-[18px]" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
            <span className="text-sm text-white/70 group-hover:text-white/90 transition">
              Rol activo
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e8] disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {isEdit ? "Guardar cambios" : "Crear rol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GestionDeRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | { role }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  // ── Toast helpers ────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : data.data || []);
    } catch {
      addToast("Error al cargar los roles", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ── Filter + paginate ────────────────────────────────────────────────────────
  const filtered = roles.filter((r) => {
    const matchSearch =
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && r.is_active) ||
      (filterStatus === "inactive" && !r.is_active);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);
    const isEdit = !!formData.id;
    try {
      const res = await fetch(isEdit ? `${API_URL}/${formData.id}` : API_URL, {
        method: isEdit ? "PUT" : "POST",
        headers: HEADERS,
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      addToast(isEdit ? "Rol actualizado correctamente" : "Rol creado correctamente");
      setModal(null);
      fetchRoles();
    } catch {
      addToast(isEdit ? "Error al actualizar el rol" : "Error al crear el rol", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/${confirmDelete.id}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error();
      addToast("Rol eliminado correctamente");
      setConfirmDelete(null);
      fetchRoles();
    } catch {
      addToast("Error al eliminar el rol", "error");
      setConfirmDelete(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Toast toasts={toasts} remove={removeToast} />

      {modal && (
        <RoleModal
          role={modal.role}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          role={confirmDelete}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            <span>Autenticación y Usuarios</span>
            <span>/</span>
            <span className="text-[#6C63FF]">Gestión de Roles</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4AA]/20 border border-[#6C63FF]/30 flex items-center justify-center">
                <Shield size={20} className="text-[#6C63FF]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Gestión de Roles</h1>
                <p className="text-white/40 text-sm">
                  {loading ? "Cargando..." : `${roles.length} rol${roles.length !== 1 ? "es" : ""} registrado${roles.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRoles}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition"
                title="Recargar"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setModal({ role: null })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e8] text-white text-sm font-semibold transition shadow-lg shadow-[#6C63FF]/20"
              >
                <Plus size={16} />
                <span>Nuevo rol</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50 transition"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 focus:border-[#6C63FF]/50 transition appearance-none cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {/* Stats chips */}
        {!loading && roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { label: "Total", value: roles.length, color: "text-white/60 border-white/10" },
              { label: "Activos", value: roles.filter((r) => r.is_active).length, color: "text-[#00D4AA] border-[#00D4AA]/20 bg-[#00D4AA]/5" },
              { label: "Inactivos", value: roles.filter((r) => !r.is_active).length, color: "text-white/40 border-white/10" },
            ].map((chip) => (
              <div key={chip.label} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium ${chip.color}`}>
                <span>{chip.label}:</span>
                <span className="font-bold">{chip.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-[#1A1A2E]/60 border border-white/8 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Descripción</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Creado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
                          <ShieldCheck size={28} className="text-[#6C63FF]/50" />