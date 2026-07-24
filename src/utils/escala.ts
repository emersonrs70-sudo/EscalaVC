import { DaySchedule, ShiftInfo, Turno, TurmaId } from '../types';
import { TURNOS_CONFIG } from '../data/equipes';

// Anchor Date: 2026-07-23
export const ANCHOR_DATE = new Date(2026, 6, 23); // July 23, 2026 (month is 0-indexed)

// Initial cycle index on 2026-07-23
// 0: Manhã 1, 1: Manhã 2, 2: Tarde 1, 3: Tarde 2, 4: Noite 1, 5: Noite 2, 6: Folga 1, 7: Folga 2
export const INITIAL_TURMA_OFFSETS: Record<TurmaId, number> = {
  C: 0, // Primeira Manhã
  B: 2, // Primeira Tarde
  A: 4, // Primeira Noite
  D: 6, // Primeira Folga
};

/**
 * Calculates number of days between two dates regardless of time/DST
 */
export function getDaysDiff(d1: Date, d2: Date = ANCHOR_DATE): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

/**
 * Returns cycle index (0..7) for a given date and turma
 */
export function getCycleIndex(targetDate: Date, turmaId: TurmaId): number {
  const diff = getDaysDiff(targetDate, ANCHOR_DATE);
  const baseOffset = INITIAL_TURMA_OFFSETS[turmaId];
  return ((baseOffset + diff) % 8 + 8) % 8;
}

/**
 * Maps cycle index (0..7) to shift details
 */
export function getShiftFromCycleIndex(cycleIndex: number, turmaId: TurmaId): ShiftInfo {
  let turno: Turno;
  let nomeTurno: string;
  let horario: string;
  let diaDescricao: string;

  switch (cycleIndex) {
    case 0:
      turno = 'MANHA';
      nomeTurno = 'Manhã';
      horario = TURNOS_CONFIG.MANHA.horario;
      diaDescricao = '1º dia de Manhã';
      break;
    case 1:
      turno = 'MANHA';
      nomeTurno = 'Manhã';
      horario = TURNOS_CONFIG.MANHA.horario;
      diaDescricao = '2º dia de Manhã';
      break;
    case 2:
      turno = 'TARDE';
      nomeTurno = 'Tarde';
      horario = TURNOS_CONFIG.TARDE.horario;
      diaDescricao = '1º dia de Tarde';
      break;
    case 3:
      turno = 'TARDE';
      nomeTurno = 'Tarde';
      horario = TURNOS_CONFIG.TARDE.horario;
      diaDescricao = '2º dia de Tarde';
      break;
    case 4:
      turno = 'NOITE';
      nomeTurno = 'Noite';
      horario = TURNOS_CONFIG.NOITE.horario;
      diaDescricao = '1º dia de Noite';
      break;
    case 5:
      turno = 'NOITE';
      nomeTurno = 'Noite';
      horario = TURNOS_CONFIG.NOITE.horario;
      diaDescricao = '2º dia de Noite';
      break;
    case 6:
      turno = 'FOLGA';
      nomeTurno = 'Folga';
      horario = 'Folga do Turno';
      diaDescricao = '1ª Folga';
      break;
    case 7:
    default:
      turno = 'FOLGA';
      nomeTurno = 'Folga';
      horario = 'Folga do Turno';
      diaDescricao = '2ª Folga';
      break;
  }

  return {
    turno,
    nomeTurno,
    horario,
    turmaId,
    diaCiclo: cycleIndex,
    diaDescricao,
  };
}

/**
 * Gets the complete schedule for all 4 turmas for a given date
 */
export function getDaySchedule(date: Date): DaySchedule {
  const turmas: TurmaId[] = ['A', 'B', 'C', 'D'];
  const shiftsByTurma = {} as Record<TurmaId, ShiftInfo>;
  const turmaByTurno = {} as Record<Turno, TurmaId>;

  turmas.forEach((tId) => {
    const cycleIndex = getCycleIndex(date, tId);
    const shift = getShiftFromCycleIndex(cycleIndex, tId);
    shiftsByTurma[tId] = shift;
    turmaByTurno[shift.turno] = tId;
  });

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  return {
    date: new Date(date),
    dateStr,
    shiftsByTurma,
    turmaByTurno,
  };
}

