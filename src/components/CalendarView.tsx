import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Info,
  X,
  AlertCircle,
  Users,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Employee, Shift, ShiftType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getTeamShiftForDate } from '../utils/shiftHelper';

interface CalendarViewProps {
  employees: Employee[];
  shifts: Shift[];
  shiftTypes: ShiftType[];
  currentUser: Employee;
  onAddShift: (employeeId: string, date: string, shiftTypeId: string, notes?: string) => void;
  onRequestSwap: (requesterShiftId: string, targetShiftId: string | null, receiverId: string | null, message: string) => void;
}

export default function CalendarView({
  employees,
  shifts,
  shiftTypes,
  currentUser,
  onAddShift,
  onRequestSwap
}: CalendarViewProps) {
  // Predefined list of selectable periods from July 2025 to July 2027
  const periods = [
    { year: 2025, month: 6, label: 'Julho de 2025' },
    { year: 2025, month: 7, label: 'Agosto de 2025' },
    { year: 2025, month: 8, label: 'Setembro de 2025' },
    { year: 2025, month: 9, label: 'Outubro de 2025' },
    { year: 2025, month: 10, label: 'Novembro de 2025' },
    { year: 2025, month: 11, label: 'Dezembro de 2025' },
    { year: 2026, month: 0, label: 'Janeiro de 2026' },
    { year: 2026, month: 1, label: 'Fevereiro de 2026' },
    { year: 2026, month: 2, label: 'Março de 2026' },
    { year: 2026, month: 3, label: 'Abril de 2026' },
    { year: 2026, month: 4, label: 'Maio de 2026' },
    { year: 2026, month: 5, label: 'Junho de 2026' },
    { year: 2026, month: 6, label: 'Julho de 2026' },
    { year: 2026, month: 7, label: 'Agosto de 2026' },
    { year: 2026, month: 8, label: 'Setembro de 2026' },
    { year: 2026, month: 9, label: 'Outubro de 2026' },
    { year: 2026, month: 10, label: 'Novembro de 2026' },
    { year: 2026, month: 11, label: 'Dezembro de 2026' },
    { year: 2027, month: 0, label: 'Janeiro de 2027' },
    { year: 2027, month: 1, label: 'Fevereiro de 2027' },
    { year: 2027, month: 2, label: 'Março de 2027' },
    { year: 2027, month: 3, label: 'Abril de 2027' },
    { year: 2027, month: 4, label: 'Maio de 2027' },
    { year: 2027, month: 5, label: 'Junho de 2027' },
    { year: 2027, month: 6, label: 'Julho de 2027' },
  ];

  // Dynamic Real Date setup
  const realNow = new Date();
  const realYear = realNow.getFullYear();
  const realMonth = realNow.getMonth();
  const realDay = realNow.getDate();

  // Find period matching current real year and month
  const initialPeriodIdx = periods.findIndex(p => p.year === realYear && p.month === realMonth);
  const defaultPeriodIdx = initialPeriodIdx !== -1 ? initialPeriodIdx : 12;

  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(defaultPeriodIdx);

  const currentPeriod = periods[selectedPeriodIndex] || periods[0];
  const currentYear = currentPeriod.year;
  const currentMonthIndex = currentPeriod.month;

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthName = currentPeriod.label;
  
  // Filters state
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false); // Collapsed by default to give calendar priority
  
  // Interactive selected day (default to real current day)
  const [selectedDay, setSelectedDay] = useState<number>(realDay);

  // Floating screen state to show team members
  const [activeFloatingTeam, setActiveFloatingTeam] = useState<{ team: 'A' | 'B' | 'C' | 'D', shiftName: string, hours: string, day: number } | null>(null);

  const handlePeriodChange = (newPeriodIndex: number) => {
    setSelectedPeriodIndex(newPeriodIndex);
    const targetPeriod = periods[newPeriodIndex];
    const maxDays = new Date(targetPeriod.year, targetPeriod.month + 1, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(1);
    }
  };

  // Calendar generation
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // (0 = Sun, 1 = Mon, etc.)
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Total grid cells
  const totalCells = Math.ceil((daysInMonth + firstDayOfWeek) / 7) * 7;
  const calendarCells: (number | null)[] = [];

  for (let i = 0; i < totalCells; i++) {
    if (i < firstDayOfWeek || i >= firstDayOfWeek + daysInMonth) {
      calendarCells.push(null);
    } else {
      calendarCells.push(i - firstDayOfWeek + 1);
    }
  }

  // If a specific employee is selected, we automatically look at their team to show in cells
  const effectiveTeamFilter = selectedEmpFilter !== 'ALL'
    ? (employees.find(e => e.id === selectedEmpFilter)?.team || 'ALL')
    : selectedTeamFilter;

  // Helper to determine shift assignments for any given day
  const getShiftsForDay = (day: number) => {
    const dateStr = `${currentYear}-${(currentMonthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const teams: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    let manhaTeam: 'A' | 'B' | 'C' | 'D' | null = null;
    let tardeTeam: 'A' | 'B' | 'C' | 'D' | null = null;
    let noiteTeam: 'A' | 'B' | 'C' | 'D' | null = null;
    let folgaTeam: 'A' | 'B' | 'C' | 'D' | null = null;

    teams.forEach(t => {
      const shiftTypeId = getTeamShiftForDate(t, dateStr);
      if (shiftTypeId === 'sh-manha') manhaTeam = t;
      else if (shiftTypeId === 'sh-tarde') tardeTeam = t;
      else if (shiftTypeId === 'sh-noite') noiteTeam = t;
      else if (shiftTypeId === 'sh-folga') folgaTeam = t;
    });

    return { manhaTeam, tardeTeam, noiteTeam, folgaTeam };
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(prev => prev === day ? 0 : day);
  };

  // Get active assignment details for the currently selected day safely
  const activeSelectedDay = selectedDay || 21;
  const selectedDayDetails = getShiftsForDay(activeSelectedDay);

  // Group employee list for selected day details
  const getEmployeesForTeam = (team: 'A' | 'B' | 'C' | 'D' | null) => {
    if (!team) return [];
    return employees.filter(e => e.team === team && e.role !== 'ADMIN');
  };

  const activeManhaMembers = getEmployeesForTeam(selectedDayDetails.manhaTeam);
  const activeTardeMembers = getEmployeesForTeam(selectedDayDetails.tardeTeam);
  const activeNoiteMembers = getEmployeesForTeam(selectedDayDetails.noiteTeam);
  const activeFolgaMembers = getEmployeesForTeam(selectedDayDetails.folgaTeam);

  return (
    <div className="space-y-6">
      {/* Calendar Header with Controls */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex flex-wrap items-center gap-2">
                Escala Geral de Turnos 6x2
                <span className="relative inline-block">
                  <select
                    value={selectedPeriodIndex}
                    onChange={(e) => handlePeriodChange(parseInt(e.target.value))}
                    className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-3xs"
                  >
                    {periods.map((p, idx) => (
                      <option key={idx} value={idx}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </span>
              </h2>
              <p className="text-slate-400 text-xs">Simulação da escala contínua com visualização de turmas e horários vigentes</p>
            </div>
          </div>

          {/* Quick Stats Legend & Filter Toggle */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {shiftTypes.map(type => (
              <div key={type.id} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full inline-block ${type.id === 'sh-manha' ? 'bg-emerald-500' : type.id === 'sh-tarde' ? 'bg-sky-500' : type.id === 'sh-noite' ? 'bg-indigo-500' : 'bg-slate-400'}`}></span>
                <span className="text-slate-500 font-medium">{type.name}</span>
              </div>
            ))}

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all shadow-2xs border border-indigo-100/80 ml-auto"
            >
              <Filter size={14} className="text-indigo-600" />
              <span>Filtros</span>
              {(selectedTeamFilter !== 'ALL' || selectedEmpFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              )}
              {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

        </div>

        {/* Filters Section (Collapsible) */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Filtrar por Turma</label>
              <select
                value={selectedTeamFilter}
                onChange={(e) => {
                  setSelectedTeamFilter(e.target.value);
                  setSelectedEmpFilter('ALL');
                }}
                id="calendar-filter-team"
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all duration-150"
              >
                <option value="ALL">Todas as Turmas (A, B, C, D)</option>
                <option value="A">Turma A</option>
                <option value="B">Turma B</option>
                <option value="C">Turma C</option>
                <option value="D">Turma D</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Filtrar por Colaborador</label>
              <select
                value={selectedEmpFilter}
                onChange={(e) => {
                  setSelectedEmpFilter(e.target.value);
                  setSelectedTeamFilter('ALL');
                }}
                id="calendar-filter-emp"
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all duration-150"
              >
                <option value="ALL">Todos os Colaboradores</option>
                {employees.filter(e => e.role !== 'ADMIN').map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.position} - Turma {emp.team})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => { setSelectedTeamFilter('ALL'); setSelectedEmpFilter('ALL'); }}
                id="calendar-btn-clear"
                className="w-full sm:w-auto px-4 py-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div className="w-full">
        
        {/* Monthly Calendar Board */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 overflow-x-auto hover:shadow-md transition-all duration-200">
          <div className="min-w-[280px] sm:min-w-[600px]">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
              {weekdays.map(day => (
                <div key={day} className="text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid with Dense Flow */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-2 relative">
              {/* Overlay click catcher to close popover when clicking anywhere else */}
              {selectedDay !== 0 && (
                <div 
                  className="fixed inset-0 z-30 cursor-default bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDay(0);
                  }}
                />
              )}

              {calendarCells.map((day, cellIndex) => {
                if (day === null) {
                  return (
                    <div 
                      key={`empty-${cellIndex}`} 
                      className="bg-slate-50/30 rounded-xl h-20 md:h-[125px] border border-dashed border-slate-100"
                    />
                  );
                }

                const { manhaTeam, tardeTeam, noiteTeam, folgaTeam } = getShiftsForDay(day);
                const isToday = currentYear === realYear && currentMonthIndex === realMonth && day === realDay;
                const isSelected = selectedDay === day;

                // Check if we should display based on team filter
                const showManha = effectiveTeamFilter === 'ALL' || effectiveTeamFilter === manhaTeam;
                const showTarde = effectiveTeamFilter === 'ALL' || effectiveTeamFilter === tardeTeam;
                const showNoite = effectiveTeamFilter === 'ALL' || effectiveTeamFilter === noiteTeam;
                const showFolga = effectiveTeamFilter === 'ALL' || effectiveTeamFilter === folgaTeam;

                const isFirstColumn = cellIndex % 7 === 0;
                const isLastColumn = cellIndex % 7 === 6;

                // Adjust popover position depending on column to prevent edge clipping
                const popoverPositionClass = isFirstColumn 
                  ? "absolute -top-12 -left-2 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-4 z-40 w-[240px] md:w-[280px] flex flex-col justify-between"
                  : isLastColumn
                    ? "absolute -top-12 -right-2 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-4 z-40 w-[240px] md:w-[280px] flex flex-col justify-between"
                    : "absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-4 z-40 w-[240px] md:w-[280px] flex flex-col justify-between";

                return (
                  <div
                    key={`day-${day}`}
                    id={`calendar-day-${day}`}
                    className="relative col-span-1"
                  >
                    {/* Base Normal Card */}
                    <div
                      onClick={() => handleDayClick(day)}
                      className={`rounded-xl border flex flex-col h-20 md:h-[125px] p-1.5 md:p-2 justify-between transition-all duration-300 cursor-pointer select-none ${
                        isToday
                          ? 'bg-indigo-50/10 border-indigo-500 ring-2 ring-indigo-500/15 shadow-xs'
                          : 'bg-white border-slate-150 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] md:text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                          isToday ? 'bg-rose-500 text-white font-extrabold' : 'text-slate-700'
                        }`}>
                          {day}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping absolute top-2 right-2"></span>
                        )}
                      </div>

                      {/* Compact Indicators */}
                      <div className="flex-1 flex flex-col justify-end gap-1 mt-1 overflow-hidden">
                        {/* Compact display on desktop */}
                        <div className="hidden sm:flex flex-col gap-1">
                          {showManha && (
                            <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50 text-[9px] text-emerald-800 border border-emerald-100/50 font-medium">
                              <span className="font-bold">M</span>
                              <span>Turma {manhaTeam}</span>
                            </div>
                          )}
                          {showTarde && (
                            <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-sky-50 text-[9px] text-sky-800 border border-sky-100/50 font-medium">
                              <span className="font-bold">T</span>
                              <span>Turma {tardeTeam}</span>
                            </div>
                          )}
                          {showNoite && (
                            <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-indigo-50 text-[9px] text-indigo-800 border border-indigo-100/50 font-medium">
                              <span className="font-bold">N</span>
                              <span>Turma {noiteTeam}</span>
                            </div>
                          )}
                        </div>

                        {/* Compact display on mobile */}
                        <div className="flex sm:hidden flex-wrap gap-0.5 mt-auto pb-0.5">
                          {showManha && (
                            <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100/50 font-mono">
                              M:{manhaTeam}
                            </span>
                          )}
                          {showTarde && (
                            <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-100/50 font-mono">
                              T:{tardeTeam}
                            </span>
                          )}
                          {showNoite && (
                            <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-mono">
                              N:{noiteTeam}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Popover Element (Floats on Top) */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className={popoverPositionClass}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Day Header */}
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                            <span className="text-[10px] md:text-sm font-extrabold font-sans tracking-tight text-white">
                              Dia {day} de {monthNames[currentMonthIndex]}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isToday && (
                                <span className="bg-rose-500 text-white text-[7px] md:text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                  Hoje
                                </span>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDay(0);
                                }}
                                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Shifts Details for the expanded day */}
                          <div className="flex-1 my-2 flex flex-col justify-center gap-1.5">
                            {/* Manhã Shift */}
                            {showManha && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (manhaTeam) {
                                    setActiveFloatingTeam({
                                      team: manhaTeam,
                                      shiftName: 'Manhã',
                                      hours: '06:00 - 14:18',
                                      day: day
                                    });
                                  }
                                }}
                                className="flex items-center justify-between text-[10px] md:text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 p-1.5 rounded-lg cursor-pointer transition-colors group/item"
                              >
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                  Manhã (06:00 - 14:18)
                                </span>
                                <span className="bg-indigo-600 group-hover/item:bg-indigo-500 text-white text-[7px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md shadow-3xs transition-colors">
                                  Turma {manhaTeam} ➔
                                </span>
                              </div>
                            )}

                            {/* Tarde Shift */}
                            {showTarde && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (tardeTeam) {
                                    setActiveFloatingTeam({
                                      team: tardeTeam,
                                      shiftName: 'Tarde',
                                      hours: '14:15 - 22:30',
                                      day: day
                                    });
                                  }
                                }}
                                className="flex items-center justify-between text-[10px] md:text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 p-1.5 rounded-lg cursor-pointer transition-colors group/item"
                              >
                                <span className="text-sky-400 font-bold flex items-center gap-1">
                                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-sky-500 inline-block"></span>
                                  Tarde (14:15 - 22:30)
                                </span>
                                <span className="bg-indigo-600 group-hover/item:bg-indigo-500 text-white text-[7px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md shadow-3xs transition-colors">
                                  Turma {tardeTeam} ➔
                                </span>
                              </div>
                            )}

                            {/* Noite Shift */}
                            {showNoite && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (noiteTeam) {
                                    setActiveFloatingTeam({
                                      team: noiteTeam,
                                      shiftName: 'Noite',
                                      hours: '22:30 - 06:00',
                                      day: day
                                    });
                                  }
                                }}
                                className="flex items-center justify-between text-[10px] md:text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 p-1.5 rounded-lg cursor-pointer transition-colors group/item"
                              >
                                <span className="text-indigo-400 font-bold flex items-center gap-1">
                                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                                  Noite (22:30 - 06:00)
                                </span>
                                <span className="bg-indigo-600 group-hover/item:bg-indigo-500 text-white text-[7px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md shadow-3xs transition-colors">
                                  Turma {noiteTeam} ➔
                                </span>
                              </div>
                            )}

                            {/* Folga */}
                            {showFolga && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (folgaTeam) {
                                    setActiveFloatingTeam({
                                      team: folgaTeam,
                                      shiftName: 'Folga',
                                      hours: 'Ininterrupto',
                                      day: day
                                    });
                                  }
                                }}
                                className="flex items-center justify-between text-[10px] md:text-xs bg-slate-800/40 hover:bg-slate-800/60 border border-slate-750 p-1.5 rounded-lg cursor-pointer transition-colors group/item"
                              >
                                <span className="text-slate-400 font-semibold flex items-center gap-1">
                                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-500 inline-block"></span>
                                  Folga Geral
                                </span>
                                <span className="bg-slate-700 group-hover/item:bg-slate-600 text-slate-200 text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md transition-colors">
                                  Turma {folgaTeam} ➔
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Hint footer */}
                          <div className="text-[7px] md:text-[9px] text-slate-500 text-center font-medium mt-1">
                            Clique em uma turma para ver os integrantes
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Modern Modal Overlay for Team Members */}
      <AnimatePresence>
        {activeFloatingTeam && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setActiveFloatingTeam(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-6 max-w-md w-full relative overflow-hidden"
            >
              {/* Top gradient decoration */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-sky-500" />

              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 mt-1">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Turma {activeFloatingTeam.team} • {activeFloatingTeam.shiftName}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-lg tracking-tight mt-2.5">
                    Integrantes da Equipe
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Dia {activeFloatingTeam.day.toString().padStart(2, '0')}/{(currentMonthIndex + 1).toString().padStart(2, '0')} • {activeFloatingTeam.hours}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveFloatingTeam(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Members List */}
              <div className="mt-4 space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {getEmployeesForTeam(activeFloatingTeam.team).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-all text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {emp.avatar ? (
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          referrerPolicy="no-referrer"
                          className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 shadow-4xs shrink-0"
                        />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-slate-200 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                          <User size={14} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 truncate">{emp.name}</span>
                          {emp.id === currentUser.id && (
                            <span className="bg-indigo-600 text-white font-extrabold px-1.5 py-0.2 rounded text-[8px] tracking-wide uppercase shrink-0">Você</span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[10px] block mt-0.5">{emp.position || 'Colaborador'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-4xs">
                        Turma {emp.team}
                      </span>
                    </div>
                  </div>
                ))}
                {getEmployeesForTeam(activeFloatingTeam.team).length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed">
                    Nenhum colaborador nesta equipe para este turno.
                  </div>
                )}
              </div>

              {/* Footer Close Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveFloatingTeam(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Fechar Janela
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
