import { FeriasPeriodo, Colaborador, TurmaId } from '../types';

export const INITIAL_FERIAS: FeriasPeriodo[] = [
  {
    id: 'ferias-1',
    colaboradorId: 'a1',
    colaboradorNome: 'Celso Cunha',
    colaboradorTurma: 'A',
    colaboradorCargo: 'Operador de painel',
    dataInicio: '2026-09-01',
    dataFim: '2026-09-20',
    coberturaColaboradorId: 'b2',
    coberturaColaboradorNome: 'Sony Emerson',
    coberturaTurmaOrigem: 'B',
    coberturaCargo: 'Operador de painel',
    observacoes: 'Férias regulamentares. Cobertura no painel acordada entre as turmas.',
    status: 'EM_ANDAMENTO',
  },
  {
    id: 'ferias-2',
    colaboradorId: 'b7',
    colaboradorNome: 'Luiz Antônio',
    colaboradorTurma: 'B',
    colaboradorCargo: 'Eletricista',
    dataInicio: '2026-09-15',
    dataFim: '2026-09-30',
    coberturaColaboradorId: 'c7',
    coberturaColaboradorNome: 'Clerlândio',
    coberturaTurmaOrigem: 'C',
    coberturaCargo: 'Eletricista',
    observacoes: 'Cobertura preventiva de manutenção elétrica.',
    status: 'AGENDADA',
  },
];

const STORAGE_KEY = 'escala_6x2_ferias';

export function getSavedFerias(): FeriasPeriodo[] {
  if (typeof window === 'undefined') return INITIAL_FERIAS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FERIAS));
      return INITIAL_FERIAS;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.map(updateFeriasStatus);
    }
    return INITIAL_FERIAS;
  } catch (e) {
    console.error('Failed to load ferias from localStorage', e);
    return INITIAL_FERIAS;
  }
}

export function saveFeriasToStorage(list: FeriasPeriodo[]): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = list.map(updateFeriasStatus);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save ferias to localStorage', e);
  }
}

export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(isoString: string): Date {
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function calculateDaysCount(dataInicio: string, dataFim: string): number {
  try {
    const start = parseIsoDate(dataInicio);
    const end = parseIsoDate(dataFim);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  } catch {
    return 1;
  }
}

export function updateFeriasStatus(f: FeriasPeriodo): FeriasPeriodo {
  const todayStr = formatDateToIso(new Date());
  let status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' = f.status;

  if (todayStr >= f.dataInicio && todayStr <= f.dataFim) {
    status = 'EM_ANDAMENTO';
  } else if (todayStr < f.dataInicio) {
    status = 'AGENDADA';
  } else {
    status = 'CONCLUIDA';
  }

  return { ...f, status };
}

export function updateFeriasListStatus(list: FeriasPeriodo[]): FeriasPeriodo[] {
  return list.map(updateFeriasStatus);
}

/**
 * Returns all active vacation periods for a specific date
 */
export function getFeriasForDate(date: Date, feriasList: FeriasPeriodo[]): FeriasPeriodo[] {
  const dateStr = formatDateToIso(date);
  return feriasList.filter((f) => dateStr >= f.dataInicio && dateStr <= f.dataFim);
}

/**
 * Returns vacation periods where a specific turma is either taking vacation or providing cover
 */
export function getFeriasForTurmaOnDate(
  date: Date,
  turmaId: TurmaId,
  feriasList: FeriasPeriodo[]
): {
  onVacation: FeriasPeriodo[];
  covering: FeriasPeriodo[];
} {
  const dateFerias = getFeriasForDate(date, feriasList);
  return {
    onVacation: dateFerias.filter((f) => f.colaboradorTurma === turmaId),
    covering: dateFerias.filter((f) => f.coberturaTurmaOrigem === turmaId),
  };
}

/**
 * Check if a collaborator is currently on vacation or covering on a given date
 */
export function getColaboradorVacationInfo(
  colaboradorId: string,
  date: Date,
  feriasList: FeriasPeriodo[]
): {
  isAwayOnVacation: boolean;
  vacationRecord?: FeriasPeriodo;
  isCoveringAnother: boolean;
  coveringRecord?: FeriasPeriodo;
} {
  const dateStr = formatDateToIso(date);
  const activeRecords = feriasList.filter(
    (f) => dateStr >= f.dataInicio && dateStr <= f.dataFim
  );

  const vacationRecord = activeRecords.find((f) => f.colaboradorId === colaboradorId);
  const coveringRecord = activeRecords.find((f) => f.coberturaColaboradorId === colaboradorId);

  return {
    isAwayOnVacation: !!vacationRecord,
    vacationRecord,
    isCoveringAnother: !!coveringRecord,
    coveringRecord,
  };
}
