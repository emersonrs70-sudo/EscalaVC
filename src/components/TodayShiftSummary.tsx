import React from 'react';
import { Sun, SunMedium, Moon, Coffee, Clock, Users } from 'lucide-react';
import { Colaborador, TurmaId } from '../types';
import { TURNOS_CONFIG, TURMAS, getTurmas } from '../data/equipes';
import { getDaySchedule, formatDateBR } from '../utils/escala';

interface TodayShiftSummaryProps {
  colaboradores: Colaborador[];
  onSelectTurmaFilter?: (turma: TurmaId) => void;
}

export const TodayShiftSummary: React.FC<TodayShiftSummaryProps> = ({
  colaboradores,
  onSelectTurmaFilter,
}) => {
  const today = new Date();
  const schedule = getDaySchedule(today);
  const turmasMap = getTurmas(colaboradores);

  const formatLongDate = (d: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(d);
  };

  const getShiftIcon = (turno: string) => {
    switch (turno) {
      case 'MANHA':
        return <Sun className="w-4 h-4 text-sky-500" />;
      case 'TARDE':
        return <SunMedium className="w-4 h-4 text-amber-500" />;
      case 'NOITE':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'FOLGA':
      default:
        return <Coffee className="w-4 h-4 text-emerald-500" />;
    }
  };

  const turmasList: TurmaId[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Operação das 4 Turmas Hoje</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
            {formatLongDate(today)}
          </p>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
          Escala 6x2
        </span>
      </div>

      {/* Grid of the 4 Teams today */}
      <div className="grid grid-cols-1 gap-2.5">
        {turmasList.map((tId) => {
          const shiftInfo = schedule.shiftsByTurma[tId];
          const config = TURNOS_CONFIG[shiftInfo.turno];
          const tData = turmasMap[tId] || TURMAS[tId];
          const colabCount = tData.colaboradores.length;

          return (
            <div
              key={tId}
              onClick={() => onSelectTurmaFilter && onSelectTurmaFilter(tId)}
              className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-xs flex items-center justify-between gap-3 ${
                shiftInfo.turno === 'FOLGA'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                  : `${config.corBg} ${config.corBorder}`
              }`}
              title={`Turma ${tId} (${colabCount} integrantes):\n${tData.colaboradores.map((c) => `• ${c.nome} (${c.cargo})`).join('\n') || 'Nenhum integrante'}\n\nClique para filtrar calendário pela Turma ${tId}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${tData.badgeCor} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {tId}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      Turma {tId}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 font-medium">
                      <Users className="w-3 h-3 text-slate-400" />
                      {colabCount}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                    {getShiftIcon(shiftInfo.turno)}
                    <span>
                      {shiftInfo.turno === 'FOLGA'
                        ? 'FOLGA (Descanso)'
                        : `Turno ${config.nome}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 flex flex-col items-end justify-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  {shiftInfo.turno === 'FOLGA' ? 'Dia Off' : config.horario.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectTurmaFilter) onSelectTurmaFilter(tId);
                  }}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-lg transition-all mt-1 flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <span>Ver escala</span>
                  <span className="text-[11px]">→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Turnos Legend Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Manhã: 06:00-14:18</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Tarde: 14:15-22:30</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>Noite: 22:30-06:00</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Folga: 2 Dias Off</span>
        </div>
      </div>
    </div>
  );
};
