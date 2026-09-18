import { Employee, ShiftType, Shift, SwapRequest } from '../types';
import { generateBaseShifts, applySwapsToShifts } from '../utils/shiftHelper';

export const INITIAL_EMPLOYEES: Employee[] = [
  // --- Admin/Supervisor ---
  {
    id: 'emp-supervisor',
    name: 'Eng. Carlos Alberto',
    role: 'ADMIN',
    department: 'Supervisão Geral de Operações',
    avatar: '',
    email: 'carlos.alberto@cimento-flow.com',
    color: 'indigo',
    team: 'N/A',
    position: 'Supervisor de Produção'
  },

  // --- Turma A ---
  {
    id: 'emp-celso-a',
    name: 'Celso Cunha',
    role: 'COLLABORATOR',
    department: 'Operações / Turma A',
    avatar: '',
    email: 'celso.cunha@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-marcio-a',
    name: 'Márcio Freitas',
    role: 'COLLABORATOR',
    department: 'Operações / Turma A',
    avatar: '',
    email: 'marcio.freitas@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-lucas-a',
    name: 'Lucas Walleverson',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma A',
    avatar: '',
    email: 'lucas.walleverson@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Eletricista'
  },
  {
    id: 'emp-geogeilton-a',
    name: 'Geogeilton',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma A',
    avatar: '',
    email: 'geogeilton@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Mecânico'
  },
  {
    id: 'emp-jose-a',
    name: 'José Lopes',
    role: 'COLLABORATOR',
    department: 'Operações / Turma A',
    avatar: '',
    email: 'jose.lopes@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-francisco-a',
    name: 'Francisco Rodrigues',
    role: 'COLLABORATOR',
    department: 'Operações / Turma A',
    avatar: '',
    email: 'francisco.rodrigues@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-julio-a',
    name: 'Julio Cesar',
    role: 'COLLABORATOR',
    department: 'Operações / Turma A',
    avatar: '',
    email: 'julio.cesar@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Operador de Moagem de Cimento'
  },
  {
    id: 'emp-raimundo-a',
    name: 'Raimundo Mendes',
    role: 'COLLABORATOR',
    department: 'Operações / Turma A',
    avatar: '',
    email: 'raimundo.mendes@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Operador de Cru'
  },
  {
    id: 'emp-luiz-gomes-a',
    name: 'Luiz Gomes',
    role: 'COLLABORATOR',
    department: 'Laboratório / Turma A',
    avatar: '',
    email: 'luiz.gomes@cimento-flow.com',
    color: 'emerald',
    team: 'A',
    position: 'Laboratorista'
  },

  // --- Turma B ---
  {
    id: 'emp-claudio-b',
    name: 'Claudio Fonseca',
    role: 'COLLABORATOR',
    department: 'Operações / Turma B',
    avatar: '',
    email: 'claudio.fonseca@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-sony-b',
    name: 'Sony Emerson',
    role: 'COLLABORATOR',
    department: 'Operações / Turma B',
    avatar: '',
    email: 'sony.emerson@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-luiz-b',
    name: 'Luiz Antônio',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma B',
    avatar: '',
    email: 'luiz.antonio@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Eletricista'
  },
  {
    id: 'emp-rayone-b',
    name: 'Rayone',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma B',
    avatar: '',
    email: 'rayone@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Mecânico'
  },
  {
    id: 'emp-francisco-b',
    name: 'Francisco',
    role: 'COLLABORATOR',
    department: 'Operações / Turma B',
    avatar: '',
    email: 'francisco.b@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-aristeu-b',
    name: 'Aristeu',
    role: 'COLLABORATOR',
    department: 'Operações / Turma B',
    avatar: '',
    email: 'aristeu@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-raimundo-b',
    name: 'Raimundo Rodrigues',
    role: 'COLLABORATOR',
    department: 'Operações / Turma B',
    avatar: '',
    email: 'raimundo.rodrigues@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Operador de Moagem de Cimento'
  },
  {
    id: 'emp-marcelo-b',
    name: 'Marcelo',
    role: 'COLLABORATOR',
    department: 'Operações / Turma B',
    avatar: '',
    email: 'marcelo@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Operador de Cru'
  },
  {
    id: 'emp-daniel-b',
    name: 'Daniel',
    role: 'COLLABORATOR',
    department: 'Laboratório / Turma B',
    avatar: '',
    email: 'daniel@cimento-flow.com',
    color: 'sky',
    team: 'B',
    position: 'Laboratorista'
  },

  // --- Turma C ---
  {
    id: 'emp-cleison-c',
    name: 'Cleison Duarte',
    role: 'COLLABORATOR',
    department: 'Operações / Turma C',
    avatar: '',
    email: 'cleison.duarte@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-murilo-c',
    name: 'Murilo Mesquita',
    role: 'COLLABORATOR',
    department: 'Operações / Turma C',
    avatar: '',
    email: 'murilo.mesquita@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-clerlandio-c',
    name: 'Clerlandio',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma C',
    avatar: '',
    email: 'clerlandio@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Eletricista'
  },
  {
    id: 'emp-ferista-c',
    name: 'Ferista',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma C',
    avatar: '',
    email: 'ferista@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Mecânico'
  },
  {
    id: 'emp-erasmo-c',
    name: 'Erasmo',
    role: 'COLLABORATOR',
    department: 'Operações / Turma C',
    avatar: '',
    email: 'erasmo@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-david-c',
    name: 'David',
    role: 'COLLABORATOR',
    department: 'Operações / Turma C',
    avatar: '',
    email: 'david@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-joao-c',
    name: 'João Paulo',
    role: 'COLLABORATOR',
    department: 'Operações / Turma C',
    avatar: '',
    email: 'joao.paulo@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Operador de Moagem de Cimento'
  },
  {
    id: 'emp-luiz-c',
    name: 'Luiz Pinto',
    role: 'COLLABORATOR',
    department: 'Operações / Turma C',
    avatar: '',
    email: 'luiz.pinto@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Operador de Cru'
  },
  {
    id: 'emp-jorge-c',
    name: 'Jorge',
    role: 'COLLABORATOR',
    department: 'Laboratório / Turma C',
    avatar: '',
    email: 'jorge@cimento-flow.com',
    color: 'amber',
    team: 'C',
    position: 'Laboratorista'
  },

  // --- Turma D ---
  {
    id: 'emp-alexandre-d',
    name: 'Alexandre',
    role: 'COLLABORATOR',
    department: 'Operações / Turma D',
    avatar: '',
    email: 'alexandre@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-lucas-d',
    name: 'Lucas',
    role: 'COLLABORATOR',
    department: 'Operações / Turma D',
    avatar: '',
    email: 'lucas.d@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Operador de Painel'
  },
  {
    id: 'emp-flaviano-d',
    name: 'Flaviano',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma D',
    avatar: '',
    email: 'flaviano@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Eletricista'
  },
  {
    id: 'emp-renato-d',
    name: 'Renato',
    role: 'COLLABORATOR',
    department: 'Manutenção / Turma D',
    avatar: '',
    email: 'renato@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Mecânico'
  },
  {
    id: 'emp-aristides-d',
    name: 'Aristides',
    role: 'COLLABORATOR',
    department: 'Operações / Turma D',
    avatar: '',
    email: 'aristides@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-luciano-d',
    name: 'Luciano',
    role: 'COLLABORATOR',
    department: 'Operações / Turma D',
    avatar: '',
    email: 'luciano@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Operador de Forno'
  },
  {
    id: 'emp-airton-d',
    name: 'Airton Muniz',
    role: 'COLLABORATOR',
    department: 'Operações / Turma D',
    avatar: '',
    email: 'airton.muniz@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Operador de Moagem de Cimento'
  },
  {
    id: 'emp-roberto-d',
    name: 'Roberto Carlos',
    role: 'COLLABORATOR',
    department: 'Operações / Turma D',
    avatar: '',
    email: 'roberto.carlos@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Operador de Cru'
  },
  {
    id: 'emp-edilson-d',
    name: 'Edilson',
    role: 'COLLABORATOR',
    department: 'Laboratório / Turma D',
    avatar: '',
    email: 'edilson@cimento-flow.com',
    color: 'pink',
    team: 'D',
    position: 'Laboratorista'
  }
];

