export type Turno = 'MANHA' | 'TARDE' | 'NOITE' | 'FOLGA';

export type TurmaId = 'A' | 'B' | 'C' | 'D';

export interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  turma: TurmaId;
}

export interface TurmaInfo {
  id: TurmaId;
  nome: string;
  cor: string;
  bgCor: string;
  borderCor: string;
  badgeCor: string;
  textCor: string;
  colaboradores: Colaborador[];
}

export interface ShiftInfo {
  turno: Turno;
  nomeTurno: string;
  horario: string;
  turmaId: TurmaId;
  diaCiclo: number; // 0..7
  diaDescricao: string; // ex: "1º Dia de Manhã", "1ª Folga"
}

export interface DaySchedule {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  shiftsByTurma: Record<TurmaId, ShiftInfo>;
  turmaByTurno: Record<Turno, TurmaId>;
}

export interface UserProfile {
  colaboradorId?: string;
  nome?: string;
  cargo?: string;
  turma: TurmaId;
  modoAnonimo?: boolean;
}

export interface FeriasPeriodo {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorTurma: TurmaId;
  colaboradorCargo: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  coberturaColaboradorId: string;
  coberturaColaboradorNome: string;
  coberturaTurmaOrigem?: TurmaId | 'EXTERNO' | 'OUTRO_SETOR' | string;
  coberturaCargo: string;
  coberturaSetorOrigem?: string;
  coberturaIsExterno?: boolean;
  observacoes?: string;
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
}
