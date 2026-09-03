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
  Palmtree,
  ArrowRight,
} from 'lucide-react';
import { TurmaId, UserProfile, Turno, Colaborador, FeriasPeriodo } from '../types';
import { TURNOS_CONFIG, TURMAS, COLABORADORES, getTurmas } from '../data/equipes';
import { formatFullDateBR, getDaySchedule, generateGoogleCalendarUrl } from '../utils/escala';
import { getFeriasForDate } from '../utils/ferias';

interface DayDetailsModalProps {
  selectedDate: Date | null;
  onClose: () => void;
  user: UserProfile | null;
  colaboradores?: Colaborador[];
  feriasList?: FeriasPeriodo[];
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  selectedDate,
  onClose,
  user,
  colaboradores = COLABORADORES,
  feriasList = [],
}) => {
  const [expandedTurno, setExpandedTurno] = useState<Turno | null>(null);

  if (!selectedDate) return null;

  const schedule = getDaySchedule(selectedDate);
  const turmasMap = getTurmas(colaboradores);
  const dayVacations = getFeriasForDate(selectedDate, feriasList);

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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* Vacation Banner on this date */}
          {dayVacations.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1.5">
                  <Palmtree className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Colaboradores em Período de Férias ({dayVacations.length})</span>
                </span>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-bold">
                  Cobertura Ativa
                </span>
              </div>

              <div className="space-y-1.5">
                {dayVacations.map((v) => (
                  <div
                    key={v.id}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="line-through text-slate-500 dark:text-slate-400">{v.colaboradorNome}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-black">
                        Turma {v.colaboradorTurma}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold pl-3 sm:pl-0 flex-wrap">
                      <ArrowRight className="w-3 h-3 shrink-0 text-slate-400 hidden sm:inline" />
                      <span>Cobre: {v.coberturaColaboradorNome}</span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-black">
                        {v.coberturaIsExterno || v.coberturaTurmaOrigem === 'EXTERNO'
                          ? `Origem: ${v.coberturaSetorOrigem || 'Outro Setor'}`
                          : `Origem: Turma ${v.coberturaTurmaOrigem}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {turnosList.map(({ turno }) => {
            const turmaId = schedule.turmaByTurno[turno];
            const turmaInfo = turmasMap[turmaId] || TURMAS[turmaId];
            const config = TURNOS_CONFIG[turno];
            const isMyTurno = user?.turma === turmaId;
            const isExpanded = expandedTurno === turno || isMyTurno;
            const turmaVacations = dayVacations.filter((v) => v.colaboradorTurma === turmaId);
            const substitutesCoveringHere = dayVacations.filter(
              (v) => v.colaboradorTurma === turmaId && v.coberturaTurmaOrigem !== turmaId
            );

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

                        {turmaVacations.length > 0 && (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                            <Palmtree className="w-2.5 h-2.5 text-amber-600" />
                            {turmaVacations.length} em férias
                          </span>
                        )}

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
                        const colabVacation = dayVacations.find((v) => v.colaboradorId === colab.id);
                        const isCoveringSomeone = dayVacations.find((v) => v.coberturaColaboradorId === colab.id);

                        return (
                          <div
                            key={colab.id}
                            className={`p-2 rounded-xl text-xs flex flex-col justify-between border ${
                              colabVacation
                                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800'
                                : isUserMe
                                ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-300 dark:border-blue-700 font-bold'
                                : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-semibold truncate ${
                                  colabVacation
                                    ? 'line-through text-slate-500 dark:text-slate-400'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {colab.nome} {isUserMe && '(Você)'}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal shrink-0 ml-1">
                                {colab.cargo}
                              </span>
                            </div>

                            {colabVacation && (
                              <div className="mt-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 bg-amber-100/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                                <Palmtree className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Em férias • Substituto: {colabVacation.coberturaColaboradorNome}</span>
                              </div>
                            )}

                            {isCoveringSomeone && !colabVacation && (
                              <div className="mt-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 bg-emerald-100/80 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                                <span>🔄 Cobrindo {isCoveringSomeone.colaboradorNome} (Turma {isCoveringSomeone.colaboradorTurma})</span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Substitutes covering in this Turma */}
                      {substitutesCoveringHere.map((v) => (
                        <div
                          key={`sub_${v.id}`}
                          className="p-2 rounded-xl text-xs flex flex-col justify-between border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 font-bold"
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate text-emerald-900 dark:text-emerald-200">
                              ★ {v.coberturaColaboradorNome}
                            </span>
                            <span className="text-[9px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded font-black">
                              Substituto
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Cobrindo {v.colaboradorNome} ({v.coberturaIsExterno || v.coberturaTurmaOrigem === 'EXTERNO' ? (v.coberturaSetorOrigem || 'Outro Setor') : `Origem: Turma ${v.coberturaTurmaOrigem}`})
                          </div>
                        </div>
                      ))}
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
