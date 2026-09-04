import React from 'react';
import { Menu, Palmtree, User, Sparkles } from 'lucide-react';
import { UserProfile, TurmaId } from '../types';
import { TURMAS } from '../data/equipes';

interface TopNavProps {
  onOpenMobileSidebar: () => void;
  user: UserProfile | null;
  onOpenLogin: () => void;
  onOpenVacations: () => void;
  activeVacationsCount: number;
  selectedTurmaFilter: TurmaId | 'GERAL';
  onSelectTurmaFilter: (turma: TurmaId | 'GERAL') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileSidebar,
  user,
  onOpenLogin,
  onOpenVacations,
  activeVacationsCount,
  selectedTurmaFilter,
  onSelectTurmaFilter,
}) => {
  const turmaInfo = user?.turma ? TURMAS[user.turma] : null;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Sidebar Trigger + Title / Breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                Escala de Turnos 6x2
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                • 4 Turmas em Regime Ininterrupto
              </span>
            </div>
          </div>
        </div>

        {/* Center: Segmented Turma Filter Pills (Quick switcher on desktop) */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => onSelectTurmaFilter('GERAL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedTurmaFilter === 'GERAL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Geral
          </button>
          {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
            const isSelected = selectedTurmaFilter === tId;
            return (
              <button
                key={tId}
                onClick={() => onSelectTurmaFilter(tId)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  isSelected
                    ? `${TURMAS[tId].badgeCor} shadow-xs`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Turma {tId}</span>
                {user?.turma === tId && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Actions (Férias badge + User status) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Férias Button */}
          <button
            onClick={onOpenVacations}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all active:scale-95"
            title="Gestão de Férias e Substituições"
          >
            <Palmtree className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Férias</span>
            {activeVacationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {activeVacationsCount}
              </span>
            )}
          </button>

          {/* User Button */}
          {user && !user.modoAnonimo ? (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs"
              title="Meu Perfil"
            >
              <div
                className={`w-6 h-6 rounded-lg ${
                  turmaInfo?.badgeCor || 'bg-slate-700 text-white'
                } flex items-center justify-center font-black text-[11px] shrink-0`}
              >
                {user.turma}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[90px] sm:max-w-[120px]">
                {user.nome ? user.nome.split(' ')[0] : `Turma ${user.turma}`}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
