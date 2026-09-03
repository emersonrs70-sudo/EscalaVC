import React, { useState } from 'react';
import {
  X,
  Palmtree,
  Calendar,
  UserCheck,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Users,
  UserPlus,
  Building2,
} from 'lucide-react';
import { Colaborador, FeriasPeriodo, TurmaId } from '../types';
import { TURMAS } from '../data/equipes';
import {
  calculateDaysCount,
  formatDateToIso,
  parseIsoDate,
  updateFeriasStatus,
} from '../utils/ferias';
import { formatDateBR } from '../utils/escala';

interface VacationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  colaboradores: Colaborador[];
  feriasList: FeriasPeriodo[];
  onSaveFerias: (ferias: FeriasPeriodo[]) => void;
  initialColaboradorId?: string;
}

export const VacationManagementModal: React.FC<VacationManagementModalProps> = ({
  isOpen,
  onClose,
  colaboradores,
  feriasList,
  onSaveFerias,
  initialColaboradorId,
}) => {
  const [activeTab, setActiveTab] = useState<'LISTA' | 'CADASTRAR'>('LISTA');
  const [filterStatus, setFilterStatus] = useState<'TODAS' | 'EM_ANDAMENTO' | 'AGENDADA' | 'CONCLUIDA'>('TODAS');

  // Form State
  const [colaboradorId, setColaboradorId] = useState<string>(initialColaboradorId || (colaboradores[0]?.id || ''));
  
  // Cobertura mode: 'EXISTENTE' (Turmas A/B/C/D) or 'NOVO_EXTERNO' (Outro Setor / Novo)
  const [coberturaTipo, setCoberturaTipo] = useState<'EXISTENTE' | 'NOVO_EXTERNO'>('EXISTENTE');
  const [coberturaColaboradorId, setCoberturaColaboradorId] = useState<string>('');
  
  // Fields for external / new collaborator from another sector
  const [novoNome, setNovoNome] = useState<string>('');
  const [novoCargo, setNovoCargo] = useState<string>('');
  const [novoSetor, setNovoSetor] = useState<string>('Outro Setor');

  // Deletion inline confirmation state (replaces window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string>('');

  const [dataInicio, setDataInicio] = useState<string>(() => {
    const d = new Date();
    return formatDateToIso(d);
  });
  const [dataFim, setDataFim] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 19); // default 20 days
    return formatDateToIso(d);
  });
  const [observacoes, setObservacoes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const selectedColaborador = colaboradores.find((c) => c.id === colaboradorId);
  const selectedCobertura = colaboradores.find((c) => c.id === coberturaColaboradorId);

  // Available covering employees from existing roster (excluding the employee going on vacation)
  const availableSubstitutes = colaboradores.filter((c) => c.id !== colaboradorId);

  // Quick preset duration helper
  const handleApplyPresetDays = (days: number) => {
    try {
      const start = parseIsoDate(dataInicio);
      const end = new Date(start);
      end.setDate(end.getDate() + (days - 1));
      setDataFim(formatDateToIso(end));
    } catch {
      // ignore
    }
  };

  const handleCreateFerias = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!selectedColaborador) {
      setFormError('Por favor, selecione o colaborador que entrará em férias.');
      return;
    }

    if (!dataInicio || !dataFim) {
      setFormError('Preencha as datas de início e término das férias.');
      return;
    }

    if (dataFim < dataInicio) {
      setFormError('A data de término não pode ser anterior à data de início.');
      return;
    }

    let coberturaIdFinal = '';
    let coberturaNomeFinal = '';
    let coberturaTurmaFinal: string | undefined = undefined;
    let coberturaCargoFinal = '';
    let coberturaSetorFinal: string | undefined = undefined;
    let coberturaIsExternoFinal = false;

    if (coberturaTipo === 'EXISTENTE') {
      if (!selectedCobertura) {
        setFormError('É obrigatório indicar um colaborador substituto da escala para cobrir o período de férias.');
        return;
      }

      if (colaboradorId === coberturaColaboradorId) {
        setFormError('O colaborador substituto não pode ser o mesmo que está saindo de férias.');
        return;
      }

      // Check if the covering employee already has overlapping vacation during this period
      const overlapVacation = feriasList.find(
        (f) =>
          f.colaboradorId === coberturaColaboradorId &&
          !(dataFim < f.dataInicio || dataInicio > f.dataFim)
      );

      if (overlapVacation) {
        setFormError(
          `Atenção: O colaborador de cobertura selecionado (${selectedCobertura.nome}) já possui férias agendadas neste mesmo período (${formatDateBR(parseIsoDate(overlapVacation.dataInicio))} a ${formatDateBR(parseIsoDate(overlapVacation.dataFim))}). Escolha outro substituto ou utilize a opção "Outro Setor".`
        );
        return;
      }

      coberturaIdFinal = selectedCobertura.id;
      coberturaNomeFinal = selectedCobertura.nome;
      coberturaTurmaFinal = selectedCobertura.turma;
      coberturaCargoFinal = selectedCobertura.cargo;
      coberturaSetorFinal = `Turma ${selectedCobertura.turma}`;
      coberturaIsExternoFinal = false;
    } else {
      // Cobertura vindo de outro setor / externo
      if (!novoNome.trim()) {
        setFormError('Por favor, preencha o nome do colaborador que virá de outro setor para cobrir as férias.');
        return;
      }

      coberturaIdFinal = `ext-${Date.now()}`;
      coberturaNomeFinal = novoNome.trim();
      coberturaTurmaFinal = 'EXTERNO';
      coberturaCargoFinal = novoCargo.trim() || selectedColaborador.cargo || 'Colaborador Substituto';
      coberturaSetorFinal = novoSetor.trim() || 'Outro Setor';
      coberturaIsExternoFinal = true;
    }

    const newRecord: FeriasPeriodo = updateFeriasStatus({
      id: `ferias-${Date.now()}`,
      colaboradorId: selectedColaborador.id,
      colaboradorNome: selectedColaborador.nome,
      colaboradorTurma: selectedColaborador.turma,
      colaboradorCargo: selectedColaborador.cargo,
      dataInicio,
      dataFim,
      coberturaColaboradorId: coberturaIdFinal,
      coberturaColaboradorNome: coberturaNomeFinal,
      coberturaTurmaOrigem: coberturaTurmaFinal,
      coberturaCargo: coberturaCargoFinal,
      coberturaSetorOrigem: coberturaSetorFinal,
      coberturaIsExterno: coberturaIsExternoFinal,
      observacoes: observacoes.trim() || undefined,
      status: 'AGENDADA',
    });

    const updated = [newRecord, ...feriasList];
    onSaveFerias(updated);

    const origemTexto = coberturaIsExternoFinal ? `(${coberturaSetorFinal})` : `(Turma ${coberturaTurmaFinal})`;
    setSuccessMessage(`Férias de ${selectedColaborador.nome} cadastradas com sucesso! Cobertura por ${coberturaNomeFinal} ${origemTexto}.`);
    setObservacoes('');
    setNovoNome('');
    setNovoCargo('');
    setTimeout(() => {
      setSuccessMessage('');
      setActiveTab('LISTA');
    }, 1800);
  };

  const handleDeleteConfirmed = (id: string, nome: string) => {
    const updated = feriasList.filter((f) => f.id !== id);
    onSaveFerias(updated);
    setConfirmDeleteId(null);
    setDeleteFeedback(`O registro de férias de ${nome} foi excluído com sucesso.`);
    setTimeout(() => {
      setDeleteFeedback('');
    }, 3500);
  };

  const filteredFerias = feriasList.filter((f) => {
    if (filterStatus === 'TODAS') return true;
    return f.status === filterStatus;
  });

  const daysCount = calculateDaysCount(dataInicio, dataFim);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header with High Contrast */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <Palmtree className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Gestão de Férias & Coberturas
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  6x2 Shift
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium truncate">
                Cadastre férias e designe colaboradores para cobrir os turnos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/15 hover:bg-black/30 text-white transition-colors"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('LISTA')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'LISTA'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Períodos Cadastrados</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px]">
                {feriasList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('CADASTRAR')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'CADASTRAR'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Férias</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'LISTA' ? (
            <div className="space-y-4">
              {/* Deletion feedback toast banner */}
              {deleteFeedback && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>{deleteFeedback}</span>
                </div>
              )}

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mr-1">Filtrar:</span>
                {(['TODAS', 'EM_ANDAMENTO', 'AGENDADA', 'CONCLUIDA'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 border ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st === 'TODAS' && 'Todas'}
                    {st === 'EM_ANDAMENTO' && '🟢 Em Andamento'}
                    {st === 'AGENDADA' && '🔵 Agendadas'}
                    {st === 'CONCLUIDA' && '⚪ Concluídas'}
                  </button>
                ))}
              </div>

              {filteredFerias.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
                    <Palmtree className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Nenhum período de férias encontrado neste filtro.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Clique em "Cadastrar Férias" para agendar o descanso de um integrante e definir quem cobrirá seu posto.
                  </p>
                  <button
                    onClick={() => setActiveTab('CADASTRAR')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Cadastrar Novo Período
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFerias.map((item) => {
                    const days = calculateDaysCount(item.dataInicio, item.dataFim);
                    const isEmAndamento = item.status === 'EM_ANDAMENTO';
                    const isAgendada = item.status === 'AGENDADA';
                    const isTurmaSub = item.coberturaTurmaOrigem && (item.coberturaTurmaOrigem in TURMAS);

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                          isEmAndamento
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 shadow-xs'
                            : isAgendada
                            ? 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                isEmAndamento
                                  ? 'bg-emerald-500 text-white animate-pulse'
                                  : isAgendada
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-400 text-white'
                              }`}
                            >
                              {isEmAndamento && 'Em Andamento'}
                              {isAgendada && 'Agendada'}
                              {item.status === 'CONCLUIDA' && 'Concluída'}
                            </span>

                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {days} dias ({formatDateBR(parseIsoDate(item.dataInicio))} até {formatDateBR(parseIsoDate(item.dataFim))})
                            </span>
                          </div>

                          {/* Action: Excluir com confirmação inline confiável */}
                          <div>
                            {confirmDeleteId === item.id ? (
                              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/70 p-1.5 rounded-xl border border-red-300 dark:border-red-800 animate-in fade-in">
                                <span className="text-[11px] font-bold text-red-700 dark:text-red-300">
                                  Excluir?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteConfirmed(item.id, item.colaboradorNome)}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Sim, Excluir</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-lg transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(item.id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 transition-all active:scale-95"
                                title="Excluir este período de férias"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Details grid: Colaborador -> Cobertura */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          {/* Colaborador em férias */}
                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                              <Palmtree className="w-3 h-3" /> Colaborador em Férias:
                            </div>
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                              {item.colaboradorNome}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${TURMAS[item.colaboradorTurma].badgeCor}`}>
                                Turma {item.colaboradorTurma}
                              </span>
                              <span>{item.colaboradorCargo}</span>
                            </div>
                          </div>

                          {/* Substituto escalado para cobertura */}
                          <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Substituto Designado (Cobertura):
                            </div>
                            <div className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">
                              {item.coberturaColaboradorNome}
                            </div>
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {isTurmaSub ? (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${TURMAS[item.coberturaTurmaOrigem as TurmaId].badgeCor}`}>
                                  Turma {item.coberturaTurmaOrigem}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  {item.coberturaSetorOrigem || 'Outro Setor'}
                                </span>
                              )}
                              <span>{item.coberturaCargo}</span>
                            </div>
                          </div>
                        </div>

                        {item.observacoes && (
                          <div className="mt-2.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/60 p-2 rounded-lg italic">
                            💬 "{item.observacoes}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Formulário de Cadastro de Férias e Cobertura */
            <form onSubmit={handleCreateFerias} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Passo 1: Colaborador em Férias */}
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  1. Colaborador que entrará de férias: <span className="text-red-500">*</span>
                </label>
                <select
                  value={colaboradorId}
                  onChange={(e) => {
                    setColaboradorId(e.target.value);
                    if (coberturaColaboradorId === e.target.value) {
                      setCoberturaColaboradorId('');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                >
                  {colaboradores.map((colab) => (
                    <option key={colab.id} value={colab.id}>
                      {colab.nome} — {colab.cargo} (Turma {colab.turma})
                    </option>
                  ))}
                </select>

                {selectedColaborador && (
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    Titular da <strong>Turma {selectedColaborador.turma}</strong> na função de{' '}
                    <strong>{selectedColaborador.cargo}</strong>.
                  </div>
                )}
              </div>

              {/* Passo 2: Período de Férias */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    2. Período das férias: <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                    Total: {daysCount} dias
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Data Início:
                    </span>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Data Término:
                    </span>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Duração rápida:</span>
                  {[10, 15, 20, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleApplyPresetDays(d)}
                      className={`px-2 py-0.5 rounded-lg border font-bold transition-colors ${
                        daysCount === d
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{d} dias
                    </button>
                  ))}
                </div>
              </div>

              {/* Passo 3: Colaborador para Cobertura (Substituto Obrigatório) */}
              <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    3. Colaborador para COBRIR o período de férias: <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full">
                    Obrigatório
                  </span>
                </div>

                {/* Substituto Type Switcher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoberturaTipo('EXISTENTE')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      coberturaTipo === 'EXISTENTE'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">Colaborador da Escala</div>
                      <div className={`text-[10px] truncate ${coberturaTipo === 'EXISTENTE' ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        Das Turmas A, B, C ou D
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoberturaTipo('NOVO_EXTERNO')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      coberturaTipo === 'NOVO_EXTERNO'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">Outro Setor / Novo</div>
                      <div className={`text-[10px] truncate ${coberturaTipo === 'NOVO_EXTERNO' ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        Sem turma fixa ou externo
                      </div>
                    </div>
                  </button>
                </div>

                {coberturaTipo === 'EXISTENTE' ? (
                  /* Option A: Select from existing employees */
                  <div className="space-y-2 pt-1">
                    <select
                      value={coberturaColaboradorId}
                      onChange={(e) => setCoberturaColaboradorId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">-- Selecione o colaborador substituto --</option>
                      {availableSubstitutes.map((colab) => {
                        const isSameCargo = selectedColaborador?.cargo.toLowerCase() === colab.cargo.toLowerCase();
                        return (
                          <option key={colab.id} value={colab.id}>
                            {isSameCargo ? '⭐ ' : ''}
                            {colab.nome} — {colab.cargo} (Turma {colab.turma})
                            {isSameCargo ? ' [Mesmo Cargo Recomendado]' : ''}
                          </option>
                        );
                      })}
                    </select>

                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      💡 Os operadores com <strong>⭐</strong> possuem a mesma função ({selectedColaborador?.cargo}), sendo os mais indicados para manter a continuidade do posto.
                    </div>
                  </div>
                ) : (
                  /* Option B: Insert new or external collaborator from another sector */
                  <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                    <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Substituto de Outro Setor (Sem Turma Fixa):</span>
                      </div>
                      <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                        Este colaborador cobrirá os plantões da <strong>Turma {selectedColaborador?.turma}</strong> durante as férias de {selectedColaborador?.nome}, sem precisar estar inscrito em nenhuma das 4 turmas fixas.
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nome Completo do Substituto: <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="text"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        placeholder="Ex: Carlos Eduardo Oliveira, Marcos Antônio..."
                        className="w-full p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Função / Cargo:
                        </span>
                        <input
                          type="text"
                          value={novoCargo}
                          onChange={(e) => setNovoCargo(e.target.value)}
                          placeholder={selectedColaborador ? `Padrão: ${selectedColaborador.cargo}` : 'Ex: Operador Substituto'}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Setor de Origem:
                        </span>
                        <input
                          type="text"
                          value={novoSetor}
                          onChange={(e) => setNovoSetor(e.target.value)}
                          placeholder="Ex: Outro Setor, Manutenção..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick origin chips */}
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap text-[11px]">
                      <span className="text-slate-400 font-medium">Sugestões de setor:</span>
                      {['Outro Setor', 'Manutenção', 'Utilidades', 'Apoio Operacional', 'Temporário'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setNovoSetor(chip)}
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors ${
                            novoSetor === chip
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações e alinhamentos operacionais:
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Turno integral coberto na Turma A; alinhado com a supervisão..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Preview Box */}
              {selectedColaborador && (coberturaTipo === 'EXISTENTE' ? selectedCobertura : novoNome.trim()) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Resumo do Agendamento:</span>
                  </div>
                  <p className="text-blue-800 dark:text-blue-300 leading-normal">
                    <strong>{selectedColaborador.nome}</strong> (Turma {selectedColaborador.turma}) estará de férias de{' '}
                    <strong>{formatDateBR(parseIsoDate(dataInicio))}</strong> até{' '}
                    <strong>{formatDateBR(parseIsoDate(dataFim))}</strong> ({daysCount} dias). Seus turnos e escala serão cobertos por{' '}
                    <strong>{coberturaTipo === 'EXISTENTE' ? selectedCobertura?.nome : novoNome.trim()}</strong>{' '}
                    ({coberturaTipo === 'EXISTENTE' ? `Turma ${selectedCobertura?.turma}` : (novoSetor.trim() || 'Outro Setor')}).
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('LISTA')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Salvar Férias</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
