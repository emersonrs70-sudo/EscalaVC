import { Colaborador, TurmaId, TurmaInfo } from '../types';

export const COLABORADORES: Colaborador[] = [
  // Turma A
  { id: 'a1', nome: 'Celso Cunha', cargo: 'Operador de painel', turma: 'A' },
  { id: 'a2', nome: 'Márcio Freitas', cargo: 'Operador de painel', turma: 'A' },
  { id: 'a3', nome: 'José Lopes', cargo: 'Operador de forno', turma: 'A' },
  { id: 'a4', nome: 'Francisco Rodrigues', cargo: 'Operador de forno', turma: 'A' },
  { id: 'a5', nome: 'Julio Cesar', cargo: 'Operador de moagem de cimento', turma: 'A' },
  { id: 'a6', nome: 'Raimundo Mendes', cargo: 'Operador de moagem de crú', turma: 'A' },
  { id: 'a7', nome: 'Lucas', cargo: 'Eletricista', turma: 'A' },
  { id: 'a8', nome: 'Geogeilton', cargo: 'Mecânico', turma: 'A' },
  { id: 'a9', nome: 'Luiz Gomes', cargo: 'Laboratorista', turma: 'A' },

  // Turma B
  { id: 'b1', nome: 'Cláudio Fonseca', cargo: 'Operador de painel', turma: 'B' },
  { id: 'b2', nome: 'Sony Emerson', cargo: 'Operador de painel', turma: 'B' },
  { id: 'b3', nome: 'Aristeu', cargo: 'Operador de forno', turma: 'B' },
  { id: 'b4', nome: 'Francisco', cargo: 'Operador de forno', turma: 'B' },
  { id: 'b5', nome: 'Raimundo Rodrigues', cargo: 'Operador de moagem de cimento', turma: 'B' },
  { id: 'b6', nome: 'Marcelino', cargo: 'Operador de moagem de cru', turma: 'B' },
  { id: 'b7', nome: 'Luiz Antônio', cargo: 'Eletricista', turma: 'B' },
  { id: 'b8', nome: 'Rayone', cargo: 'Mecânico', turma: 'B' },
  { id: 'b9', nome: 'Daniel', cargo: 'Laboratorista', turma: 'B' },

  // Turma C
  { id: 'c1', nome: 'Cleison Duarte', cargo: 'Operador de painel', turma: 'C' },
  { id: 'c2', nome: 'Murilo Mesquita', cargo: 'Operador de painel', turma: 'C' },
  { id: 'c3', nome: 'Erasmo', cargo: 'Operador de forno', turma: 'C' },
  { id: 'c4', nome: 'David', cargo: 'Operador de forno', turma: 'C' },
  { id: 'c5', nome: 'João Paulo', cargo: 'Operador de moagem de cimento', turma: 'C' },
  { id: 'c6', nome: 'Luiz pinto', cargo: 'Operador de moagem de crú', turma: 'C' },
  { id: 'c7', nome: 'Clerlândio', cargo: 'Eletricista', turma: 'C' },
  { id: 'c8', nome: 'pinto Jr', cargo: 'Mecânico', turma: 'C' },
  { id: 'c9', nome: 'Jorge', cargo: 'Laboratorista', turma: 'C' },

  // Turma D
  { id: 'd1', nome: 'Alexandre', cargo: 'Operador de painel', turma: 'D' },
  { id: 'd2', nome: 'Lucas', cargo: 'Operador de painel', turma: 'D' },
  { id: 'd3', nome: 'Aristides', cargo: 'Operador de forno', turma: 'D' },
  { id: 'd4', nome: 'Luciano', cargo: 'Operador de forno', turma: 'D' },
  { id: 'd5', nome: 'Airton Muniz', cargo: 'Operador de moagem de cimento', turma: 'D' },
  { id: 'd6', nome: 'Roberto Carlos', cargo: 'Operador de moagem de cru', turma: 'D' },
  { id: 'd7', nome: 'Flaviano', cargo: 'Eletricista', turma: 'D' },
  { id: 'd8', nome: 'Renato', cargo: 'Mecânico', turma: 'D' },
  { id: 'd9', nome: 'Edilson', cargo: 'Laboratorista', turma: 'D' },
];

