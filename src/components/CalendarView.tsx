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
  Palmtree,
} from 'lucide-react';
import { TurmaId, UserProfile, Turno, Colaborador, FeriasPeriodo } from '../types';
import { TURNOS_CONFIG, TURMAS, COLABORADORES, getTurmas } from '../data/equipes';
import { getDaySchedule, getShiftFromCycleIndex, getCycleIndex, formatDateBR } from '../utils/escala';
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
  const [internalTurmaFilter, setInternalTurmaFilter] = useState<TurmaId | 'GERAL'>('GERAL');

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
      {/* High Contrast Month & Year Navigation Header */}
      <div className="p-4 sm:p-5 border-b-2 border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 dark:bg-slate-850">
        {/* Month Title & Fast Reset */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-700/25 ring-1 ring-white/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-slate-950 dark:text-white capitalize leading-tight tracking-tight">
                {currentMonthName} {selectedYear}
              </h2>
              {(selectedMonth !== today.getMonth() || selectedYear !== today.getFullYear()) && (
                <button
                  onClick={handleTodayReset}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hoje</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              Escala de trabalho contínua 6x2 • 4 Turmas
            </p>
          </div>
        </div>

        {/* Controls: Prev/Next & Selectors */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-black transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => onChangeMonthYear(Number(e.target.value), selectedYear)}
              className="bg-transparent text-xs sm:text-sm font-black text-slate-900 dark:text-white px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
            >
              {monthOptions.map((m, idx) => (
                <option key={m} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                  {m}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => onChangeMonthYear(selectedMonth, Number(e.target.value))}
              className="bg-transparent text-xs sm:text-sm font-black text-slate-900 dark:text-white px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-black transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & View Mode Bar - High Contrast */}
      <div className="px-4 py-3 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Turma filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-slate-900 dark:text-slate-100 font-black mr-1 flex items-center gap-1 shrink-0 uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Exibir:
          </span>

          <button
            onClick={() => handleTurmaFilterChange('GERAL')}
            className={`px-3 py-1.5 rounded-xl font-black transition-all shrink-0 border-2 ${
              selectedTurmaFilter === 'GERAL'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
            }`}
          >
            Visão Geral (4 Turmas)
          </button>

          {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
            const isSelected = selectedTurmaFilter === tId;
            const tInfo = turmasMap[tId] || TURMAS[tId];

            return (
              <button
                key={tId}
                onClick={() => handleTurmaFilterChange(tId)}
                className={`px-3 py-1.5 rounded-xl font-black transition-all shrink-0 border-2 ${
                  isSelected
                    ? `${tInfo.badgeCor} border-transparent shadow-xs`
                    : `${tInfo.bgCor} ${tInfo.textCor} ${tInfo.borderCor} hover:opacity-90`
                }`}
                title={`Filtrar escala pela Turma ${tId} (${tInfo.colaboradores.length} integrantes)`}
              >
                Turma {tId}
                {user?.turma === tId && (
                  <span className="ml-1 text-[9px] bg-white/30 px-1 rounded font-bold">Você</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend with High Contrast */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-800 dark:text-slate-200 font-extrabold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 shadow-2xs" /> Manhã
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-2xs" /> Tarde
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-2xs" /> Noite
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs" /> Folga
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-1.5 sm:p-4">
        {/* Days of week Header - High Contrast Solid Bar */}
        <div className="grid grid-cols-7 text-center mb-2.5 p-1.5 sm:p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-black tracking-wider shadow-2xs">
          <div className="py-0.5 text-red-600 dark:text-red-400 font-black">DOM</div>
          <div className="py-0.5 text-slate-900 dark:text-slate-100 font-black">SEG</div>
          <div className="py-0.5 text-slate-900 dark:text-slate-100 font-black">TER</div>
          <div className="py-0.5 text-slate-900 dark:text-slate-100 font-black">QUA</div>
          <div className="py-0.5 text-slate-900 dark:text-slate-100 font-black">QUI</div>
          <div className="py-0.5 text-slate-900 dark:text-slate-100 font-black">SEX</div>
          <div className="py-0.5 text-emerald-700 dark:text-emerald-400 font-black">SÁB</div>
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
            const activeTurmaInfo = turmasMap[activeTurmaId] || TURMAS[activeTurmaId];

            // Vacation data for this day
            const dateVacations = getFeriasForDate(date, feriasList);
            const turmaVacations = dateVacations.filter((f) => f.colaboradorTurma === activeTurmaId);
            const turmaCovering = dateVacations.filter((f) => f.coberturaTurmaOrigem === activeTurmaId);

            // Member names tooltip for the day
            let dayTooltip = selectedTurmaFilter !== 'GERAL'
              ? `${formatDateBR(date)} • Turma ${activeTurmaId}: ${schedule.shiftsByTurma[activeTurmaId]?.turno === 'FOLGA' ? 'Folga / Descanso' : `Turno ${schedule.shiftsByTurma[activeTurmaId]?.nomeTurno} (${schedule.shiftsByTurma[activeTurmaId]?.horario})`}\nIntegrantes da Turma (${activeTurmaInfo.colaboradores.length}): ${activeTurmaInfo.colaboradores.map(c => c.nome).join(', ') || 'Nenhum'}`
              : `${formatDateBR(date)} - Clique para ver detalhes completos\n` +
                `☀️ Manhã: Turma ${schedule.turmaByTurno.MANHA} (${turmasMap[schedule.turmaByTurno.MANHA]?.colaboradores.map(c => c.nome).slice(0, 3).join(', ')}...)\n` +
                `🌤️ Tarde: Turma ${schedule.turmaByTurno.TARDE} (${turmasMap[schedule.turmaByTurno.TARDE]?.colaboradores.map(c => c.nome).slice(0, 3).join(', ')}...)\n` +
                `🌙 Noite: Turma ${schedule.turmaByTurno.NOITE} (${turmasMap[schedule.turmaByTurno.NOITE]?.colaboradores.map(c => c.nome).slice(0, 3).join(', ')}...)\n` +
                `☕ Folga: Turma ${schedule.turmaByTurno.FOLGA}`;

            if (dateVacations.length > 0) {
              dayTooltip += `\n\n🏖️ Férias e Cobertura (${dateVacations.length}):\n` +
                dateVacations.map(v => `• ${v.colaboradorNome} (T-${v.colaboradorTurma}) -> Coberto por ${v.coberturaColaboradorNome} (T-${v.coberturaTurmaOrigem})`).join('\n');
            }

            return (
              <div
                key={dayNum}
                onClick={() => onSelectDay(date)}
                title={dayTooltip}
                className={`min-h-[64px] sm:min-h-[96px] lg:min-h-[125px] xl:min-h-[140px] p-1 sm:p-1.5 lg:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isToday
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/30 bg-blue-50/50 dark:bg-blue-950/25 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Cell Header: Day Number */}
                <div className="flex items-center justify-between leading-none">
                  <span
                    className={`text-[11px] sm:text-xs lg:text-sm font-black ${
                      isToday
                        ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] sm:text-xs shadow-xs'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <div className="flex items-center gap-1">
                    {dateVacations.length > 0 && (
                      <span
                        className="text-amber-600 dark:text-amber-400"
                        title={`${dateVacations.length} colaborador(es) em período de férias`}
                      >
                        <Palmtree className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    )}

                    {isToday && (
                      <span className="text-[7.5px] sm:text-[9px] lg:text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-tight hidden sm:inline bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                        Hoje
                      </span>
                    )}
                  </div>
                </div>

                {/* Content depending on viewMode */}
                {selectedTurmaFilter !== 'GERAL' ? (
                  /* SINGLE TURMA MODE */
                  (() => {
                    const shift = schedule.shiftsByTurma[activeTurmaId];
                    const isFolga = shift.turno === 'FOLGA';
                    const config = TURNOS_CONFIG[shift.turno];

                    return (
                      <div className="mt-0.5 sm:mt-1 flex-1 flex flex-col justify-end space-y-1">
                        <div
                          className={`p-0.5 sm:p-1.5 lg:p-2 rounded-md sm:rounded-lg lg:rounded-xl border text-center transition-transform group-hover:scale-[1.02] ${
                            isFolga
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-black shadow-2xs'
                              : `${config.corBg} ${config.corBorder} ${config.corText}`
                          }`}
                        >
                          <div className="text-[8.5px] sm:text-[11px] lg:text-xs font-black leading-tight flex items-center justify-center gap-0.5 sm:gap-1.5 truncate">
                            <span className="text-[9px] sm:text-xs lg:text-sm shrink-0">{config.emoji}</span>
                            <span className="truncate">{isFolga ? 'FOLGA' : `TURNO ${config.nome.toUpperCase()}`}</span>
                          </div>
                          <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold opacity-85 mt-0.5 truncate hidden sm:block">
                            {isFolga ? 'Descanso' : config.horario.split(' ')[0]}
                          </div>
                          {/* Desktop extended detail */}
                          <div className="hidden lg:block text-[9px] font-semibold opacity-80 mt-0.5 truncate">
                            {isFolga ? '2 dias de folga' : `${activeTurmaInfo.colaboradores.length} integrantes`}
                          </div>
                        </div>

                        {/* Single Turma Vacation / Replacement Indicator */}
                        {turmaVacations.length > 0 && (
                          <div className="bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded px-1 py-0.5 text-[7.5px] sm:text-[8.5px] font-bold text-amber-900 dark:text-amber-200 truncate flex items-center gap-0.5">
                            <Palmtree className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            <span className="truncate">
                              Férias: {turmaVacations[0].colaboradorNome.split(' ')[0]}
                              {turmaVacations.length > 1 ? ` +${turmaVacations.length - 1}` : ''}
                            </span>
                          </div>
                        )}
                        {turmaCovering.length > 0 && turmaVacations.length === 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded px-1 py-0.5 text-[7.5px] sm:text-[8.5px] font-bold text-blue-900 dark:text-blue-200 truncate flex items-center gap-0.5">
                            <span className="truncate">
                              Cob: {turmaCovering[0].coberturaColaboradorNome.split(' ')[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* VISÃO GERAL (All 4 Turmas Badges) */
                  <div className="mt-0.5 sm:mt-1 flex-1 flex flex-col justify-end">
                    {/* Shift Badges for Manhã, Tarde, Noite, Folga */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-[2px] sm:gap-1 lg:gap-1 text-[8px] sm:text-[9px] font-bold">
                      {/* Manhã */}
                      <div
                        title={`Manhã: Turma ${schedule.turmaByTurno.MANHA} (${turmasMap[schedule.turmaByTurno.MANHA]?.colaboradores.map(c => c.nome).join(', ') || 'Nenhum integrante'})`}
                        className="bg-sky-50 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 rounded px-1 py-0.5 border border-sky-200 dark:border-sky-800 flex items-center justify-between min-w-0 leading-none"
                      >
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-80 font-bold shrink-0">
                          <span className="lg:hidden">M:</span>
                          <span className="hidden lg:inline">☀️ Manhã:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.MANHA}
                        </span>
                      </div>
                      {/* Tarde */}
                      <div
                        title={`Tarde: Turma ${schedule.turmaByTurno.TARDE} (${turmasMap[schedule.turmaByTurno.TARDE]?.colaboradores.map(c => c.nome).join(', ') || 'Nenhum integrante'})`}
                        className="bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 rounded px-1 py-0.5 border border-amber-200 dark:border-amber-800 flex items-center justify-between min-w-0 leading-none"
                      >
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-80 font-bold shrink-0">
                          <span className="lg:hidden">T:</span>
                          <span className="hidden lg:inline">🌤️ Tarde:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.TARDE}
                        </span>
                      </div>
                      {/* Noite */}
                      <div
                        title={`Noite: Turma ${schedule.turmaByTurno.NOITE} (${turmasMap[schedule.turmaByTurno.NOITE]?.colaboradores.map(c => c.nome).join(', ') || 'Nenhum integrante'})`}
                        className="bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 rounded px-1 py-0.5 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between min-w-0 leading-none"
                      >
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-80 font-bold shrink-0">
                          <span className="lg:hidden">N:</span>
                          <span className="hidden lg:inline">🌙 Noite:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.NOITE}
                        </span>
                      </div>
                      {/* Folga */}
                      <div
                        title={`Folga: Turma ${schedule.turmaByTurno.FOLGA} (${turmasMap[schedule.turmaByTurno.FOLGA]?.colaboradores.map(c => c.nome).join(', ') || 'Nenhum integrante'})`}
                        className="bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 rounded px-1 py-0.5 border border-emerald-300 dark:border-emerald-700 font-black flex items-center justify-between min-w-0 leading-none shadow-2xs"
                      >
                        <span className="text-[7px] sm:text-[8px] lg:text-[9px] opacity-80 font-bold shrink-0">
                          <span className="lg:hidden">F:</span>
                          <span className="hidden lg:inline">☕ Folga:</span>
                        </span>
                        <span className="font-black text-[8px] sm:text-[9.5px] lg:text-[10.5px] truncate">
                          Turma {schedule.turmaByTurno.FOLGA}
                        </span>
                      </div>
                    </div>

                    {/* Visão Geral Vacation Mini-badge if any */}
                    {dateVacations.length > 0 && (
                      <div className="mt-1 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded px-1 py-0.5 text-[7px] sm:text-[8px] font-extrabold text-amber-900 dark:text-amber-200 truncate flex items-center gap-0.5">
                        <Palmtree className="w-2 h-2 text-amber-600 shrink-0" />
                        <span className="truncate">
                          Férias: {dateVacations.map((v) => v.colaboradorNome.split(' ')[0]).join(', ')}
                        </span>
                      </div>
                    )}
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