/**
 * Calculates upcoming Folga details starting from a reference date
 */
export function getNextFolga(startDate: Date, turmaId: TurmaId) {
  const currentCycle = getCycleIndex(startDate, turmaId);
  
  if (currentCycle === 6) {
    return {
      isFolgaHoje: true,
      diaFolgaIndex: 1,
      mensagem: 'Você está no 1º dia de folga hoje! 🎉',
      diasFaltando: 0,
      dataFolga: new Date(startDate),
      dataProximaFolgaAposEsta: addDays(startDate, 8),
    };
  }

  if (currentCycle === 7) {
    return {
      isFolgaHoje: true,
      diaFolgaIndex: 2,
      mensagem: 'Você está no 2º dia de folga hoje! 🎉',
      diasFaltando: 0,
      dataFolga: new Date(startDate),
      dataProximaFolgaAposEsta: addDays(startDate, 7),
    };
  }

  // Days remaining until cycleIndex = 6
  const diasFaltando = 6 - currentCycle;
  const dataFolga = addDays(startDate, diasFaltando);

  return {
    isFolgaHoje: false,
    diaFolgaIndex: 0,
    mensagem: `Sua próxima folga é em ${diasFaltando} ${diasFaltando === 1 ? 'dia' : 'dias'}`,
    diasFaltando,
    dataFolga,
    dataProximaFolgaAposEsta: addDays(dataFolga, 8),
  };
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatFullDateBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Generates Google Calendar Event URL for a shift on a specific day
 */
export function generateGoogleCalendarUrl(
  date: Date,
  turno: Turno,
  turmaId: TurmaId,
  colaboradorNome?: string
): string {
  const title = encodeURIComponent(
    turno === 'FOLGA'
      ? `🎉 FOLGA - Turma ${turmaId}${colaboradorNome ? ` (${colaboradorNome})` : ''}`
      : `🏭 Turno de ${TURNOS_CONFIG[turno].nome} (${TURNOS_CONFIG[turno].horario}) - Turma ${turmaId}`
  );

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let startTime = '060000';
  let endTime = '141800';

  if (turno === 'MANHA') {
    startTime = '060000';
    endTime = '141800';
  } else if (turno === 'TARDE') {
    startTime = '141500';
    endTime = '223000';
  } else if (turno === 'NOITE') {
    startTime = '223000';
    endTime = '060000'; // ends next day
  }

  let datesParam = `${year}${month}${day}T${startTime}/${year}${month}${day}T${endTime}`;
  
  if (turno === 'FOLGA') {
    // All day event
    datesParam = `${year}${month}${day}/${year}${month}${day}`;
  }

  const details = encodeURIComponent(
    `Escala de Trabalho 6x2 - Turma ${turmaId}.\nHorário: ${TURNOS_CONFIG[turno].horario}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}`;
}

/**
 * Generates an iCalendar (.ics) file for the selected month/year scale
 */
export function generateIcsContent(
  turmaId: TurmaId,
  month: number, // 0-indexed
  year: number,
  colaboradorNome?: string
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Escala 6x2//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const cycleIndex = getCycleIndex(date, turmaId);
    const shift = getShiftFromCycleIndex(cycleIndex, turmaId);

    const yearStr = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');

    const dtStartDay = `${yearStr}${monthStr}${dayStr}`;

    let summary = `Turno ${shift.nomeTurno} - Turma ${turmaId}`;
    if (shift.turno === 'FOLGA') {
      summary = `FOLGA 🎉 - Turma ${turmaId}`;
    }
    if (colaboradorNome) {
      summary += ` (${colaboradorNome})`;
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:Escala 6x2 - ${shift.diaDescricao}. Horário: ${shift.horario}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStartDay}`);
    lines.push(`DTEND;VALUE=DATE:${dtStartDay}`);
    lines.push(`UID:escala-6x2-${turmaId}-${dtStartDay}@escala6x2.app`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Downloads the .ics file directly in browser
 */
export function downloadIcsFile(turmaId: TurmaId, month: number, year: number, colaboradorNome?: string) {
  const content = generateIcsContent(turmaId, month, year, colaboradorNome);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(year, month, 1));
  link.setAttribute('download', `Escala_Turma_${turmaId}_${monthName}_${year}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
