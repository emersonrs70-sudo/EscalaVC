import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sun,
  SunMedium,
  Moon,
  Coffee,
  CheckCircle2,
  Bell,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';
import { TURNOS_CONFIG, TURMAS } from '../data/equipes';
import {
  downloadIcsFile,
  formatDateBR,
  formatFullDateBR,
  getDaySchedule,
  getNextFolga,
  generateGoogleCalendarUrl,
} from '../utils/escala';

interface PersonalCardProps {
  user: UserProfile;
  selectedMonth: number; // 0-11
  selectedYear: number;
  onOpenLogin: () => void;
  onOpenNotifications: () => void;
}

export const PersonalCard: React.FC<PersonalCardProps> = ({
  user,
  selectedMonth,
  selectedYear,
  onOpenLogin,
  onOpenNotifications,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const today = new Date();
  const scheduleToday = getDaySchedule(today);
  const myShiftToday = scheduleToday.shiftsByTurma[user.turma];
  const turmaInfo = TURMAS[user.turma];
  const nextFolgaInfo = getNextFolga(today, user.turma);

  const shiftConfig = TURNOS_CONFIG[myShiftToday.turno];

  const handleDownloadIcs = () => {
    downloadIcsFile(user.turma, selectedMonth, selectedYear, user.nome);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const googleCalUrlToday = generateGoogleCalendarUrl(
    today,
    myShiftToday.turno,
    user.turma,
    user.nome
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all relative overflow-hidden">
      {/* Decorative gradient blur background accent */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 pointer-events-none blur-2xl"
        style={{ backgroundColor: turmaInfo.cor }}
      />

      {/* Top Banner: User Profile */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl ${turmaInfo.badgeCor} text-white flex items-center justify-center font-black text-lg shadow-md`}
          >
            {user.turma}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {user.nome || `Colaborador Turma ${user.turma}`}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${turmaInfo.bgCor} ${turmaInfo.textCor} ${turmaInfo.borderCor}`}
              >
                Turma {user.turma}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {user.cargo || 'Operação e Manutenção'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLogin}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
        >
          <span>Trocar Perfil</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Today's Shift & Next Folga Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Card: Horário de Hoje */}
        <div
          className={`p-3.5 rounded-xl border ${shiftConfig.corBg} ${shiftConfig.corBorder} flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Horário de Hoje ({formatDateBR(today)})
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300">
                {myShiftToday.diaDescricao}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{shiftConfig.emoji}</span>
              <div>
                <div className={`text-base font-black ${shiftConfig.corText}`}>
                  {myShiftToday.turno === 'FOLGA' ? 'FOLGA HOJE' : `Turno ${shiftConfig.nome}`}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                  {myShiftToday.horario}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
            <a
              href={googleCalUrlToday}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Google Agenda</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-400 text-[10px]">Hoje</span>
          </div>
        </div>

        {/* Card: Próxima Folga */}
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5" />
                Próxima Folga
              </span>
              {nextFolgaInfo.isFolgaHoje ? (
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                  Em Folga!
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold px-1.5 py-0.5 rounded">
                  Faltam {nextFolgaInfo.diasFaltando} dias
                </span>
              )}
            </div>

            <div className="mt-1">
              <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                {nextFolgaInfo.isFolgaHoje
                  ? nextFolgaInfo.mensagem
                  : `A partir de ${formatDateBR(nextFolgaInfo.dataFolga)}`}
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                {nextFolgaInfo.isFolgaHoje
                  ? `Próximo ciclo de descanso: ${formatDateBR(nextFolgaInfo.dataProximaFolgaAposEsta)}`
                  : 'Sua escala 6x2 garante 2 dias de folga seguidos.'}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-[11px]">
            <button
              onClick={onOpenNotifications}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Bell className="w-3 h-3" />
              <span>Receber Alerta de Folga</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <CalendarIcon className="w-4 h-4 text-blue-500" />
          <span>Sincronizar escala completa da Turma {user.turma}:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadIcs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-all"
            title="Baixar arquivo .ics para Google Calendar/iCal/Outlook"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Baixado .ics</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Baixar .ICS (Google Agenda)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
