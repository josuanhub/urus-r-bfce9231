import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

// ─── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Hook ───────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

// ─── Config por tipo ─────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bar: "bg-[#00D4AA]",
    iconColor: "text-[#00D4AA]",
    border: "border-[#00D4AA]/30",
    glow: "shadow-[0_0_20px_rgba(0,212,170,0.15)]",
    label: "Éxito",
  },
  error: {
    icon: XCircle,
    bar: "bg-red-500",
    iconColor: "text-red-400",
    border: "border-red-500/30",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    label: "Error",
  },
  info: {
    icon: Info,
    bar: "bg-[#6C63FF]",
    iconColor: "text-[#6C63FF]",
    border: "border-[#6C63FF]/30",
    glow: "shadow-[0_0_20px_rgba(108,99,255,0.15)]",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-400",
    iconColor: "text-amber-400",
    border: "border-amber-400/30",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.15)]",
    label: "Aviso",
  },
};

const AUTO_DISMISS = 4000;
const MAX_TOASTS = 3;

// ─── Toast individual ────────────────────────────────────────────────────────
const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);
  const startRef = useRef(null);
  const pausedRef = useRef(false);
  const remainingRef = useRef(AUTO_DISMISS);

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / remainingRef.current) * 100);
      setProgress(pct);
      if (pct === 0) {
        clearInterval(intervalRef.current);
        handleClose();
      }
    }, 30);
  }, []);

  const handleClose = useCallback(() => {
    clearInterval(intervalRef.current);
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 350);
  }, [toast.id, onRemove]);

  const handleMouseEnter = () => {
    pausedRef.current = true;
    remainingRef.current -= Date.now() - startRef.current;
  };

  const handleMouseLeave = () => {
    pausedRef.current = false;
    startRef.current = Date.now();
  };

  useEffect(() => {
    // mount animation
    const frame = requestAnimationFrame(() => setVisible(true));
    startTimer();
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(intervalRef.current);
    };
  }, []);

  const baseTransform = visible && !leaving
    ? "translate-x-0 opacity-100 scale-100"
    : leaving
    ? "translate-x-full opacity-0 scale-95"
    : "translate-x-full opacity-0 scale-95";

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative w-full max-w-sm
        bg-[#1A1A2E] border ${config.border} ${config.glow}
        rounded-xl overflow-hidden
        transition-all duration-350 ease-out
        ${baseTransform}
        cursor-default select-none
      `}
      style={{ transitionDuration: "350ms" }}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${config.bar}`} />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full">
        <div
          className={`h-full ${config.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Icon */}
        <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>
          <Icon size={18} strokeWidth={2} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider ${config.iconColor} mb-0.5`}>
            {config.label}
          </p>
          {toast.title && (
            <p className="text-sm font-semibold text-white leading-snug">
              {toast.title}
            </p>
          )}
          {toast.message && (
            <p className="text-xs text-white/60 leading-relaxed mt-0.5 line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 mt-0.5 p-1 rounded-md text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", title, message }) => {
    setToasts((prev) => {
      const next = [
        ...prev,
        { id: `toast-${Date.now()}-${Math.random()}`, type, title, message },
      ];
      // Mantener máximo MAX_TOASTS (quitar los más viejos)
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helpers de conveniencia
  const toast = {
    success: (opts) =>
      addToast(typeof opts === "string" ? { type: "success", message: opts } : { type: "success", ...opts }),
    error: (opts) =>
      addToast(typeof opts === "string" ? { type: "error", message: opts } : { type: "error", ...opts }),
    info: (opts) =>
      addToast(typeof opts === "string" ? { type: "info", message: opts } : { type: "info", ...opts }),
    warning: (opts) =>
      addToast(typeof opts === "string" ? { type: "warning", message: opts } : { type: "warning", ...opts }),
    add: addToast,
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Portal-like fixed container */}
      <div
        aria-label="Notificaciones"
        className="
          fixed bottom-4 right-4
          z-[9999]
          flex flex-col-reverse gap-2
          w-[calc(100vw-2rem)] sm:w-80
          pointer-events-none
        "
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;