import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TurmaId, Colaborador, FeriasPeriodo, Feriado } from '../types';
import { TURMAS, TURNOS_CONFIG } from '../data/equipes';
import { getDaySchedule, formatDateBR } from './escala';
import { getFeriadoForDate } from './feriados';
import { getFeriasForDate } from './ferias';

export interface GeneratePdfOptions {
  month: number; // 0-indexed (0 = Jan, 11 = Dez)
  year: number;
  turmaFilter: TurmaId | 'GERAL';
  colaboradores?: Colaborador[];
  feriasList?: FeriasPeriodo[];
  feriadosList?: Feriado[];
}

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Gera e faz o download direto do PDF oficial da escala mensal
 */
export function generateEscalaPDF({
  month,
  year,
  turmaFilter,
  colaboradores = [],
  feriasList = [],
  feriadosList = [],
}: GeneratePdfOptions): void {
  const isGeral = turmaFilter === 'GERAL';
  const orientation = isGeral ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const monthName = MESES[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Cabeçalho institucional
  doc.setFillColor(30, 41, 59); // slate-800
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ESCALA DE REVEZAMENTO 6x2 - REGIME ININTERRUPTO', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  const scopeLabel = isGeral
    ? 'Visão Geral (Todas as Turmas: A, B, C e D)'
    : `Escala Específica: TURMA ${turmaFilter}`;
  doc.text(`Mês de Referência: ${monthName} de ${year}  |  ${scopeLabel}`, 14, 18);

  // Rodapé com metadados
  const todayStr = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Gerado em ${todayStr} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, doc.internal.pageSize.getHeight() - 8);

  if (isGeral) {
    // ==========================================
    // MODO GERAL (4 TURMAS x 3 HORÁRIOS)
    // ==========================================
    const tableHead = [
      [
        'Dia',
        'Semana',
        '06:00 às 14:18 (Manhã)',
        '14:15 às 22:30 (Tarde)',
        '22:30 às 06:00 (Noite)',
        'Folga (Descanso)',
        'Férias / Observações / Feriados',
      ],
    ];

    const tableBody = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = DIAS_SEMANA_ABREV[date.getDay()];
      const schedule = getDaySchedule(date);
      const feriado = getFeriadoForDate(date, feriadosList);
      const vacations = getFeriasForDate(date, feriasList);

      const turmaManha = `Turma ${schedule.turmaByTurno.MANHA}`;
      const turmaTarde = `Turma ${schedule.turmaByTurno.TARDE}`;
      const turmaNoite = `Turma ${schedule.turmaByTurno.NOITE}`;
      const turmaFolga = `Turma ${schedule.turmaByTurno.FOLGA} (Folga)`;

      const obsList: string[] = [];
      if (feriado) {
        obsList.push(`[FERIADO] ${feriado.nome}`);
      }
      if (vacations.length > 0) {
        vacations.forEach((v) => {
          obsList.push(`Férias: ${v.colaboradorNome} (T-${v.colaboradorTurma}) -> Cobre: ${v.coberturaColaboradorNome}`);
        });
      }

      tableBody.push([
        String(d).padStart(2, '0'),
        dayOfWeek,
        turmaManha,
        turmaTarde,
        turmaNoite,
        turmaFolga,
        obsList.join(' | ') || '-',
      ]);
    }

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 28,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [37, 99, 235], // blue-600
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
        1: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 38 },
        3: { halign: 'center', cellWidth: 38 },
        4: { halign: 'center', cellWidth: 38 },
        5: { halign: 'center', cellWidth: 38, fontStyle: 'bold', textColor: [5, 150, 105] },
        6: { halign: 'left' },
      },
      didParseCell: (data) => {
        // Realça sábados e domingos
        const rowIndex = data.row.index;
        if (data.section === 'body') {
          const d = rowIndex + 1;
          const date = new Date(year, month, d);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const feriado = getFeriadoForDate(date, feriadosList);

          if (feriado) {
            data.cell.styles.fillColor = [254, 242, 242]; // red-50
          } else if (isWeekend) {
            data.cell.styles.fillColor = [248, 250, 252]; // slate-50
          }
        }
      },
    });
  } else {
    // ==========================================
    // MODO TURMA ESPECÍFICA (A, B, C ou D)
    // ==========================================
    const teamMembers = colaboradores.filter((c) => c.turma === turmaFilter);

    // Bloco resumo da equipe
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Composição da Turma ${turmaFilter} (${teamMembers.length} operadores):`, 14, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const namesStr = teamMembers.length > 0
      ? teamMembers.map((m) => `${m.nome} (${m.cargo})`).join(' • ')
      : 'Sem colaboradores registrados';
    doc.text(namesStr, 14, 35, { maxWidth: pageWidth - 28 });

    const tableHead = [
      ['Data', 'Dia da Semana', 'Situação / Turno', 'Horário Oficial', 'Ciclo 6x2', 'Observações'],
    ];

    const tableBody = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = DIAS_SEMANA_ABREV[date.getDay()];
      const schedule = getDaySchedule(date);
      const shift = schedule.shiftsByTurma[turmaFilter];
      const feriado = getFeriadoForDate(date, feriadosList);
      const vacations = getFeriasForDate(date, feriasList).filter(
        (v) => v.colaboradorTurma === turmaFilter
      );

      const isFolga = shift.turno === 'FOLGA';
      const turnoLabel = isFolga ? 'FOLGA' : `TURNO ${TURNOS_CONFIG[shift.turno].nome.toUpperCase()}`;
      const horarioLabel = isFolga ? 'Descanso Semanal Remunerado' : shift.horario;

      const obsList: string[] = [];
      if (feriado) {
        obsList.push(`[FERIADO] ${feriado.nome}`);
      }
      if (vacations.length > 0) {
        vacations.forEach((v) => {
          obsList.push(`Férias: ${v.colaboradorNome} (Substituto: ${v.coberturaColaboradorNome})`);
        });
      }

      tableBody.push([
        `${String(d).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`,
        dayOfWeek,
        turnoLabel,
        horarioLabel,
        shift.diaDescricao,
        obsList.join(' | ') || '-',
      ]);
    }

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 42,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
        1: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 38, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 38 },
        4: { halign: 'center', cellWidth: 28 },
        5: { halign: 'left' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const d = data.row.index + 1;
          const date = new Date(year, month, d);
          const schedule = getDaySchedule(date);
          const isFolga = schedule.shiftsByTurma[turmaFilter].turno === 'FOLGA';
          const feriado = getFeriadoForDate(date, feriadosList);

          if (feriado) {
            data.cell.styles.fillColor = [254, 242, 242]; // red-50
          } else if (isFolga) {
            data.cell.styles.fillColor = [236, 253, 245]; // emerald-50
            if (data.column.index === 2) {
              data.cell.styles.textColor = [4, 120, 87]; // emerald-700
            }
          }
        }
      },
    });
  }

  // Nome limpo para o arquivo
  const cleanFileName = `Escala_6x2_${monthName}_${year}_${
    isGeral ? 'GERAL' : `Turma_${turmaFilter}`
  }.pdf`.replace(/\s+/g, '_');

  doc.save(cleanFileName);
}
