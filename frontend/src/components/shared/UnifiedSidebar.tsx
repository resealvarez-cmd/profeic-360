"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Archive, Search, Scale, ClipboardCheck,
  MessageSquare, Brain, Puzzle, Globe, UserCircle,
  LogOut, ChevronLeft, ChevronRight, ChevronDown, Menu, X,
  LayoutDashboard, Users, FileText, BarChart3, Calendar,
  Target, Building2, GitCompare, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════
   SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  show: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon: Icon, label, isActive = false, show, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={!show ? label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group duration-200 relative",
        isActive
          ? "bg-[#C87533] text-white shadow-lg shadow-orange-900/20"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon 
        size={18} 
        className={cn(
          "transition-all shrink-0",
          isActive ? "text-white" : "text-slate-400 group-hover:text-white"
        )} 
      />
      {show && <span className="text-[13px] font-bold tracking-tight truncate">{label}</span>}
      {!show && (
        <div className="absolute left-full ml-3 w-max px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-slate-700">
          {label}
        </div>
      )}
    </Link>
  );
}

function CollapsibleSection({
  label,
  icon: Icon,
  children,
  show,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  show: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!show) {
    return (
      <div className="py-2 border-t border-slate-100 first:border-0 mt-2 first:mt-0">
        <div className="space-y-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", !open && "-rotate-90")} />
      </button>
      {open && <div className="space-y-1 mt-1">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN SIDEBAR
   ═══════════════════════════════════════════════════════════════════ */

export default function UnifiedSidebar() {
  const {
    sidebarCollapsed: showCollapsed,
    setSidebarCollapsed,
    userName,
    schools,
    currentSchoolId,
    setCurrentSchoolId,
    individualPlan,
    schoolPlan,
    isSuperAdmin,
    isDirectivo,
    isSostenedor,
    logout,
  } = useAuth();

  const show = !showCollapsed;
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!showCollapsed);
  };

  const closeMobile = () => setIsMobileOpen(false);
  const isActive = (path: string) => pathname === path;
  const isActivePrefix = (prefix: string) => pathname.startsWith(prefix);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in" onClick={closeMobile} />
      )}

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-white/10 print:hidden overflow-x-hidden",
          isDirectivo ? "bg-[#1B3C73]" : "bg-slate-900",
          show ? "w-64" : "w-20",
          !isMobileOpen ? "hidden md:flex" : "flex w-64 shadow-2xl"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-[#C87533] border border-orange-400/30 text-white hover:bg-[#A65E26] rounded-full p-1 shadow-md z-50 hover:scale-110 transition-all hidden md:flex"
        >
          {show ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Brand / Profile Area */}
        <div className="p-6 flex flex-col space-y-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20 shrink-0 p-1">
              <img src="/logo_profeic.png" alt="ProfeIC Logo" className="w-full h-full object-contain" />
            </div>
            {show && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white text-sm truncate">{userName || "Usuario"}</span>
                <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest leading-none">
                  {isSuperAdmin ? "Control Global" : isSostenedor ? "Red de Colegios" : isDirectivo ? "Gestión Escolar" : "Aula Docente"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* School Selector */}
        {show && (isSostenedor || isSuperAdmin) && schools.length > 0 && (
          <div className="px-4 py-2 mb-4 shrink-0">
            <div className="relative group/selector">
              <button
                className="w-full bg-white/5 border border-white/10 hover:border-orange-400/50 text-[11px] font-bold text-slate-300 rounded-xl px-3 py-2.5 flex items-center justify-between transition-all group-hover:bg-white/10"
                onClick={() => {
                  const el = document.getElementById('school-dropdown');
                  if (el) el.classList.toggle('hidden');
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  <span className="truncate">{schools.find(s => s.id === currentSchoolId)?.name || "Seleccionar colegio..."}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              <div id="school-dropdown" className="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {schools.map(s => (
                  <button
                    key={s.id}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-[11px] font-semibold transition-colors flex items-center gap-2",
                      s.id === currentSchoolId ? "bg-slate-50 text-[#1a2e3b]" : "text-slate-500 hover:bg-slate-50 hover:text-[#1a2e3b]"
                    )}
                    onClick={() => {
                      setCurrentSchoolId(s.id);
                      const url = new URL(window.location.href);
                      url.searchParams.set("school_id", s.id);
                      window.location.href = url.toString();
                    }}
                  >
                    <Building2 className={s.id === currentSchoolId ? "text-[#C87533]" : "text-slate-300"} size={12} />
                    <span className="truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-4 py-2">
          <NavItem href="/dashboard" icon={Home} label="Inicio" isActive={isActive("/dashboard")} show={show} onClick={closeMobile} />

          <CollapsibleSection label="Aula Docente" icon={BookOpen} show={show}>
            <NavItem href="/planificador" icon={BookOpen} label="Planificador" isActive={isActive("/planificador")} show={show} onClick={closeMobile} />
            <NavItem href="/biblioteca" icon={Archive} label="Biblioteca" isActive={isActive("/biblioteca")} show={show} onClick={closeMobile} />
            <NavItem href="/analizador" icon={Search} label="Analizador IA" isActive={isActive("/analizador")} show={show} onClick={closeMobile} />
            <NavItem href="/evaluaciones" icon={ClipboardCheck} label="Evaluaciones" isActive={isActive("/evaluaciones")} show={show} onClick={closeMobile} />
            <NavItem href="/rubricas" icon={Scale} label="Rúbricas" isActive={isActive("/rubricas")} show={show} onClick={closeMobile} />
          </CollapsibleSection>

          <CollapsibleSection label="Asistentes IA" icon={Brain} show={show} defaultOpen={false}>
            <NavItem href="/lectura-inteligente" icon={BookOpen} label="Lectura" isActive={isActive("/lectura-inteligente")} show={show} onClick={closeMobile} />
            <NavItem href="/mentor" icon={MessageSquare} label="Mentor IA" isActive={isActive("/mentor")} show={show} onClick={closeMobile} />
            <NavItem href="/elevador" icon={Brain} label="Elevador" isActive={isActive("/elevador")} show={show} onClick={closeMobile} />
            <NavItem href="/nee" icon={Puzzle} label="NEE" isActive={isActive("/nee")} show={show} onClick={closeMobile} />
            <NavItem href="/mensajeria" icon={MessageSquare} label="Mensajería" isActive={isActive("/mensajeria")} show={show} onClick={closeMobile} />
          </CollapsibleSection>

          {(isDirectivo || isSuperAdmin) && !individualPlan && (isSuperAdmin || ["pro", "enterprise"].includes(schoolPlan)) && (
            <CollapsibleSection label="Gestión Escolar" icon={LayoutDashboard} show={show}>
              <NavItem href="/acompanamiento/dashboard" icon={LayoutDashboard} label="Dashboard 360°" isActive={isActive("/acompanamiento/dashboard")} show={show} onClick={closeMobile} />
              <NavItem href="/acompanamiento/docentes" icon={Users} label="Mis Docentes" isActive={isActive("/acompanamiento/docentes")} show={show} onClick={closeMobile} />
              <NavItem href="/mejora-continua" icon={Target} label="Mejorando Juntos" isActive={isActive("/mejora-continua")} show={show} onClick={closeMobile} />
              <NavItem href="/simce" icon={BarChart3} label="SIMCE" isActive={isActivePrefix("/simce")} show={show} onClick={closeMobile} />
              <NavItem href="/acompanamiento/admin/users" icon={Users} label="Gestión Usuarios" isActive={isActive("/acompanamiento/admin/users")} show={show} onClick={closeMobile} />
              <NavItem href="/acompanamiento/admin/eventos" icon={Calendar} label="Anual" isActive={isActive("/acompanamiento/admin/eventos")} show={show} onClick={closeMobile} />
            </CollapsibleSection>
          )}

          {isSostenedor && (
            <CollapsibleSection label="Red de Colegios" icon={Building2} show={show}>
              <NavItem href="/holding" icon={Building2} label="Vista General" isActive={isActive("/holding")} show={show} onClick={closeMobile} />
              <NavItem href="/holding?view=comparison" icon={GitCompare} label="Comparativo" isActive={pathname === "/holding"} show={show} onClick={closeMobile} />
            </CollapsibleSection>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
          {isSuperAdmin && (
            <Link
              href="/superadmin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 text-orange-400 hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/20 mb-2 border border-orange-900/30",
                !show && "justify-center px-0"
              )}
            >
              <Sparkles size={16} />
              {show && <span>SaaS Control</span>}
            </Link>
          )}
          
          <NavItem href="/perfil" icon={UserCircle} label="Mi Perfil" isActive={isActive("/perfil")} show={show} onClick={closeMobile} />
          
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all",
              !show && "justify-center px-0"
            )}
          >
            <LogOut size={18} />
            {show && <span className="text-[13px] font-bold tracking-tight">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a2e3b] flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <span className="font-bold text-[#1a2e3b]">ProfeIC</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-400 hover:text-[#1a2e3b]">
          <Menu size={24} />
        </button>
      </div>
    </>
  );
}