export const getTurmas = (colabList: Colaborador[] = COLABORADORES): Record<TurmaId, TurmaInfo> => ({
  A: {
    id: 'A',
    nome: 'Turma A',
    cor: '#3B82F6', // Blue
    bgCor: 'bg-blue-50 dark:bg-blue-950/40',
    borderCor: 'border-blue-300 dark:border-blue-700',
    badgeCor: 'bg-blue-500 text-white',
    textCor: 'text-blue-700 dark:text-blue-300',
    colaboradores: colabList.filter((c) => c.turma === 'A'),
  },
  B: {
    id: 'B',
    nome: 'Turma B',
    cor: '#F59E0B', // Amber
    bgCor: 'bg-amber-50 dark:bg-amber-950/40',
    borderCor: 'border-amber-300 dark:border-amber-700',
    badgeCor: 'bg-amber-500 text-white',
    textCor: 'text-amber-700 dark:text-amber-300',
    colaboradores: colabList.filter((c) => c.turma === 'B'),
  },
  C: {
    id: 'C',
    nome: 'Turma C',
    cor: '#8B5CF6', // Purple
    bgCor: 'bg-purple-50 dark:bg-purple-950/40',
    borderCor: 'border-purple-300 dark:border-purple-700',
    badgeCor: 'bg-purple-500 text-white',
    textCor: 'text-purple-700 dark:text-purple-300',
    colaboradores: colabList.filter((c) => c.turma === 'C'),
  },
  D: {
    id: 'D',
    nome: 'Turma D',
    cor: '#10B981', // Emerald Green
    bgCor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderCor: 'border-emerald-300 dark:border-emerald-700',
    badgeCor: 'bg-emerald-500 text-white',
    textCor: 'text-emerald-700 dark:text-emerald-300',
    colaboradores: colabList.filter((c) => c.turma === 'D'),
  },
});

export const TURMAS: Record<TurmaId, TurmaInfo> = getTurmas(COLABORADORES);

export const TURNOS_CONFIG = {
  MANHA: {
    id: 'MANHA' as const,
    nome: 'Manhã',
    horario: '06:00 às 14:18',
    corText: 'text-sky-700 dark:text-sky-300',
    corBg: 'bg-sky-50 dark:bg-sky-950/60',
    corBadge: 'bg-sky-500 text-white',
    corBorder: 'border-sky-200 dark:border-sky-800',
    emoji: '☀️',
  },
  TARDE: {
    id: 'TARDE' as const,
    nome: 'Tarde',
    horario: '14:15 às 22:30',
    corText: 'text-amber-700 dark:text-amber-300',
    corBg: 'bg-amber-50 dark:bg-amber-950/60',
    corBadge: 'bg-amber-500 text-white',
    corBorder: 'border-amber-200 dark:border-amber-800',
    emoji: '⛅',
  },
  NOITE: {
    id: 'NOITE' as const,
    nome: 'Noite',
    horario: '22:30 às 06:00',
    corText: 'text-indigo-700 dark:text-indigo-300',
    corBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    corBadge: 'bg-indigo-600 text-white',
    corBorder: 'border-indigo-200 dark:border-indigo-800',
    emoji: '🌙',
  },
  FOLGA: {
    id: 'FOLGA' as const,
    nome: 'Folga',
    horario: 'Folga / Descanso',
    corText: 'text-emerald-700 dark:text-emerald-300',
    corBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    corBadge: 'bg-emerald-600 text-white',
    corBorder: 'border-emerald-200 dark:border-emerald-800',
    emoji: '🌴',
  },
};
