import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  LogIn,
  UserPlus,
  UserCircle,
  Shield,
  Settings,
  SlidersHorizontal,
  Plug,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Hexagon,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "#6C63FF",
    children: [
      { label: "Vista General", path: "/dashboard", icon: LayoutDashboard },
      { label: "KPIs Principales", path: "/dashboard/kpis", icon: BarChart3 },
      { label: "Actividad Reciente", path: "/dashboard/activity", icon: Activity },
    ],
  },
  {
    label: "Autenticación y Usuarios",
    icon: Shield,
    color: "#00D4AA",
    children: [
      { label: "Login", path: "/auth/login", icon: LogIn },
      { label: "Registro", path: "/auth/register", icon: UserPlus },
      { label: "Perfil de Usuario", path: "/auth/profile", icon: UserCircle },
      { label: "Gestión de Roles", path: "/auth/roles", icon: Shield },
    ],
  },
  {
    label: "Configuración del Sistema",
    icon: Settings,
    color: "#6C63FF",
    children: [
      { label: "Configuración General", path: "/settings/general", icon: Settings },
      { label: "Preferencias", path: "/settings/preferences", icon: SlidersHorizontal },
      { label: "Integraciones", path: "/settings/integrations", icon: Plug },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({ 0: true, 1: false, 2: false });

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const isActive = (path) => location.pathname === path;

  const isParentActive = (children) =>
    children.some((child) => location.pathname === child.path);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen flex flex-col
          border-r border-white/5
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[70px]" : "w-[260px]"}
        `}
        style={{ background: "#0A0A0F" }}
      >
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, #6C63FF, #00D4AA)" }}
        />

        {/* Logo / Header */}
        <div
          className={`
            flex items-center h-16 px-4 shrink-0
            border-b border-white/5
            ${collapsed ? "justify-center" : "justify-between"}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}
            >
              <Hexagon size={16} className="text-white" fill="white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none overflow-hidden">
                <span
                  className="text-sm font-bold tracking-wider truncate"
                  style={{
                    background: "linear-gradient(90deg, #6C63FF, #00D4AA)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  URUS Core
                </span>
                <span className="text-[10px] text-white/30 tracking-widest uppercase truncate">
                  Management
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
            >
              <X size={16} />
            </button>
          )}

          {collapsed && (
            <button
              onClick={onToggle}
              className="absolute -right-3 top-5 w-6 h-6 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white/90 transition-all duration-200"
              style={{ background: "#1A1A2E" }}
            >
              <Menu size={12} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 scrollbar-none">
          <style>{`
            .scrollbar-none::-webkit-scrollbar { display: none; }
            .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          {navItems.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            const isOpen = openSections[sectionIndex];
            const parentActive = isParentActive(section.children);

            return (
              <div key={sectionIndex} className="mb-1">
                {/* Section header */}
                <button
                  onClick={() => !collapsed && toggleSection(sectionIndex)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group relative
                    ${parentActive
                      ? "text-white bg-white/5"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }
                    ${collapsed ? "justify-center" : "justify-between"}
                  `}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`
                        w-7 h-7 rounded-md flex items-center justify-center shrink-0
                        transition-all duration-200
                        ${parentActive ? "opacity-100" : "opacity-60 group-hover:opacity-90"}
                      `}
                      style={{
                        background: parentActive
                          ? `${section.color}22`
                          : "transparent",
                      }}
                    >
                      <SectionIcon
                        size={16}
                        style={{ color: parentActive ? section.color : "inherit" }}
                      />
                    </div>

                    {!collapsed && (
                      <span className="text-xs font-semibold tracking-wide uppercase truncate">
                        {section.label}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <div
                      className="transition-transform duration-200 shrink-0"
                      style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                    >
                      <ChevronDown size={14} />
                    </div>
                  )}

                  {/* Collapsed tooltip */}
                  {collapsed && (
                    <div
                      className="
                        absolute left-full ml-3 px-3 py-2 rounded-lg
                        text-xs font-medium text-white whitespace-nowrap
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-all duration-200 z-50 shadow-xl
                        border border-white/10
                      "
                      style={{ background: "#1A1A2E" }}
                    >
                      {section.label}
                    </div>
                  )}
                </button>

                {/* Children */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: collapsed
                      ? "0px"
                      : isOpen
                      ? `${section.children.length * 48}px`
                      : "0px",
                    opacity: collapsed ? 0 : isOpen ? 1 : 0,
                  }}
                >
                  <div className="ml-3 pl-3 mt-1 mb-2 border-l border-white/5 space-y-0.5">
                    {section.children.map((item, itemIndex) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg
                            transition-all duration-200 group relative
                            ${active
                              ? "text-white"
                              : "text-white/40 hover:text-white/75 hover:bg-white/5"
                            }
                          `}
                          style={
                            active
                              ? { background: `${section.color}18` }
                              : {}
                          }
                        >
                          {active && (
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                              style={{ background: section.color }}
                            />
                          )}

                          <ItemIcon
                            size={14}
                            className="shrink-0"
                            style={{ color: active ? section.color : "inherit" }}
                          />

                          <span
                            className={`
                              text-xs truncate
                              ${active ? "font-medium" : "font-normal"}
                            `}
                          >
                            {item.label}
                          </span>

                          {active && (
                            <div
                              className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: section.color }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Collapsed children popover */}
                {collapsed && (
                  <div className="group/section relative">
                    {section.children.map((item, itemIndex) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          className={`
                            flex items-center justify-center w-full py-2 px-2 rounded-lg mt-0.5
                            transition-all duration-200 relative group
                            ${active
                              ? "text-white"
                              : "text-white/30 hover:text-white/70"
                            }
                          `}
                          style={active ? { background: `${section.color}18` } : {}}
                        >
                          <ItemIcon
                            size={14}
                            style={{ color: active ? section.color : "inherit" }}
                          />

                          {/* Tooltip for collapsed item */}
                          <div
                            className="
                              absolute left-full ml-3 px-3 py-1.5 rounded-lg
                              text-xs font-medium text-white whitespace-nowrap
                              opacity-0 group-hover:opacity-100 pointer-events-none
                              transition-all duration-200 z-50 shadow-xl
                              border border-white/10
                            "
                            style={{ background: "#1A1A2E" }}
                          >
                            {item.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Separator */}
                {sectionIndex < navItems.length - 1 && (
                  <div className="my-2 mx-3 h-px bg-white/5" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom — Company name */}
        <div
          className={`
            shrink-0 border-t border-white/5 px-4 py-4
            flex items-center gap-3
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #6C63FF44, #00D4AA44)", color: "#00D4AA" }}
          >
            r
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white/80 truncate">r</p>
              <p className="text-[10px] text-white/30 truncate">Empresa</p>
            </div>
          )}

          {collapsed && (
            <div
              className="
                absolute left-full ml-3 px-3 py-1.5 rounded-lg
                text-xs font-medium text-white whitespace-nowrap
                opacity-0 hover:opacity-100
                transition-all duration-200 z-50 shadow-xl
                border border-white/10 hidden group-hover:block
              "
              style={{ background: "#1A1A2E" }}
            >
              r — Empresa
            </div>
          )}
        </div>

        {/* Bottom gradient accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, #6C63FF44, #00D4AA44)" }}
        />
      </aside>
    </>
  );
}