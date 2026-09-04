import React from 'react';
import {
  Calendar,
  Users,
  Palmtree,
  Bell,
  Smartphone,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Filter,
} from 'lucide-react';
import { UserProfile, TurmaId } from '../types';
import { TURMAS } from '../data/equipes';

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  user: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenTeams: () => void;
  onOpenVacations: () => void;
  activeVacationsCount: number;
  onOpenNotifications: () => void;
  onOpenInstall: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  selectedTurmaFilter: TurmaId | 'GERAL';
  onSelectTurmaFilter: (turma: TurmaId | 'GERAL') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggleExpand,
  isMobileOpen,
  onCloseMobile,
  user,
  onOpenLogin,
  onLogout,
  onOpenTeams,
  onOpenVacations,
  activeVacationsCount,
  onOpenNotifications,
  onOpenInstall,
  isDarkMode,
  onToggleTheme,
  selectedTurmaFilter,
  onSelectTurmaFilter,
}) => {
  const turmaInfo = user?.turma ? TURMAS[user.turma] : null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none ${
          /* Mobile slide-in */
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop width responsive */
          isExpanded ? 'w-64' : 'w-18'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            {isExpanded && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                    Escala 6x2
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Contínua
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Gestão Operacional
                </p>
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle Button (Desktop) */}
          <button
            onClick={onToggleExpand}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Recolher barra lateral' : 'Expandir barra lateral'}
          >
            {isExpanded ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          {/* Close Button (Mobile) */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fechar menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
          {/* Section: Visualização de Turmas */}
          <div className="space-y-1">
            {isExpanded && (
              <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3 h-3" />
                <span>Filtrar Escala</span>
              </div>
            )}

            {/* General 4 Turmas Button */}
            <button
              onClick={() => {
                onSelectTurmaFilter('GERAL');
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTurmaFilter === 'GERAL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="Todas as 4 Turmas (Visão Geral)"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                  selectedTurmaFilter === 'GERAL'
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                4T
              </div>
              {isExpanded && <span className="truncate">Visão Geral (4 Turmas)</span>}
            </button>

            {/* Turmas A, B, C, D */}
            {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
              const isSelected = selectedTurmaFilter === tId;
              const isUserTurma = user?.turma === tId;
              const tData = TURMAS[tId];

              return (
                <button
                  key={tId}
                  onClick={() => {
                    onSelectTurmaFilter(tId);
                    if (window.innerWidth < 1024) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? `${tData.badgeCor} shadow-xs font-extrabold`
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                  title={`Turma ${tId}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : `${tData.bgCor} ${tData.textCor}`
                    }`}
                  >
                    {tId}
                  </div>
                  {isExpanded && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">Turma {tId}</span>
                      {isUserTurma && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-white/20 text-inherit">
                          Sua
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section: Gestão e Ações */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {isExpanded && (
              <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Operação & Pessoal
              </div>
            )}

            {/* Férias */}
            <button
              onClick={() => {
                onOpenVacations();
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              title="Gestão de Férias e Substitutos"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Palmtree className="w-4 h-4" />
              </div>
              {isExpanded && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">Gestão de Férias</span>
                  {activeVacationsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                      {activeVacationsCount}
                    </span>
                  )}
                </div>
              )}
            </button>

            {/* Equipes */}
            <button
              onClick={() => {
                onOpenTeams();
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              title="Quadro de Equipes e Operadores"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              {isExpanded && <span className="truncate">Quadro de Equipes</span>}
            </button>

            {/* Notificações */}
            <button
              onClick={() => {
                onOpenNotifications();
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors relative"
              title="Alertas e Lembretes de Turno"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              {isExpanded && <span className="truncate">Lembretes & Avisos</span>}
            </button>

            {/* Instalar PWA */}
            <button
              onClick={() => {
                onOpenInstall();
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              title="Instalar aplicativo móvel (PWA)"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              {isExpanded && <span className="truncate">Instalar no Celular</span>}
            </button>
          </div>
        </div>

        {/* Footer: User Profile & Dark Mode Toggle */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </div>
            {isExpanded && (
              <span className="truncate">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            )}
          </button>

          {/* User Account Bar */}
          {user && !user.modoAnonimo ? (
            <div
              className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 ${
                !isExpanded && 'justify-center'
              }`}
            >
              <div
                onClick={onOpenLogin}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer overflow-hidden flex-1"
                title="Alterar perfil"
              >
                <div
                  className={`w-7 h-7 rounded-lg ${
                    turmaInfo?.badgeCor || 'bg-slate-700 text-white'
                  } flex items-center justify-center text-xs font-black shrink-0`}
                >
                  {user.turma}
                </div>
                {isExpanded && (
                  <div className="min-w-0 animate-in fade-in">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.nome || `Turma ${user.turma}`}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Turma {user.turma} • {user.cargo || 'Operador'}
                    </div>
                  </div>
                )}
              </div>

              {isExpanded && (
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                  title="Sair do perfil"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenLogin();
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
              title="Identificar meu perfil"
            >
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              {isExpanded && <span className="truncate">Selecionar Perfil</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
