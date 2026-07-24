import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Check,
  Share2,
} from 'lucide-react';
import { TurmaId, UserProfile, Turno } from '../types';
import { TURNOS_CONFIG, TURMAS } from '../data/equipes';
import { formatFullDateBR, getDaySchedule, generateGoogleCalendarUrl } from '../utils/escala';

interface DayDetailsModalProps {
  selectedDate: Date | null;
  onClose: () => void;
  user: UserProfile | null;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  selectedDate,
  onClose,
  user,
}) => {
  const [expandedTurno, setExpandedTurno] = useState<Turno | null>(null);

  if (!selectedDate) return null;

  const schedule = getDaySchedule(selectedDate);

  const turnosList: { turno: Turno; label: string }[] = [
    { turno: 'MANHA', label: 'Manhã' },
    { turno: 'TARDE', label: 'Tarde' },
    { turno: 'NOITE', label: 'Noite' },
    { turno: 'FOLGA', label: 'Folga / Descanso' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Handle bar for mobile sheet aesthetic */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
                {formatFullDateBR(selectedDate)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detalhamento dos turnos e equipes escaladas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Details List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {turnosList.map(({ turno }) => {
            const turmaId = schedule.turmaByTurno[turno];
            const turmaInfo = TURMAS[turmaId];
            const config = TURNOS_CONFIG[turno];
            const isMyTurno = user?.turma === turmaId;
            const isExpanded = expandedTurno === turno || isMyTurno;

            const googleCalUrl = generateGoogleCalendarUrl(
              selectedDate,
              turno,
              turmaId,
              user?.nome
            );

            return (
              <div
                key={turno}
                className={`rounded-2xl border transition-all ${
                  isMyTurno
                    ? 'ring-2 ring-blue-500/40 border-blue-400 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
                }`}
              >
                {/* Shift Card Top Bar */}
                <div
                  onClick={() => setExpandedTurno(isExpanded ? null : turno)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${config.corText}`}>
                          {turno === 'FOLGA' ? 'FOLGA' : `Turno ${config.nome}`}
                        </span>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${turmaInfo.bgCor} ${turmaInfo.textCor} ${turmaInfo.borderCor}`}
                        >
                          Turma {turmaId}
                        </span>

                        {isMyTurno && (
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-md">
                            Sua Turma
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{config.horario}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      {turmaInfo.colaboradores.length} integrantes
                    </span>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Worker Roster */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>Integrantes da Turma {turmaId}:</span>
                      </span>

                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Adicionar ao Google Agenda</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {turmaInfo.colaboradores.map((colab) => {
                        const isUserMe = user?.colaboradorId === colab.id;

                        return (
                          <div
                            key={colab.id}
                            className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                              isUserMe
                                ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-300 dark:border-blue-700 font-bold'
                                : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/60'
                            }`}
                          >
                            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                              {colab.nome} {isUserMe && '(Você)'}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal shrink-0 ml-1">
                              {colab.cargo}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">Escala 6x2 • Revezamento de 4 Turmas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
