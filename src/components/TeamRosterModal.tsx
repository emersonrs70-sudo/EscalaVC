import React, { useState } from 'react';
import { X, Users, Search, Briefcase, Plus, Trash2, Edit2, RotateCcw, Check, UserPlus } from 'lucide-react';
import { Colaborador, TurmaId } from '../types';
import { TURMAS, getTurmas } from '../data/equipes';

interface TeamRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  colaboradores: Colaborador[];
  onUpdateColaborador: (updated: Colaborador) => void;
  onAddColaborador: (newColab: Omit<Colaborador, 'id'>) => void;
  onDeleteColaborador: (id: string) => void;
  onResetColaboradores: () => void;
}

export const TeamRosterModal: React.FC<TeamRosterModalProps> = ({
  isOpen,
  onClose,
  colaboradores,
  onUpdateColaborador,
  onAddColaborador,
  onDeleteColaborador,
  onResetColaboradores,
}) => {
  const [activeTab, setActiveTab] = useState<TurmaId | 'TODAS'>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state for a specific collaborator
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editTurma, setEditTurma] = useState<TurmaId>('A');

  // Add New Collaborator state
  const [isAdding, setIsAdding] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newCargo, setNewCargo] = useState('Operador de painel');
  const [newTurma, setNewTurma] = useState<TurmaId>('A');

  if (!isOpen) return null;

  const currentTurmasMap = getTurmas(colaboradores);

  const filteredColaboradores = colaboradores.filter((c) => {
    const matchesTurma = activeTab === 'TODAS' || c.turma === activeTab;
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTurma && matchesSearch;
  });

  const startEditing = (colab: Colaborador) => {
    setEditingId(colab.id);
    setEditNome(colab.nome);
    setEditCargo(colab.cargo);
    setEditTurma(colab.turma);
  };

  const saveEditing = () => {
    if (!editingId || !editNome.trim()) return;
    onUpdateColaborador({
      id: editingId,
      nome: editNome.trim(),
      cargo: editCargo.trim() || 'Operador',
      turma: editTurma,
    });
    setEditingId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim()) return;
    onAddColaborador({
      nome: newNome.trim(),
      cargo: newCargo.trim() || 'Operador de painel',
      turma: newTurma,
    });
    setNewNome('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Composição das Equipes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie e altere colaboradores entre as turmas (A, B, C e D)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Member Drawer Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateNew}
            className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 animate-in slide-in-from-top duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Cadastrar Novo Colaborador</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nome do operador..."
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Cargo (ex: Eletricista)..."
                value={newCargo}
                onChange={(e) => setNewCargo(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <div className="flex gap-1.5">
                <select
                  value={newTurma}
                  onChange={(e) => setNewTurma(e.target.value as TurmaId)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="A">Turma A</option>
                  <option value="B">Turma B</option>
                  <option value="C">Turma C</option>
                  <option value="D">Turma D</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              activeTab === 'TODAS'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Todas ({colaboradores.length})
          </button>

          {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
            const tInfo = currentTurmasMap[tId];
            const isSelected = activeTab === tId;

            return (
              <button
                key={tId}
                onClick={() => setActiveTab(tId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  isSelected
                    ? `${tInfo.badgeCor} border-transparent shadow-xs`
                    : `${tInfo.bgCor} ${tInfo.textCor} ${tInfo.borderCor}`
                }`}
              >
                Turma {tId} ({tInfo.colaboradores.length})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="px-4 sm:px-5 py-1.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou cargo (ex: Forno, Eletricista)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Roster List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 space-y-2">
          {filteredColaboradores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhum colaborador encontrado nesta busca.
            </div>
          ) : (
            filteredColaboradores.map((colab) => {
              const tInfo = currentTurmasMap[colab.turma] || TURMAS[colab.turma];
              const isEditing = editingId === colab.id;

              return (
                <div
                  key={colab.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {isEditing ? (
                    /* Inline Edit View */
                    <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="w-full sm:flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
                        placeholder="Nome"
                      />
                      <input
                        type="text"
                        value={editCargo}
                        onChange={(e) => setEditCargo(e.target.value)}
                        className="w-full sm:flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                        placeholder="Cargo"
                      />
                      <select
                        value={editTurma}
                        onChange={(e) => setEditTurma(e.target.value as TurmaId)}
                        className="w-full sm:w-auto px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
                      >
                        <option value="A">Turma A</option>
                        <option value="B">Turma B</option>
                        <option value="C">Turma C</option>
                        <option value="D">Turma D</option>
                      </select>
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <button
                          onClick={saveEditing}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          title="Salvar alterações"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display View */
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg ${tInfo.badgeCor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                        >
                          {colab.turma}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {colab.nome}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span>{colab.cargo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Quick Switch & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Move Team Quick Dropdown */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-400 hidden xs:inline">
                            Mudar:
                          </span>
                          <select
                            value={colab.turma}
                            onChange={(e) =>
                              onUpdateColaborador({
                                ...colab,
                                turma: e.target.value as TurmaId,
                              })
                            }
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors ${tInfo.bgCor} ${tInfo.textCor} ${tInfo.borderCor}`}
                            title="Mudar este colaborador para outra equipe"
                          >
                            <option value="A">Turma A</option>
                            <option value="B">Turma B</option>
                            <option value="C">Turma C</option>
                            <option value="D">Turma D</option>
                          </select>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => startEditing(colab)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="Editar nome ou cargo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Tem certeza que deseja remover ${colab.nome} da equipe?`
                              )
                            ) {
                              onDeleteColaborador(colab.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          title="Remover colaborador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Deseja restaurar as 4 equipes e todos os colaboradores para o padrão original do sistema?'
                )
              ) {
                onResetColaboradores();
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            title="Restaurar lista original de colaboradores"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Restaurar Padrão</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

