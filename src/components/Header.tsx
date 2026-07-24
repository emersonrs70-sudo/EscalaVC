import React from 'react';
import { Calendar, User, LogOut, Bell, Users, Sun, Moon, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';
import { TURMAS } from '../data/equipes';

interface HeaderProps {
  user: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenTeams: () => void;
  onOpenNotifications: () => void;
  onOpenInstall: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenLogin,
  onLogout,
  onOpenTeams,
  onOpenNotifications,
  onOpenInstall,
  isDarkMode,
  onToggleTheme,
}) => {
  const turmaInfo = user?.turma ? TURMAS[user.turma] : null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors w-full overflow-hidden">
      <div className="max-w-4xl lg:max-w-7xl 2xl:max-w-[1500px] w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                Escala 6x2
              </h1>
              <span className="hidden sm:inline-block text-[10px] sm:text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shrink-0">
                4 Turmas Continuous Shift
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
              Turnos contínuos e calendário de folgas atualizado
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Install PWA Button */}
          <button
            onClick={onOpenInstall}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-2xs active:scale-95"
            title="Instalar aplicativo no celular"
            aria-label="Instalar app no celular"
          >
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" />
            <span className="hidden sm:inline">Baixar App</span>
          </button>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
            title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label="Alternar tema claro/escuro"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* Teams Button */}
          <button
            onClick={onOpenTeams}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
            title="Ver e editar equipes"
          >
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden md:inline">Equipes</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative shrink-0"
            title="Notificações e Lembretes"
          >
            <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* User Profile Pill or Login */}
          {user && !user.modoAnonimo ? (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
              <button
                onClick={onOpenLogin}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-xs font-medium transition-all ${
                  turmaInfo
                    ? `${turmaInfo.bgCor} ${turmaInfo.borderCor} ${turmaInfo.textCor}`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${turmaInfo?.badgeCor || 'bg-slate-600'} text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0`}
                >
                  {user.turma}
                </div>
                <span className="font-semibold truncate max-w-[60px] xs:max-w-[90px] sm:max-w-[130px] text-[11px] sm:text-xs">
                  {user.nome || `Turma ${user.turma}`}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg sm:rounded-xl transition-colors shrink-0"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
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
