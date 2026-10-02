import { Feriado } from '../types';
import { FERIADOS_INICIAIS } from '../data/feriados';

const STORAGE_KEY = 'escala_6x2_feriados';

/**
 * Retorna string 'YYYY-MM-DD' para uma data
 */
export const toDateStringBR = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Obtém feriados salvos no cache local ou retorna a lista inicial padrão
 */
export const getSavedFeriados = (): Feriado[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler feriados do cache local:', e);
  }
  return FERIADOS_INICIAIS;
};

/**
 * Salva a lista de feriados no localStorage
 */
export const saveFeriadosToStorage = (feriados: Feriado[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feriados));
  } catch (e) {
    console.error('Erro ao salvar feriados no cache local:', e);
  }
};

/**
 * Encontra o feriado para uma data específica (Date ou string 'YYYY-MM-DD')
 */
export const getFeriadoForDate = (
  date: Date | string,
  feriadosList: Feriado[] = FERIADOS_INICIAIS
): Feriado | undefined => {
  const dateStr = typeof date === 'string' ? date : toDateStringBR(date);
  return feriadosList.find((f) => f.data === dateStr);
};

/**
 * Retorna os feriados filtrados por ano
 */
export const getFeriadosByYear = (
  year: number,
  feriadosList: Feriado[]
): Feriado[] => {
  const yearStr = String(year);
  return feriadosList
    .filter((f) => f.data.startsWith(yearStr))
    .sort((a, b) => a.data.localeCompare(b.data));
};
