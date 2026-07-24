import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { PersonalCard } from './components/PersonalCard';
import { CalendarView } from './components/CalendarView';
import { DayDetailsModal } from './components/DayDetailsModal';
import { TeamRosterModal } from './components/TeamRosterModal';
import { NotificationSettings } from './components/NotificationSettings';
import { TodayShiftSummary } from './components/TodayShiftSummary';
import { InstallPWAModal } from './components/InstallPWAModal';
import { Colaborador, UserProfile, TurmaId } from './types';
import { COLABORADORES } from './data/equipes';
import { checkAndSendScheduledNotifications } from './utils/notifications';

export default function App() {
  const today = new Date();

  // Selected Month and Year for Calendar View (defaults to current month/year)
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  // Active Turma Filter (defaults to 'GERAL' for 4 Turmas view on startup)
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<TurmaId | 'GERAL'>('GERAL');

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
    // If the currently logged-in user is this collaborator, update their profile state
    if (user && user.colaboradorId === updated.id) {
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
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
  };

  const handleResetColaboradores = () => {
    setColaboradores(COLABORADORES);
  };

  // Dark Mode Theme state (persisted in localStorage, default to dark or user pref)
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
  const [selectedDateModal, setSelectedDateModal] = useState<Date | null>(null);

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

    // Automatically check and send daily scheduled notifications if due
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white pb-12">
      {/* Top Navigation Bar */}
      <Header
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenTeams={() => setIsTeamsOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-4xl lg:max-w-7xl 2xl:max-w-[1500px] w-full mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 flex-1">
        {/* Responsive Grid Layout for PC (lg:) vs Stack for Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Main Column: Prominent Calendar View FIRST */}
          <div id="calendar-section" className="lg:col-span-8 xl:col-span-9 scroll-mt-20">
            <CalendarView
              currentDate={today}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onChangeMonthYear={handleChangeMonthYear}
              onSelectDay={(date) => setSelectedDateModal(date)}
              user={user}
              selectedTurmaFilter={selectedTurmaFilter}
              onSelectTurmaFilter={handleSelectTurmaFilter}
            />
          </div>

          {/* Right Column / Sidebar on Desktop */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 sm:space-y-6 lg:sticky lg:top-20 lg:self-start">
            {/* Personal Card (if logged in) */}
            {user ? (
              <PersonalCard
                user={user}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onOpenLogin={() => setIsLoginOpen(true)}
                onOpenNotifications={() => setIsNotificationOpen(true)}
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">Bem-vindo à Escala 6x2</h2>
                  <p className="text-xs text-blue-100 mt-1">
                    Consulte a escala mensal de trabalho das 4 turmas (A, B, C e D) ou selecione seu perfil para ver seus horários individuais.
                  </p>
                </div>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-xs shadow-xs hover:bg-blue-50 transition-colors w-full text-center"
                >
                  Selecionar Meu Perfil
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

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Sistema de Consulta de Escala de Trabalho 6x2
        </p>
        <p className="text-[11px] mt-1 text-slate-400">
          Turnos: Manhã (06:00-14:18) • Tarde (14:15-22:30) • Noite (22:30-06:00) • Folga
        </p>
      </footer>

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
