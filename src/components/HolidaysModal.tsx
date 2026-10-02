import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { Feriado, FeriadoTipo } from '../types';
import { getFeriadosByYear } from '../utils/feriados';

interface HolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  feriadosList: Feriado[];
  selectedYear: number;
  onSaveFeriado: (feriado: Feriado) => Promise<void>;
  onDeleteFeriado: (feriadoId: string) => Promise<void>;
}

export const HolidaysModal: React.FC<HolidaysModalProps> = ({
  isOpen,
  onClose,
  feriadosList,
  selectedYear: initialYear,
  onSaveFeriado,
  onDeleteFeriado,
}) => {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<{
    data: string;
    nome: string;
    tipo: FeriadoTipo;
    descricao: string;
    municipio: string;
  }>({
    data: `${initialYear}-01-01`,
    nome: '',
    tipo: 'MUNICIPAL',
    descricao: '',
    municipio: '',
  });

  if (!isOpen) return null;

  const yearHolidays = getFeriadosByYear(currentYear, feriadosList);

  const filteredHolidays = yearHolidays.filter((f) => {
    const matchesSearch =
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.descricao && f.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.municipio && f.municipio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = filterTipo === 'TODOS' || f.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.data || !formData.nome.trim()) return;

    setIsSubmitting(true);
    try {
      const id = `${formData.data}-${Date.now().toString(36)}`;
      await onSaveFeriado({
        id,
        data: formData.data,
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        descricao: formData.descricao.trim() || undefined,
        municipio: formData.municipio.trim() || undefined,
      });
      setIsAdding(false);
      setFormData({
        data: `${currentYear}-01-01`,
        nome: '',
        tipo: 'MUNICIPAL',
        descricao: '',
        municipio: '',
      });
    } catch (err) {
      console.error('Erro ao salvar feriado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const getTipoBadge = (tipo: FeriadoTipo) => {
    switch (tipo) {
      case 'NACIONAL':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800';
      case 'MUNICIPAL':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
      case 'ESTADUAL':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
      case 'FACULTATIVO':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Feriados & Datas Comemorativas
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Cloud className="w-3 h-3" />
                  Nuvem Ativa
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Feriados com auréola vermelha em destaque na escala mensal
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

        {/* Toolbar: Ano, Busca, Filtro e Botão Novo */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Seletor de Ano */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setCurrentYear((y) => y - 1)}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Ano Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-black text-slate-900 dark:text-white">
                {currentYear}
              </span>
              <button
                onClick={() => setCurrentYear((y) => y + 1)}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Próximo Ano"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Botão Adicionar Feriado */}
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Fechar Cadastro' : 'Novo Feriado Municipal / Local'}</span>
            </button>
          </div>

          {/* Form de Cadastro Rápido de Feriado */}
          {isAdding && (
            <form
              onSubmit={handleFormSubmit}
              className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-3 animate-in fade-in"
            >
              <div className="text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-red-600" />
                <span>Cadastrar Novo Feriado Municipal / Estadual</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Feriado
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Aniversário da Cidade, Padroeira..."
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as FeriadoTipo })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="MUNICIPAL">Municipal</option>
                    <option value="NACIONAL">Nacional</option>
                    <option value="ESTADUAL">Estadual</option>
                    <option value="FACULTATIVO">Facultativo</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Município / Descrição Opcional
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Feriado em conformidade com Decreto Municipal"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar na Nuvem'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, tipo ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
              {['TODOS', 'NACIONAL', 'MUNICIPAL', 'FACULTATIVO'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFilterTipo(tipo)}
                  className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                    filterTipo === tipo
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tipo === 'TODOS' ? 'Todos' : tipo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Feriados */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredHolidays.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhum feriado localizado para os filtros informados em {currentYear}.
            </div>
          ) : (
            filteredHolidays.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800 bg-white dark:bg-slate-800/50 flex items-center justify-between gap-2 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-center shrink-0 w-12 py-1 px-1 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60">
                    <span className="block text-xs font-black text-red-600 dark:text-red-400 leading-tight">
                      {formatDisplayDate(f.data).slice(0, 5)}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {f.data.split('-')[0]}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {f.nome}
                      </h4>
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full border ${getTipoBadge(
                          f.tipo
                        )}`}
                      >
                        {f.tipo}
                      </span>
                    </div>

                    {f.descricao && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {f.descricao}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações (Deletar feriado customizado se não for feriado fixo protegido, ou permitir gerenciar) */}
                <button
                  onClick={() => onDeleteFeriado(f.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0"
                  title="Excluir feriado"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{filteredHolidays.length} feriados listados em {currentYear}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
