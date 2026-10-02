import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Calendar,
  Filter,
  Check,
  Palmtree,
  Sparkles,
} from 'lucide-react';
import { TurmaId, Colaborador, FeriasPeriodo, Feriado } from '../types';
import { TURMAS } from '../data/equipes';
import { generateEscalaPDF } from '../utils/pdfGenerator';
import { getFeriadosByYear } from '../utils/feriados';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMonth: number;
  initialYear: number;
  initialTurmaFilter?: TurmaId | 'GERAL';
  colaboradores?: Colaborador[];
  feriasList?: FeriasPeriodo[];
  feriadosList?: Feriado[];
}

const MONTH_NAMES = [
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

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  initialMonth,
  initialYear,
  initialTurmaFilter = 'GERAL',
  colaboradores = [],
  feriasList = [],
  feriadosList = [],
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedTurma, setSelectedTurma] = useState<TurmaId | 'GERAL'>(initialTurmaFilter);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const handleDownload = () => {
    setIsGenerating(true);
    setDownloadCompleted(false);

    try {
      generateEscalaPDF({
        month: selectedMonth,
        year: selectedYear,
        turmaFilter: selectedTurma,
        colaboradores,
        feriasList,
        feriadosList,
      });
      setDownloadCompleted(true);
      setTimeout(() => {
        setDownloadCompleted(false);
      }, 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF da escala:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quantidade de feriados e férias no mês selecionado
  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const holidaysInMonth = feriadosList.filter((f) => f.data.startsWith(monthPrefix));

  const teamMembers =
    selectedTurma === 'GERAL'
      ? colaboradores
      : colaboradores.filter((c) => c.turma === selectedTurma);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Baixar Escala em PDF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere documento em alta resolução para impressão e compartilhamento
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

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* 1. Escolha do Mês e Ano */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Selecione o Mês e Ano:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Ano {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Escolha do Escopo: Geral ou Turma Específica */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              2. Escolha o Formato da Escala:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Opção Geral */}
              <button
                type="button"
                onClick={() => setSelectedTurma('GERAL')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedTurma === 'GERAL'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Visão Geral
                  </span>
                  {selectedTurma === 'GERAL' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Todas as 4 Turmas (A, B, C e D) e os 3 horários operacionais lado a lado em folha paisagem.
                </p>
              </button>

              {/* Turma Específica Selector */}
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white mb-1.5">
                  Turma Específica:
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
                    const isSelected = selectedTurma === tId;
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setSelectedTurma(tId)}
                        className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                          isSelected
                            ? `${TURMAS[tId].badgeCor} shadow-xs ring-2 ring-slate-900 dark:ring-white`
                            : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        Turma {tId}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do que será exportado */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Resumo do Documento:</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">PDF Oficial A4</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
              <div>
                • <strong>Período:</strong> {MONTH_NAMES[selectedMonth]} de {selectedYear}
              </div>
              <div>
                • <strong>Escopo:</strong>{' '}
                {selectedTurma === 'GERAL'
                  ? 'Todas as 4 turmas (06h, 14h, 22h e folgas)'
                  : `Apenas Turma ${selectedTurma} com listagem da equipe`}
              </div>
              {holidaysInMonth.length > 0 && (
                <div className="text-red-700 dark:text-red-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{holidaysInMonth.length} feriado(s) incluído(s) no mês</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            {downloadCompleted ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>PDF Baixado com Sucesso!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Gerando PDF...' : 'Baixar Arquivo PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
