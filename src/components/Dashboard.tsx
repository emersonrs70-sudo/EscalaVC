import React from 'react';
import { 
  Users, 
  Calendar, 
  ArrowUpDown, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  ArrowRightLeft,
  User,
  CalendarClock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Employee, Shift, ShiftType, SwapRequest } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  employees: Employee[];
  shifts: Shift[];
  shiftTypes: ShiftType[];
  swapRequests: SwapRequest[];
  onSelectTab: (tab: string) => void;
  currentUser: Employee;
  onUpdateAvatar?: (newUrl: string) => void;
}

export default function Dashboard({
  employees,
  shifts,
  shiftTypes,
  swapRequests,
  onSelectTab,
  currentUser,
  onUpdateAvatar
}: DashboardProps) {
  // Real dynamic current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentDayNum = now.getDate();

  const todayStr = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}-${currentDayNum.toString().padStart(2, '0')}`;
  const currentMonthStr = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}`;

  const formattedTodayDate = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/^./, (str) => str.toUpperCase());

  const getTeamShiftForDate = (team: 'A' | 'B' | 'C' | 'D', dateStr: string): string => {
    const refDateStr = '2026-07-21'; // Reference date anchor
    const d1 = new Date(dateStr + 'T00:00:00');
    const d2 = new Date(refDateStr + 'T00:00:00');
    const diffTime = d1.getTime() - d2.getTime();
    const diff = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const cycleDay = ((diff % 8) + 8) % 8;
    
    const CYCLE = ['sh-noite', 'sh-noite', 'sh-tarde', 'sh-tarde', 'sh-manha', 'sh-manha', 'sh-folga', 'sh-folga'];
    
    let offset = 0;
    if (team === 'A') offset = 2;
    else if (team === 'B') offset = 4;
    else if (team === 'C') offset = 6;
    else if (team === 'D') offset = 0;
    
    const index = (cycleDay + offset) % 8;
    return CYCLE[index];
  };

  const teamsList: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const todayAssignments = teamsList.map(team => {
    const shiftTypeId = getTeamShiftForDate(team, todayStr);
    const type = shiftTypes.find(t => t.id === shiftTypeId);
    return { team, type };
  });

  const sortedAssignments = [
    todayAssignments.find(a => a.type?.id === 'sh-manha'),
    todayAssignments.find(a => a.type?.id === 'sh-tarde'),
    todayAssignments.find(a => a.type?.id === 'sh-noite'),
    todayAssignments.find(a => a.type?.id === 'sh-folga')
  ].filter((a): a is { team: 'A' | 'B' | 'C' | 'D'; type: ShiftType } => !!(a && a.type));

  // Calculations
  const activeCollaborators = employees.filter(e => e.role !== 'ADMIN');
  const shiftsToday = shifts.filter(s => s.date === todayStr);

  // Filter shifts specifically to current month for monthly dashboard statistics
  const currentMonthShifts = shifts.filter(s => s.date.startsWith(currentMonthStr));

  // Chart 1: Shifts count per employee in the current month
  const employeeShiftsData = activeCollaborators.map(emp => {
    const count = currentMonthShifts.filter(s => s.employeeId === emp.id).length;
    return {
      name: emp.name.split(' ')[0], // First name
      "Total de Plantões": count,
      color: emp.color === 'emerald' ? '#10b981' : 
             emp.color === 'sky' ? '#0ea5e9' : 
             emp.color === 'amber' ? '#f59e0b' : 
             emp.color === 'pink' ? '#ec4899' : '#14b8a6'
    };
  });

  // Chart 2: Shift Types count
  const shiftTypesData = shiftTypes.map(type => {
    const count = currentMonthShifts.filter(s => s.shiftTypeId === type.id).length;
    return {
      name: type.name,
      "Quantidade": count,
      color: type.id === 'sh-manha' ? '#10b981' : 
             type.id === 'sh-tarde' ? '#0ea5e9' : 
             type.id === 'sh-noite' ? '#6366f1' : '#f59e0b'
    };
  });

  // Chart 3: Team composition breakdown
  const teamCompositionData = [
    { name: 'Turma A', value: employees.filter(e => e.team === 'A').length, color: '#10b981' },
    { name: 'Turma B', value: employees.filter(e => e.team === 'B').length, color: '#0ea5e9' },
    { name: 'Turma C', value: employees.filter(e => e.team === 'C').length, color: '#f59e0b' },
    { name: 'Turma D', value: employees.filter(e => e.team === 'D').length, color: '#ec4899' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Compact User Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 md:p-5 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => {
                const fileInput = document.getElementById('profile-avatar-input');
                if (fileInput) {
                  fileInput.click();
                } else {
                  const newUrl = prompt('Insira a URL da nova foto de perfil para ' + currentUser.name + ':', currentUser.avatar);
                  if (newUrl && onUpdateAvatar) onUpdateAvatar(newUrl);
                }
              }}
              title="Clique para carregar uma foto pessoal"
            >
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/30 shadow-sm group-hover:border-indigo-400 transition-all"
                />
              ) : (
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-slate-800 border-2 border-white/30 shadow-sm group-hover:border-indigo-400 transition-all flex items-center justify-center text-slate-300">
                  <User size={22} />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm border border-slate-950">
                ✎
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold font-sans tracking-tight">
                  Olá, {currentUser.name}
                </h1>
                {currentUser.team && currentUser.team !== 'N/A' && (
                  <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border border-indigo-500/40">
                    Turma {currentUser.team}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs mt-0.5">
                {currentUser.position || 'Colaborador'} • Operações 6x2
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              onClick={() => onSelectTab('calendar')}
              id="dashboard-btn-scale"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Calendar size={14} />
              Ver Escala
            </button>
            <button
              onClick={() => onSelectTab('teams')}
              id="dashboard-btn-teams"
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 border border-white/10"
            >
              <Users size={14} className="text-indigo-300" />
              Ver Equipes
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Prominent Today's Shift Card & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prominent Today's Shift Card (Featured / High Priority) */}
        <div className="bg-gradient-to-b from-indigo-50/50 via-white to-white rounded-[2rem] border-2 border-indigo-200/80 shadow-md p-6 lg:col-span-1 flex flex-col hover:shadow-lg transition-all duration-200 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Dia Corrente
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-800 mt-1 flex items-center gap-2">
                <CalendarClock size={20} className="text-indigo-600 shrink-0" />
                Escala de Hoje
              </h3>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                {formattedTodayDate}
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-extrabold rounded-full shadow-xs">
              Plantão 6x2
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1 justify-center flex flex-col">
            {sortedAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum turno configurado para hoje.
              </div>
            ) : (
              sortedAssignments.map(({ team, type }) => {
                const isUserTeam = currentUser.team === team;
                let borderLClass = "";
                let bgClass = "";
                let labelColor = "";
                
                if (type.id === 'sh-manha') {
                  borderLClass = "border-l-4 border-l-emerald-500";
                  bgClass = isUserTeam ? "bg-emerald-100/70 ring-2 ring-emerald-500/40" : "bg-emerald-50/40 hover:bg-emerald-50/80";
                  labelColor = "text-emerald-700 bg-emerald-100/80";
                } else if (type.id === 'sh-tarde') {
                  borderLClass = "border-l-4 border-l-sky-500";
                  bgClass = isUserTeam ? "bg-sky-100/70 ring-2 ring-sky-500/40" : "bg-sky-50/40 hover:bg-sky-50/80";
                  labelColor = "text-sky-700 bg-sky-100/80";
                } else if (type.id === 'sh-noite') {
                  borderLClass = "border-l-4 border-l-indigo-500";
                  bgClass = isUserTeam ? "bg-indigo-100/70 ring-2 ring-indigo-500/40" : "bg-indigo-50/40 hover:bg-indigo-50/80";
                  labelColor = "text-indigo-700 bg-indigo-100/80";
                } else {
                  borderLClass = "border-l-4 border-l-slate-400";
                  bgClass = isUserTeam ? "bg-slate-200/70 ring-2 ring-slate-400/40" : "bg-slate-50/40 hover:bg-slate-50/80";
                  labelColor = "text-slate-600 bg-slate-100/80";
                }

                return (
                  <div 
                    key={type.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 transition-all duration-150 shadow-3xs ${borderLClass} ${bgClass}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          {type.name === 'Folga' ? 'Folga Geral' : `Turno ${type.name}`}
                        </span>
                        {isUserTeam && (
                          <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                            Sua Turma
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-xs font-mono font-medium">
                        {type.id === 'sh-folga' ? 'Ininterrupto' : `${type.startTime} - ${type.endTime}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${labelColor}`}>
                        {type.id === 'sh-folga' ? 'FOLGA' : 'PLANTÃO'}
                      </span>
                      <div className="bg-slate-900 text-white rounded-xl px-3 py-1.5 font-sans font-black text-xs shadow-xs min-w-[80px] text-center border border-slate-800">
                        Turma {team}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Charts & Graphs (Right Column - 2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Carga de Trabalho - Plantões por Profissional
            </h3>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeShiftsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  />
                  <Bar dataKey="Total de Plantões" radius={[4, 4, 0, 0]}>
                    {employeeShiftsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Número de turnos distribuídos para cada colaborador no mês corrente de {currentMonthNum.toString().padStart(2, '0')}/{currentYear}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shift Type Distribution */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distritos de Turno</h4>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftTypesData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="Quantidade" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {shiftTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Team composition breakdown */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Colaboradores por Turma</h4>
                {teamCompositionData.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Nenhuma equipe registrada.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 h-[120px]">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={teamCompositionData}
                            innerRadius={30}
                            outerRadius={50}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {teamCompositionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-1.5">
                      {teamCompositionData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
                          <span className="truncate">{entry.name}: {entry.value} colab.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-2">
                Distribuição de operadores entre as quatro turmas (A, B, C, D).
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