export const SHIFT_TYPES: ShiftType[] = [
  {
    id: 'sh-manha',
    name: 'Manhã (M)',
    startTime: '06:00',
    endTime: '14:18',
    color: 'emerald-500',
    bgColor: 'bg-emerald-50/70',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700'
  },
  {
    id: 'sh-tarde',
    name: 'Tarde (T)',
    startTime: '14:15',
    endTime: '22:30',
    color: 'sky-500',
    bgColor: 'bg-sky-50/70',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700'
  },
  {
    id: 'sh-noite',
    name: 'Noite (N)',
    startTime: '22:30',
    endTime: '06:00',
    color: 'indigo-500',
    bgColor: 'bg-indigo-50/70',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700'
  },
  {
    id: 'sh-folga',
    name: 'Folga (F)',
    startTime: '-',
    endTime: '-',
    color: 'slate-400',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-500'
  }
];

// Generates initial shifts for July and August 2026.
export function generateInitialShifts(): Shift[] {
  // We generate standard deterministic shifts for July 2026.
  return generateBaseShifts(INITIAL_EMPLOYEES, 2026, 6); // 6 index = July
}

export const INITIAL_SWAP_REQUESTS: SwapRequest[] = [
  {
    id: 'swap-1',
    requesterId: 'emp-celso-a', // Celso Cunha
    requestedShiftId: 'shift-emp-celso-a-2026-07-22', // July 22
    targetShiftId: 'shift-emp-claudio-b-2026-07-22', // Swapping with Claudio's July 22
    receiverId: 'emp-claudio-b',
    status: 'PENDING_RECEIVER',
    createdAt: '2026-07-20T10:00:00Z',
    message: 'Claudio, consegue trocar comigo na quarta-feira? Preciso resolver assuntos familiares pela manhã.'
  },
  {
    id: 'swap-2',
    requesterId: 'emp-sony-b', // Sony Emerson
    requestedShiftId: 'shift-emp-sony-b-2026-07-21', // July 21 (Today)
    targetShiftId: null, // Open swap to anyone!
    receiverId: null,
    status: 'PENDING_ADMIN', // Accepted by someone, now waiting for Admin approval
    createdAt: '2026-07-19T14:30:00Z',
    message: 'Troca em aberto de painel: preciso folgar na terça-feira.'
  }
];


