import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
  Palmtree,
  Sun,
  SunMedium,
  Moon,
  Coffee,
  Filter,
} from 'lucide-react';
import { TurmaId, UserProfile, Colaborador, FeriasPeriodo } from '../types';
import { TURNOS_CONFIG, TURMAS, COLABORADORES, getTurmas } from '../data/equipes';
import { getDaySchedule, formatDateBR } from '../utils/escala';
import { getFeriasForDate } from '../utils/ferias';

interface CalendarViewProps {
  currentDate: Date;
  selectedMonth: number;
  selectedYear: number;
  onChangeMonthYear: (month: number, year: number) => void;
  onSelectDay: (date: Date) => void;
  user: UserProfile | null;
  selectedTurmaFilter?: TurmaId | 'GERAL';
  onSelectTurmaFilter?: (turma: TurmaId | 'GERAL') => void;
  colaboradores?: Colaborador[];
  feriasList?: FeriasPeriodo[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  selectedMonth,
  selectedYear,
  onChangeMonthYear,
  onSelectDay,
  user,
  selectedTurmaFilter: controlledFilter,
  onSelectTurmaFilter: controlledOnSelectFilter,
  colaboradores = COLABORADORES,
  feriasList = [],
}) => {
  const [internalTurmaFilter, setInternalTurmaFilter] = React.useState<TurmaId | 'GERAL'>('GERAL');
  const turmasMap = getTurmas(colaboradores);

  const selectedTurmaFilter = controlledFilter !== undefined ? controlledFilter : internalTurmaFilter;

  const handleTurmaFilterChange = (t: TurmaId | 'GERAL') => {
    if (controlledOnSelectFilter) {
      controlledOnSelectFilter(t);
    } else {
      setInternalTurmaFilter(t);
    }
  };

  const today = new Date();

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onChangeMonthYear(11, selectedYear - 1);
    } else {
      onChangeMonthYear(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onChangeMonthYear(0, selectedYear + 1);
    } else {
      onChangeMonthYear(selectedMonth + 1, selectedYear);
    }
  };

  const handleTodayReset = () => {
    onChangeMonthYear(today.getMonth(), today.getFullYear());
  };

  const monthOptions = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const currentMonthName = monthOptions[selectedMonth];

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const activeTurmaId: TurmaId =
    selectedTurmaFilter === 'GERAL' ? user?.turma || 'A' : selectedTurmaFilter;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Sleek Minimalist Toolbar */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Month, Year & Today Reset Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white capitalize tracking-tight">
              {currentMonthName} <span className="font-semibold text-slate-400 dark:text-slate-500">{selectedYear}</span>
            </h2>
            {(selectedMonth !== today.getMonth() || selectedYear !== today.getFullYear()) && (
              <button
                onClick={handleTodayReset}
                className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-bold transition-all border border-blue-200 dark:border-blue-800 flex items-center gap-1 active:scale-95"
                title="Voltar para o mês atual"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Hoje</span>
              </button>
            )}
          </div>

          {/* Stepper buttons (prev/next) */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => onChangeMonthYear(Number(e.target.value), selectedYear)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 px-1.5 py-1 rounded focus:outline-none cursor-pointer"
            >
              {monthOptions.map((m, idx) => (
                <option key={m} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">
                  {m.slice(0, 3)}
                </option>
              ))}
            </select>

            {/* Quick Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => onChangeMonthYear(selectedMonth, Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 px-1 py-1 rounded focus:outline-none cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend / Helper Info */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Manhã (06h)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Tarde (14h)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Noite (22h)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Folga
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="p-2 sm:p-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center mb-1.5 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] sm:text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          <div className="text-red-500/90 font-bold">Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div className="text-emerald-600/90 dark:text-emerald-400/90 font-bold">Sáb</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {/* Previous month filler */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => {
            const dayNum = daysInPrevMonth - startingDayOfWeek + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[70px] sm:min-h-[110px] lg:min-h-[130px] p-1.5 rounded-xl bg-slate-50/40 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 pointer-events-none select-none text-xs"
              >
                <span>{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const date = new Date(selectedYear, selectedMonth, dayNum);
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();

            const schedule = getDaySchedule(date);
            const dateVacations = getFeriasForDate(date, feriasList);

            // Single turma filter variables
            const shiftForFilter = schedule.shiftsByTurma[activeTurmaId];
            const isFilterFolga = shiftForFilter?.turno === 'FOLGA';
            const filterConfig = shiftForFilter ? TURNOS_CONFIG[shiftForFilter.turno] : null;

            return (
              <div
                key={dayNum}
                onClick={() => onSelectDay(date)}
                className={`min-h-[76px] sm:min-h-[114px] lg:min-h-[132px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group select-none ${
                  isToday
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                {/* 1. Cell Top Bar: Day Number + Status Flags */}
                <div className="flex items-center justify-between leading-none">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-extrabold transition-colors ${
                        isToday
                          ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] sm:text-xs shadow-2xs font-black'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline-block text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/50 px-1 py-0.2 rounded">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Right side: Vacation Icon or Filter Pill */}
                  <div className="flex items-center gap-1">
                    {dateVacations.length > 0 && (
                      <span
                        className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 px-1 py-0.2 rounded text-[9px] font-bold"
                        title={`${dateVacations.length} colaborador(es) em férias:\n${dateVacations.map(v => `${v.colaboradorNome} (Cob: ${v.coberturaColaboradorNome})`).join('\n')}`}
                      >
                        <Palmtree className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">{dateVacations.length}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Cell Body: Structured Shift Lines (Intuitive Layout) */}
                {selectedTurmaFilter === 'GERAL' ? (
                  /* ============================================================== */
                  /* VISÃO GERAL: Linhas de Tempo Fixas com Badges das 4 Turmas   */
                  /* ============================================================== */
                  <div className="mt-1 flex-1 flex flex-col justify-end space-y-1 sm:space-y-1">
                    {/* Linha 1: MANHÃ (06h - 14h) */}
                    <div className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded-md bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 leading-tight">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-sky-900 dark:text-sky-200 tracking-tight">
                          <span className="hidden sm:inline">06h-14h</span>
                          <span className="sm:hidden">06h</span>
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black shrink-0 ${TURMAS[schedule.turmaByTurno.MANHA].badgeCor}`}>
                        {schedule.turmaByTurno.MANHA}
                      </span>
                    </div>

                    {/* Linha 2: TARDE (14h - 22h) */}
                    <div className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded-md bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 leading-tight">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 dark:text-amber-200 tracking-tight">
                          <span className="hidden sm:inline">14h-22h</span>
                          <span className="sm:hidden">14h</span>
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black shrink-0 ${TURMAS[schedule.turmaByTurno.TARDE].badgeCor}`}>
                        {schedule.turmaByTurno.TARDE}
                      </span>
                    </div>

                    {/* Linha 3: NOITE (22h - 06h) */}
                    <div className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded-md bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 leading-tight">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-indigo-900 dark:text-indigo-200 tracking-tight">
                          <span className="hidden sm:inline">22h-06h</span>
                          <span className="sm:hidden">22h</span>
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black shrink-0 ${TURMAS[schedule.turmaByTurno.NOITE].badgeCor}`}>
                        {schedule.turmaByTurno.NOITE}
                      </span>
                    </div>

                    {/* Linha 4: FOLGA (Discreta e Suave) */}
                    <div className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 leading-tight">
                      <span className="text-[8.5px] sm:text-[9.5px] font-bold">
                        <span className="hidden sm:inline">Folga:</span>
                        <span className="sm:hidden">FLG</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        {schedule.turmaByTurno.FOLGA}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* ============================================================== */
                  /* MODO TURMA ESPECÍFICA: Foco total no status da turma indicada   */
                  /* ============================================================== */
                  <div className="mt-1 flex-1 flex flex-col justify-end space-y-1">
                    <div
                      className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all ${
                        isFilterFolga
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                          : `${filterConfig?.corBg} ${filterConfig?.corBorder} ${filterConfig?.corText}`
                      }`}
                    >
                      <div className="text-[10px] sm:text-xs font-black leading-tight flex items-center justify-center gap-1">
                        <span>{filterConfig?.emoji}</span>
                        <span>{isFilterFolga ? 'FOLGA' : filterConfig?.nome.toUpperCase()}</span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold opacity-85 mt-0.5 hidden sm:block">
                        {isFilterFolga ? 'Descanso do Turno' : filterConfig?.horario}
                      </div>
                    </div>

                    {/* Quick indicator of colleagues also on shift */}
                    <div className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-medium truncate hidden lg:block">
                      {isFilterFolga ? 'Turma em folga 6x2' : `Turma ${activeTurmaId} no posto`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
