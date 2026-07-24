import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sun,
  SunMedium,
  Moon,
  Coffee,
  RotateCcw,
  Eye,
  Filter,
  Check,
} from 'lucide-react';
import { TurmaId, UserProfile, Turno } from '../types';
import { TURNOS_CONFIG, TURMAS } from '../data/equipes';
import { getDaySchedule, getShiftFromCycleIndex, getCycleIndex } from '../utils/escala';

interface CalendarViewProps {
  currentDate: Date;
  selectedMonth: number;
  selectedYear: number;
  onChangeMonthYear: (month: number, year: number) => void;
  onSelectDay: (date: Date) => void;
  user: UserProfile | null;
  selectedTurmaFilter?: TurmaId | 'GERAL';
  onSelectTurmaFilter?: (turma: TurmaId | 'GERAL') => void;
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
}) => {
  const [internalTurmaFilter, setInternalTurmaFilter] = useState<TurmaId | 'GERAL'>('GERAL');

  const selectedTurmaFilter = controlledFilter !== undefined ? controlledFilter : internalTurmaFilter;

  const handleTurmaFilterChange = (t: TurmaId | 'GERAL') => {
    if (controlledOnSelectFilter) {
      controlledOnSelectFilter(t);
    } else {
      setInternalTurmaFilter(t);
    }
  };

  const today = new Date();
  const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(selectedYear, selectedMonth, 1)
  );

  // Month navigation helpers
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

  // Generate Year options: 1 year past to 1 year future (relative to today's year: e.g. 2025, 2026, 2027)
  const baseYear = today.getFullYear();
  const yearOptions = [baseYear - 1, baseYear, baseYear + 1];

  const monthOptions = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  // Active turma to highlight in SINGLE_TURMA mode
  const activeTurmaId: TurmaId =
    selectedTurmaFilter === 'GERAL' ? user?.turma || 'A' : selectedTurmaFilter;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Month & Year Navigation Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Month Title & Fast Reset */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 capitalize leading-tight">
              {currentMonthName} {selectedYear}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Escala de trabalho 6x2 (4 Turmas)
            </p>
          </div>

          {(selectedMonth !== today.getMonth() || selectedYear !== today.getFullYear()) && (
            <button
              onClick={handleTodayReset}
              className="ml-2 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hoje</span>
            </button>
          )}
        </div>

        {/* Controls: Prev/Next & Selectors */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => onChangeMonthYear(Number(e.target.value), selectedYear)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
            >
              {monthOptions.map((m, idx) => (
                <option key={m} value={idx} className="bg-white dark:bg-slate-900">
                  {m}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => onChangeMonthYear(selectedMonth, Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & View Mode Bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Turma filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Exibir:
          </span>

          <button
            onClick={() => handleTurmaFilterChange('GERAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border ${
              selectedTurmaFilter === 'GERAL'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Visão Geral (4 Turmas)
          </button>

          {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
            const isSelected = selectedTurmaFilter === tId;
            const tInfo = TURMAS[tId];

            return (
              <button
                key={tId}
                onClick={() => handleTurmaFilterChange(tId)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border ${
                  isSelected
                    ? `${tInfo.badgeCor} border-transparent shadow-xs`
                    : `${tInfo.bgCor} ${tInfo.textCor} ${tInfo.borderCor} hover:opacity-90`
                }`}
              >
                Turma {tId}
                {user?.turma === tId && (
                  <span className="ml-1 text-[9px] bg-white/30 px-1 rounded">Você</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Manhã
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Tarde
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Noite
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Folga
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-1.5 sm:p-4">
        {/* Days of week Header */}
        <div className="grid grid-cols-7 text-center mb-1 text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <div className="py-0.5 sm:py-1 text-red-500/80">Dom</div>
          <div className="py-0.5 sm:py-1">Seg</div>
          <div className="py-0.5 sm:py-1">Ter</div>
          <div className="py-0.5 sm:py-1">Qua</div>
          <div className="py-0.5 sm:py-1">Qui</div>
          <div className="py-0.5 sm:py-1">Sex</div>
          <div className="py-0.5 sm:py-1 text-emerald-600/80">Sáb</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5">
          {/* Previous month filler cells */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => {
            const dayNum = daysInPrevMonth - startingDayOfWeek + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[56px] sm:min-h-[85px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-50/40 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 pointer-events-none select-none text-[10px] sm:text-[11px]"
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

            return (
              <div
                key={dayNum}
                onClick={() => onSelectDay(date)}
                className={`min-h-[58px] sm:min-h-[90px] lg:min-h-[120px] xl:min-h-[135px] p-1 sm:p-1.5 lg:p-2 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isToday
                    ? 'border-blue-500 dark:border-blue-500 ring-1 sm:ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Cell Header: Day Number */}
                <div className="flex items-center justify-between leading-none">
                  <span
                    className={`text-[10px] sm:text-xs lg:text-sm font-bold ${
                      isToday
                        ? 'w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] sm:text-[11px] lg:text-xs shadow-xs'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {isToday && (
                    <span className="text-[7.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-tight hidden sm:inline bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                      Hoje
                    </span>
                  )}
                </div>

                {/* Content depending on viewMode */}
                {selectedTurmaFilter !== 'GERAL' ? (
                  /* SINGLE TURMA MODE */
                  (() => {
                    const shift = schedule.shiftsByTurma[activeTurmaId];
                    const isFolga = shift.turno === 'FOLGA';
                    const config = TURNOS_CONFIG[shift.turno];

                    return (
                      <div className="mt-0.5 sm:mt-1 flex-1 flex flex-col justify-end">
                        <div
                          className={`p-0.5 sm:p-1.5 lg:p-2 rounded-md sm:rounded-lg lg:rounded-xl border text-center transition-transform group-hover:scale-[1.02] ${
                            isFolga
                              ? 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-extrabold shadow-2xs'
                              : `${config.corBg} ${config.corBorder} ${config.corText}`
                          }`}
                        >
                          <div className="text-[8.5px] sm:text-[11px] lg:text-xs font-black leading-tight flex items-center justify-center gap-0.5 sm:gap-1.5 truncate">
                            <span className="text-[9px] sm:text-xs lg:text-sm shrink-0">{config.emoji}</span>
                            <span className="truncate">{isFolga ? 'FOLGA' : `TURNO ${config.nome.toUpperCase()}`}</span>
                          </div>
                          <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold opacity-80 mt-0.5 truncate hidden sm:block">
                            {isFolga ? 'Descanso' : config.horario.split(' ')[0]}
                          </div>
                          {/* Desktop extended detail */}
                          <div className="hidden lg:block text-[9px] font-semibold opacity-70 mt-0.5">
                            {isFolga ? '2 dias de folga' : '8h48m / dia'}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* VISÃO GERAL (All 4 Turmas Badges) */
                  <div className="mt-0.5 sm:mt-1 flex-1 flex flex-col justify-end">
                    {/* Shift Badges for Manhã, Tarde, Noite, Folga */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-[2px] sm:gap-1 lg:gap-1 text-[8px] sm:text-[9px] font-bold">
                      {/* Manhã */}
                      <div className="bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded px-0.5 sm:px-1 lg:px-1.5 py-0.5 border border-sky-100 dark:border-sky-900/50 flex items-center justify-between min-w-0 leading-none">
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-75 font-semibold shrink-0">
                          <span className="lg:hidden">M:</span>
                          <span className="hidden lg:inline">☀️ Manhã:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.MANHA}
                        </span>
                      </div>
                      {/* Tarde */}
                      <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded px-0.5 sm:px-1 lg:px-1.5 py-0.5 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between min-w-0 leading-none">
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-75 font-semibold shrink-0">
                          <span className="lg:hidden">T:</span>
                          <span className="hidden lg:inline">🌤️ Tarde:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.TARDE}
                        </span>
                      </div>
                      {/* Noite */}
                      <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 rounded px-0.5 sm:px-1 lg:px-1.5 py-0.5 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between min-w-0 leading-none">
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-75 font-semibold shrink-0">
                          <span className="lg:hidden">N:</span>
                          <span className="hidden lg:inline">🌙 Noite:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.NOITE}
                        </span>
                      </div>
                      {/* Folga */}
                      <div className="bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 rounded px-0.5 sm:px-1 lg:px-1.5 py-0.5 border border-emerald-300 dark:border-emerald-700/60 font-extrabold flex items-center justify-between min-w-0 leading-none shadow-2xs">
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-75 font-semibold shrink-0">
                          <span className="lg:hidden">F:</span>
                          <span className="hidden lg:inline">☕ Folga:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.FOLGA}
                        </span>
                      </div>
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
