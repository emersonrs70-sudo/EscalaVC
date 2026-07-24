import React, { useState } from 'react';
import { Search, User, ShieldCheck, Check, X, Users, Briefcase } from 'lucide-react';
import { Colaborador, TurmaId, UserProfile } from '../types';
import { COLABORADORES, TURMAS, getTurmas } from '../data/equipes';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  currentUser: UserProfile | null;
  colaboradores?: Colaborador[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  currentUser,
  colaboradores = COLABORADORES,
}) => {
  const [selectedTurma, setSelectedTurma] = useState<TurmaId | 'TODAS'>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const currentTurmasMap = getTurmas(colaboradores);

  const filteredColaboradores = colaboradores.filter((c) => {
    const matchesTurma = selectedTurma === 'TODAS' || c.turma === selectedTurma;
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTurma && matchesSearch;
  });

  const handleSelectColaborador = (colaborador: Colaborador) => {
    onSelectUser({
      colaboradorId: colaborador.id,
      nome: colaborador.nome,
      cargo: colaborador.cargo,
      turma: colaborador.turma,
      modoAnonimo: false,
    });
    onClose();
  };

  const handleSelectOnlyTurma = (turma: TurmaId) => {
    onSelectUser({
      turma,
      nome: `Visualização Turma ${turma}`,
      cargo: 'Visão Geral da Turma',
      modoAnonimo: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Acesso do Funcionário</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selecione seu nome para consultar sua escala individual e folgas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Turma Selector Bar */}
        <div className="px-5 pt-4 pb-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">
            Filtrar por Turma:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={() => setSelectedTurma('TODAS')}
              className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                selectedTurma === 'TODAS'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
            {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => {
              const turma = currentTurmasMap[tId] || TURMAS[tId];
              const isSelected = selectedTurma === tId;
              return (
                <button
                  key={tId}
                  onClick={() => setSelectedTurma(tId)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    isSelected
                      ? `${turma.badgeCor} border-transparent shadow-xs`
                      : `${turma.bgCor} ${turma.textCor} ${turma.borderCor} hover:opacity-90`
                  }`}
                >
                  Turma {tId}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input */}
        <div className="px-5 py-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador ou cargo (ex: Celso, Eletricista)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Collaborators List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
          {filteredColaboradores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhum colaborador encontrado com os termos digitados.
            </div>
          ) : (
            filteredColaboradores.map((colaborador) => {
              const isCurrent = currentUser?.colaboradorId === colaborador.id;
              const turma = currentTurmasMap[colaborador.turma] || TURMAS[colaborador.turma];

              return (
                <button
                  key={colaborador.id}
                  onClick={() => handleSelectColaborador(colaborador)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    isCurrent
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-1 ring-blue-400'
                      : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${turma.badgeCor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                    >
                      {colaborador.turma}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{colaborador.nome}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-600 text-white font-semibold px-1.5 py-0.2 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{colaborador.cargo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${turma.bgCor} ${turma.textCor} ${turma.borderCor}`}
                    >
                      Turma {colaborador.turma}
                    </span>
                    {isCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Entrar &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer option for general turma login */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Apenas consultar uma turma sem perfil?
          </span>
          <div className="flex items-center gap-1.5">
            {(['A', 'B', 'C', 'D'] as TurmaId[]).map((tId) => (
              <button
                key={tId}
                onClick={() => handleSelectOnlyTurma(tId)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Turma {tId}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
