import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LoginModal } from './components/LoginModal';
import { PersonalCard } from './components/PersonalCard';
import { CalendarView } from './components/CalendarView';
import { DayDetailsModal } from './components/DayDetailsModal';
import { TeamRosterModal } from './components/TeamRosterModal';
import { VacationManagementModal } from './components/VacationManagementModal';
import { NotificationSettings } from './components/NotificationSettings';
import { TodayShiftSummary } from './components/TodayShiftSummary';
import { InstallPWAModal } from './components/InstallPWAModal';
import { Colaborador, UserProfile, TurmaId, FeriasPeriodo } from './types';
import { COLABORADORES } from './data/equipes';
import { checkAndSendScheduledNotifications } from './utils/notifications';
import { getSavedFerias, saveFeriasToStorage, updateFeriasListStatus } from './utils/ferias';

export default function App() {
  const today = new Date();

  // Selected Month and Year for Calendar View (defaults to current month/year)
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  // Active Turma Filter (defaults to 'GERAL' for 4 Turmas view on startup)
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<TurmaId | 'GERAL'>('GERAL');

  // Sidebar Expand State (Desktop) & Mobile Drawer State
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('escala_6x2_sidebar_expanded');
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true; // default expanded on desktop
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      const nextVal = !prev;
      try {
        localStorage.setItem('escala_6x2_sidebar_expanded', String(nextVal));
      } catch {
        // ignore
      }
      return nextVal;
    });
  };

  const handleSelectTurmaFilter = (turma: TurmaId | 'GERAL') => {
    setSelectedTurmaFilter(turma);
    const calEl = document.getElementById('calendar-section');
    if (calEl) {
      calEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Editable collaborators state with localStorage persistence
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => {
    try {
      const saved = localStorage.getItem('escala_6x2_colaboradores');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return COLABORADORES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('escala_6x2_colaboradores', JSON.stringify(colaboradores));
    } catch {
      // ignore
    }
  }, [colaboradores]);

  const handleUpdateColaborador = (updated: Colaborador) => {
    setColaboradores((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    if (user && (user.colaboradorId === updated.id || (!user.colaboradorId && user.nome === updated.nome))) {
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              colaboradorId: updated.id,
              nome: updated.nome,
              cargo: updated.cargo,
              turma: updated.turma,
            }
          : null
      );
    }
  };

  const handleAddColaborador = (newColabData: Omit<Colaborador, 'id'>) => {
    const newColab: Colaborador = {
      ...newColabData,
      id: `colab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setColaboradores((prev) => [...prev, newColab]);
  };

  const handleDeleteColaborador = (id: string) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
    if (user && user.colaboradorId === id) {
      setUser(null);
    }
  };

  const handleResetColaboradores = () => {
    setColaboradores(COLABORADORES);
  };

  // Keep logged in user state synchronized with colaboradores
  useEffect(() => {
    if (user && user.colaboradorId) {
      const found = colaboradores.find((c) => c.id === user.colaboradorId);
      if (found) {
        if (
          user.nome !== found.nome ||
          user.cargo !== found.cargo ||
          user.turma !== found.turma
        ) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  nome: found.nome,
                  cargo: found.cargo,
                  turma: found.turma,
                }
              : null
          );
        }
      }
    }
  }, [colaboradores]);

  // Dark Mode Theme state (persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('escala_6x2_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
    } catch {
      // fallback
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    try {
      localStorage.setItem('escala_6x2_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('escala_6x2_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  // Modal States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [selectedDateModal, setSelectedDateModal] = useState<Date | null>(null);

  // Vacations (Férias) state persisted in localStorage
  const [feriasList, setFeriasList] = useState<FeriasPeriodo[]>(() => {
    const saved = getSavedFerias();
    return updateFeriasListStatus(saved);
  });

  const handleSaveFerias = (newList: FeriasPeriodo[]) => {
    const updated = updateFeriasListStatus(newList);
    setFeriasList(updated);
    saveFeriasToStorage(updated);
  };

  const activeVacationsCount = feriasList.filter(
    (f) => f.status === 'EM_ANDAMENTO' || f.status === 'AGENDADA'
  ).length;

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('escala_6x2_user', JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem('escala_6x2_user');
    }

    checkAndSendScheduledNotifications(user);
  }, [user]);

  const handleSelectUser = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleChangeMonthYear = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Expandable Sidebar (Desktop) + Slide-in Drawer (Mobile) */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggleExpand={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenTeams={() => setIsTeamsOpen(true)}
        onOpenVacations={() => setIsVacationModalOpen(true)}
        activeVacationsCount={activeVacationsCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        selectedTurmaFilter={selectedTurmaFilter}
        onSelectTurmaFilter={handleSelectTurmaFilter}
      />

      {/* Main Content Area (Adjusts margin according to sidebar width) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-18'
        }`}
      >
        {/* Sleek Top Navigation */}
        <TopNav
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          user={user}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenVacations={() => setIsVacationModalOpen(true)}
          activeVacationsCount={activeVacationsCount}
          selectedTurmaFilter={selectedTurmaFilter}
          onSelectTurmaFilter={handleSelectTurmaFilter}
        />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Primary Centerpiece: High-readability Calendar */}
            <div id="calendar-section" className="xl:col-span-8 2xl:col-span-9 scroll-mt-20">
              <CalendarView
                currentDate={today}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChangeMonthYear={handleChangeMonthYear}
                onSelectDay={(date) => setSelectedDateModal(date)}
                user={user}
                selectedTurmaFilter={selectedTurmaFilter}
                onSelectTurmaFilter={handleSelectTurmaFilter}
                colaboradores={colaboradores}
                feriasList={feriasList}
              />
            </div>

            {/* Side Panel: Contextual Personal Card + Today's Summary */}
            <div className="xl:col-span-4 2xl:col-span-3 space-y-5 xl:sticky xl:top-20 xl:self-start">
              {/* Personal Card (or guest invitation) */}
              {user ? (
                <PersonalCard
                  user={user}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onOpenLogin={() => setIsLoginOpen(true)}
                  onOpenNotifications={() => setIsNotificationOpen(true)}
                  onOpenVacations={() => setIsVacationModalOpen(true)}
                  colaboradores={colaboradores}
                  feriasList={feriasList}
                />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Selecione seu Perfil
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Identifique sua turma e operador para receber lembretes dos seus turnos, ver próximas folgas e exportar para seu calendário pessoal.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 text-center"
                  >
                    Identificar Colaborador
                  </button>
                </div>
              )}

              {/* Today's Shifts across the 4 Turmas */}
              <TodayShiftSummary
                colaboradores={colaboradores}
                onSelectTurmaFilter={handleSelectTurmaFilter}
              />
            </div>
          </div>
        </main>

        {/* Minimalist Subdued Footer */}
        <footer className="py-5 px-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Escala 6x2 • Sistema de Gestão Operacional de Turnos
          </p>
          <p className="text-[11px] mt-0.5 text-slate-400 dark:text-slate-500">
            Manhã (06h - 14h) • Tarde (14h - 22h) • Noite (22h - 06h) • Folga Contínua
          </p>
        </footer>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSelectUser={handleSelectUser}
        currentUser={user}
        colaboradores={colaboradores}
      />

      <DayDetailsModal
        selectedDate={selectedDateModal}
        onClose={() => setSelectedDateModal(null)}
        user={user}
        colaboradores={colaboradores}
        feriasList={feriasList}
      />

      <TeamRosterModal
        isOpen={isTeamsOpen}
        onClose={() => setIsTeamsOpen(false)}
        colaboradores={colaboradores}
        onUpdateColaborador={handleUpdateColaborador}
        onAddColaborador={handleAddColaborador}
        onDeleteColaborador={handleDeleteColaborador}
        onResetColaboradores={handleResetColaboradores}
      />

      <VacationManagementModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        colaboradores={colaboradores}
        feriasList={feriasList}
        onSaveFerias={handleSaveFerias}
        initialColaboradorId={user?.colaboradorId}
      />

      <NotificationSettings
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        user={user}
      />

      <InstallPWAModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
