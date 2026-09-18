import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ArrowRightLeft, 
  User, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Employee, Shift, ShiftType, SwapRequest } from '../types';

interface MyShiftsProps {
  currentUser: Employee;
  shifts: Shift[];
  shiftTypes: ShiftType[];
  employees: Employee[];
  swapRequests: SwapRequest[];
  onRespondToSwap: (requestId: string, approve: boolean) => void;
  onSelectTab: (tab: string) => void;
}

export default function MyShifts({
  currentUser,
  shifts,
  shiftTypes,
  employees,
  swapRequests,
  onRespondToSwap,
  onSelectTab
}: MyShiftsProps) {
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

  // Real dynamic date
  const now = new Date();
  const realYear = now.getFullYear();
  const realMonth = now.getMonth();
  const realDay = now.getDate();

  const initialPeriodIdx = periods.findIndex(p => p.year === realYear && p.month === realMonth);
  const defaultPeriodIdx = initialPeriodIdx !== -1 ? initialPeriodIdx : 12;

  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(defaultPeriodIdx);
  const currentPeriod = periods[selectedPeriodIndex] || periods[0];

  const todayStr = `${realYear}-${(realMonth + 1).toString().padStart(2, '0')}-${realDay.toString().padStart(2, '0')}`;

  // Current user's shifts across all time
  const allMyShifts = shifts.filter(s => s.employeeId === currentUser.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Current user's shifts filtered for the selected month
  const targetYearMonth = `${currentPeriod.year}-${(currentPeriod.month + 1).toString().padStart(2, '0')}`;
  const myShifts = allMyShifts.filter(s => s.date.startsWith(targetYearMonth));

  // Upcoming shifts (from today onwards, from all shifts)
  const myUpcomingShifts = allMyShifts.filter(s => s.date >= todayStr);

  // Total shift hours calculation
  const totalHours = myShifts.reduce((acc, s) => {
    const type = shiftTypes.find(t => t.id === s.shiftTypeId);
    if (!type) return acc;
    // Calculate difference
    const start = parseInt(type.startTime.split(':')[0], 10);
    const end = parseInt(type.endTime.split(':')[0], 10);
    const hours = end > start ? (end - start) : (24 - start + end);
    return acc + hours;
  }, 0);

  // Next plantão details
  const nextShift = myUpcomingShifts[0];
  const nextShiftType = nextShift ? shiftTypes.find(t => t.id === nextShift.shiftTypeId) : null;

  // Swap requests received by me that are pending my response
  const pendingReceivedSwaps = swapRequests.filter(r => 
    r.receiverId === currentUser.id && r.status === 'PENDING_RECEIVER'
  );

  // Swap requests sent by me
  const pendingSentSwaps = swapRequests.filter(r => 
    r.requesterId === currentUser.id && (r.status === 'PENDING_RECEIVER' || r.status === 'PENDING_ADMIN')
  );
  return (
    <div className="space-y-6">
      {/* Employee Statistics Board */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6 hover:shadow-md transition-all duration-200">
        
        {/* Next Plantão Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 rounded-xl p-4 border border-indigo-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Próximo Plantão</span>
            {nextShift && nextShiftType ? (
              <div className="mt-3">
                <h4 className="text-lg font-bold text-slate-800 font-sans">
                  Dia {nextShift.date.split('-')[2]}/{nextShift.date.split('-')[1]} - {nextShiftType.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1">
                  <Clock size={13} className="text-indigo-500" />
                  {nextShiftType.startTime} às {nextShiftType.endTime}
                </p>
                {nextShift.notes && (
                  <p className="text-xs text-indigo-600 italic mt-1.5 font-medium">"{nextShift.notes}"</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-2">Nenhum plantão agendado para os próximos dias.</p>
            )}
          </div>
          <button 
            onClick={() => onSelectTab('calendar')}
            className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors mt-4 text-left flex items-center gap-1"
          >
            Ver escala geral →
          </button>
        </div>

        {/* Total stats */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Plantões no Mês</span>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-800 font-mono">{myShifts.length}</span>
              <span className="text-xs font-medium text-slate-400">plantões alocados</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Equivalente a <strong className="text-slate-700 font-semibold">{totalHours} horas</strong> de trabalho estimadas.
            </p>
          </div>
          <span className="text-[11px] text-slate-400">Escala de {currentPeriod.label}</span>
        </div>

        {/* Standard Info Box instead of swaps */}
        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/60 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
              <AlertCircle size={14} className="text-emerald-600" />
              Trocas Individuais
            </span>
            <div className="mt-2.5">
              <h4 className="text-sm font-bold text-slate-800">
                Aviso de Trocas
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                As trocas de horário entre colaboradores são de caráter pessoal, devendo ser combinadas diretamente com os colegas, sem a necessidade de intermediação, registro ou homologação pelo sistema.
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Meus Plantões</h3>
            <p className="text-slate-400 text-xs">Lista detalhada dos seus plantões no período selecionado</p>
          </div>
          <div className="relative inline-block shrink-0">
            <select
              value={selectedPeriodIndex}
              onChange={(e) => setSelectedPeriodIndex(parseInt(e.target.value))}
              className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-3xs"
            >
              {periods.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {myShifts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed">
              Você não possui nenhum plantão alocado para o período de {currentPeriod.label}.
            </div>
          ) : (
            myShifts.map((shift) => {
              const type = shiftTypes.find(t => t.id === shift.shiftTypeId);

              return (
                <div 
                  key={shift.id} 
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-xs ${
                    shift.date < todayStr 
                      ? 'opacity-65 bg-slate-50 border-slate-200' 
                      : 'bg-white border-slate-100 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${type?.bgColor} ${type?.textColor} font-bold text-center w-12 font-mono`}>
                      <span className="text-xs block text-[10px] uppercase font-semibold text-slate-400">Dia</span>
                      <span className="text-lg leading-none">{shift.date.split('-')[2]}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {type?.name}
                        {shift.date === todayStr && (
                          <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider animate-pulse">Hoje</span>
                        )}
                        {shift.date < todayStr && (
                          <span className="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.2 rounded-full font-medium">Realizado</span>
                        )}
                      </h4>
                      <p className="text-slate-500 text-xs mt-0.5 font-mono flex items-center gap-1">
                        <Clock size={12} /> {type?.startTime} - {type?.endTime}
                      </p>
                      {shift.notes && (
                        <p className="text-slate-400 text-xs mt-1 italic">Obs: {shift.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
