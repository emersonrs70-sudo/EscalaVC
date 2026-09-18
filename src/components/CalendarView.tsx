import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Palmtree,
  Filter,
  List,
  Grid3X3,
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
  const [internalTurmaFilter, setInternalTurmaFilter] = useState<TurmaId | 'GERAL'>('GERAL');
  const [mobileDisplayMode, setMobileDisplayMode] = useState<'grid' | 'list'>('grid');

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

  // Matriz do calendário
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Dom) - 6 (Sáb)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const activeTurmaId: TurmaId =
    selectedTurmaFilter === 'GERAL' ? user?.turma || 'A' : selectedTurmaFilter;

  const fullWeekDayNames = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* 1. Barra de Cabeçalho: Mês/Ano + Navegação */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/50">
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

        {/* Controles: Steppers e Alternador Grid/List no mobile */}
        <div className="flex items-center gap-2">
          {/* Alternador Mobile (Grade vs Lista) */}
          <div className="flex sm:hidden items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => setMobileDisplayMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                mobileDisplayMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Grade Mensal"
              aria-label="Grade Mensal"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileDisplayMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                mobileDisplayMode === 'list'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Lista Detalhada"
              aria-label="Lista Detalhada"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Steppers e Seletor Mês/Ano */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => onChangeMonthYear(Number(e.target.value), selectedYear)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 px-1 py-1 rounded focus:outline-none cursor-pointer"
            >
              {monthOptions.map((m, idx) => (
                <option key={m} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">
                  {m.slice(0, 3)}
                </option>
              ))}
            </select>

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
      </div>

      {/* 2. Barra de Filtro de Turma + Legenda dos 3 Horários */}
      <div className="px-3 sm:px-6 py-2 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Pílulas de Seleção de Turma */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-blue-500" />
            <span>Filtro:</span>
          </span>

          <button
            onClick={() => handleTurmaFilterChange('GERAL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              selectedTurmaFilter === 'GERAL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Visão Geral (3 Horários)
          </button>

          {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
            const isSelected = selectedTurmaFilter === tId;
            const tData = TURMAS[tId];
            return (
              <button
                key={tId}
                onClick={() => handleTurmaFilterChange(tId)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? `${tData.badgeCor} shadow-xs ring-1 ring-black/10`
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>Turma {tId}</span>
                {user?.turma === tId && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legenda Prática dos 3 Horários Operacionais + Folga */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-semibold overflow-x-auto">
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">06h</span>
            <span className="text-[10px] text-slate-400 hidden md:inline">(06-14h)</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">14h</span>
            <span className="text-[10px] text-slate-400 hidden md:inline">(14-22h)</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">22h</span>
            <span className="text-[10px] text-slate-400 hidden md:inline">(22-06h)</span>
          </span>
          <span className="flex items-center gap-1 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-0.5" />
            <span>Folga</span>
          </span>
        </div>
      </div>

      {/* 3. CORPO: Modo Lista (Mobile Opcional) ou Modo Grade Otimizada */}
      {mobileDisplayMode === 'list' ? (
        /* ============================================================== */
        /* MODO LISTA MOBILE                                              */
        /* ============================================================== */
        <div className="p-2.5 space-y-2 sm:hidden max-h-[70vh] overflow-y-auto">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const date = new Date(selectedYear, selectedMonth, dayNum);
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            const dayOfWeekIdx = date.getDay();
            const schedule = getDaySchedule(date);
            const dateVacations = getFeriasForDate(date, feriasList);

            const shiftForFilter = schedule.shiftsByTurma[activeTurmaId];
            const isFilterFolga = shiftForFilter?.turno === 'FOLGA';
            const filterConfig = shiftForFilter ? TURNOS_CONFIG[shiftForFilter.turno] : null;

            return (
              <div
                key={`list-${dayNum}`}
                onClick={() => onSelectDay(date)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isToday
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Cabeçalho do Dia */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : dayOfWeekIdx === 0
                          ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                          : dayOfWeekIdx === 6
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{fullWeekDayNames[dayOfWeekIdx]}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-600 text-white">
                            Hoje
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatDateBR(date)}
                      </div>
                    </div>
                  </div>

                  {dateVacations.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      <Palmtree className="w-3 h-3" />
                      <span>{dateVacations.length} Férias</span>
                    </span>
                  )}
                </div>

                {/* 3 Horários Claros + Turma de Folga */}
                {selectedTurmaFilter === 'GERAL' ? (
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {/* 06h */}
                    <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800">
                      <div className="text-[9.5px] font-extrabold text-sky-800 dark:text-sky-300">06h-14h</div>
                      <div className={`mt-1 py-0.5 rounded text-xs font-black ${TURMAS[schedule.turmaByTurno.MANHA].badgeCor}`}>
                        T-{schedule.turmaByTurno.MANHA}
                      </div>
                    </div>

                    {/* 14h */}
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                      <div className="text-[9.5px] font-extrabold text-amber-800 dark:text-amber-300">14h-22h</div>
                      <div className={`mt-1 py-0.5 rounded text-xs font-black ${TURMAS[schedule.turmaByTurno.TARDE].badgeCor}`}>
                        T-{schedule.turmaByTurno.TARDE}
                      </div>
                    </div>

                    {/* 22h */}
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                      <div className="text-[9.5px] font-extrabold text-indigo-800 dark:text-indigo-300">22h-06h</div>
                      <div className={`mt-1 py-0.5 rounded text-xs font-black ${TURMAS[schedule.turmaByTurno.NOITE].badgeCor}`}>
                        T-{schedule.turmaByTurno.NOITE}
                      </div>
                    </div>

                    {/* Folga */}
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
                      <div className="text-[9.5px] font-extrabold text-emerald-800 dark:text-emerald-300">Folga</div>
                      <div className="mt-1 py-0.5 rounded text-xs font-black bg-emerald-500 text-white">
                        T-{schedule.turmaByTurno.FOLGA}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isFilterFolga
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                        : `${filterConfig?.corBg} ${filterConfig?.corBorder} ${filterConfig?.corText}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{filterConfig?.emoji}</span>
                      <div>
                        <div className="text-xs font-black">
                          {isFilterFolga ? 'FOLGA CONTÍNUA' : `TURNO ${filterConfig?.nome.toUpperCase()}`}
                        </div>
                        <div className="text-[10px] opacity-80">
                          Turma {activeTurmaId}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-extrabold">
                      {isFilterFolga ? 'Descanso 6x2' : filterConfig?.horario}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ============================================================== */
        /* MODO GRADE: 3 HORÁRIOS CLAROS, RESUMIDOS E SEM POLUIÇÃO        */
        /* ============================================================== */
        <div className="p-1 sm:p-4">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 text-center mb-1 py-1 sm:py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            <div className="text-red-500 font-bold">Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">Sáb</div>
          </div>

          {/* Matriz dos Dias */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Dias do mês anterior */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - startingDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[64px] sm:min-h-[105px] lg:min-h-[118px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-50/40 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 pointer-events-none select-none text-[10px] sm:text-xs"
                >
                  <span>{dayNum}</span>
                </div>
              );
            })}

            {/* Dias do mês atual */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const date = new Date(selectedYear, selectedMonth, dayNum);
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              const schedule = getDaySchedule(date);
              const dateVacations = getFeriasForDate(date, feriasList);

              // Variáveis para filtro de turma única
              const shiftForFilter = schedule.shiftsByTurma[activeTurmaId];
              const isFilterFolga = shiftForFilter?.turno === 'FOLGA';
              const filterConfig = shiftForFilter ? TURNOS_CONFIG[shiftForFilter.turno] : null;

              return (
                <div
                  key={dayNum}
                  onClick={() => onSelectDay(date)}
                  className={`min-h-[64px] sm:min-h-[105px] lg:min-h-[118px] p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex flex-col justify-between group select-none ${
                    isToday
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/30 shadow-xs'
                      : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  {/* Topo da Célula: Número do Dia + Turma em Folga Evidenciada + Férias */}
                  <div className="flex items-center justify-between leading-none mb-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[11px] sm:text-sm font-black transition-colors ${
                          isToday
                            ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] sm:text-xs shadow-2xs'
                            : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {dateVacations.length > 0 && (
                        <span
                          className="text-amber-600 dark:text-amber-400"
                          title={`${dateVacations.length} em férias`}
                        >
                          <Palmtree className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </span>
                      )}
                    </div>

                    {/* Turma em Folga Evidenciada com Distinção Suave */}
                    {selectedTurmaFilter === 'GERAL' && (
                      <span
                        className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 leading-none"
                        title={`Turma ${schedule.turmaByTurno.FOLGA} de Folga`}
                      >
                        <span className="text-[7.5px] sm:text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">
                          <span className="xs:hidden">F:</span>
                          <span className="hidden xs:inline">Folga:</span>
                        </span>
                        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex items-center justify-center text-[8.5px] sm:text-[10px] font-black bg-emerald-500 text-white shadow-2xs">
                          {schedule.turmaByTurno.FOLGA}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Conteúdo: Os 3 Horários Operacionais Claros e Práticos */}
                  {selectedTurmaFilter === 'GERAL' ? (
                    <div className="space-y-0.5 sm:space-y-1">
                      {/* Horário 1: 06h (Manhã) */}
                      <div className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100/80 dark:border-sky-900/30 leading-none">
                        <span className="text-[8.5px] sm:text-[10px] font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          <span>06h</span>
                        </span>
                        <span
                          className={`w-4 h-3.5 sm:w-5 sm:h-4 rounded flex items-center justify-center text-[9px] sm:text-[10.5px] font-black shrink-0 ${TURMAS[schedule.turmaByTurno.MANHA].badgeCor}`}
                        >
                          {schedule.turmaByTurno.MANHA}
                        </span>
                      </div>

                      {/* Horário 2: 14h (Tarde) */}
                      <div className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/30 leading-none">
                        <span className="text-[8.5px] sm:text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>14h</span>
                        </span>
                        <span
                          className={`w-4 h-3.5 sm:w-5 sm:h-4 rounded flex items-center justify-center text-[9px] sm:text-[10.5px] font-black shrink-0 ${TURMAS[schedule.turmaByTurno.TARDE].badgeCor}`}
                        >
                          {schedule.turmaByTurno.TARDE}
                        </span>
                      </div>

                      {/* Horário 3: 22h (Noite) */}
                      <div className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/30 leading-none">
                        <span className="text-[8.5px] sm:text-[10px] font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>22h</span>
                        </span>
                        <span
                          className={`w-4 h-3.5 sm:w-5 sm:h-4 rounded flex items-center justify-center text-[9px] sm:text-[10.5px] font-black shrink-0 ${TURMAS[schedule.turmaByTurno.NOITE].badgeCor}`}
                        >
                          {schedule.turmaByTurno.NOITE}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* MODO TURMA ESPECÍFICA (A, B, C ou D): Direto e Limpo */
                    <div className="mt-1 flex-1 flex flex-col justify-end">
                      <div
                        className={`p-1 sm:p-2 rounded-md sm:rounded-xl border text-center transition-all ${
                          isFilterFolga
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : `${filterConfig?.corBg} ${filterConfig?.corBorder} ${filterConfig?.corText}`
                        }`}
                      >
                        <div className="text-[9.5px] sm:text-xs font-black leading-tight flex items-center justify-center gap-0.5">
                          <span className="hidden sm:inline">{filterConfig?.emoji}</span>
                          <span className="truncate">{isFilterFolga ? 'FOLGA' : filterConfig?.nome}</span>
                        </div>
                        <div className="text-[8.5px] sm:text-[10.5px] font-bold opacity-85 mt-0.5 leading-none">
                          {isFilterFolga ? 'Descanso' : filterConfig?.horario.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
