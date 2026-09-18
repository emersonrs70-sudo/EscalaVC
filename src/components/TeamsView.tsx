import React, { useState } from 'react';
import { Employee } from '../types';
import { 
  Users, 
  Edit3, 
  Shield, 
  ArrowRightLeft, 
  Save, 
  X, 
  UserPlus, 
  Lock,
  Compass,
  User
} from 'lucide-react';

interface TeamsViewProps {
  employees: Employee[];
  currentUser: Employee;
  onUpdateEmployees: (updatedEmployees: Employee[]) => void;
}

const POSITIONS = [
  'Operador de Painel',
  'Eletricista',
  'Mecânico',
  'Laboratorista',
  'Operador de Forno',
  'Operador de Moagem de Cimento',
  'Operador de Cru'
];

export default function TeamsView({ employees, currentUser, onUpdateEmployees }: TeamsViewProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editTeam, setEditTeam] = useState<'A' | 'B' | 'C' | 'D' | 'N/A'>('A');
  const [editEmail, setEditEmail] = useState('');

  const isAdmin = currentUser.role === 'ADMIN';

  // Group employees by team
  const teams: Record<'A' | 'B' | 'C' | 'D', Employee[]> = {
    A: employees.filter(e => e.team === 'A'),
    B: employees.filter(e => e.team === 'B'),
    C: employees.filter(e => e.team === 'C'),
    D: employees.filter(e => e.team === 'D'),
  };

  const handleStartEdit = (emp: Employee) => {
    if (!isAdmin) return;
    setEditingEmployee(emp);
    setEditName(emp.name);
    setEditPosition(emp.position || '');
    setEditTeam(emp.team || 'A');
    setEditEmail(emp.email);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const updated = employees.map(emp => {
      if (emp.id === editingEmployee.id) {
        return {
          ...emp,
          name: editName,
          position: editPosition,
          team: editTeam,
          email: editEmail,
          department: editTeam === 'N/A' 
            ? 'Supervisão Geral' 
            : `${editPosition === 'Eletricista' || editPosition === 'Mecânico' ? 'Manutenção' : 'Operações'} / Turma ${editTeam}`
        };
      }
      return emp;
    });

    onUpdateEmployees(updated);
    setEditingEmployee(null);
  };

  const getTeamColorClass = (team: string) => {
    switch(team) {
      case 'A': return 'border-emerald-200 bg-emerald-50/10 text-emerald-700';
      case 'B': return 'border-sky-200 bg-sky-50/10 text-sky-700';
      case 'C': return 'border-amber-200 bg-amber-50/10 text-amber-700';
      case 'D': return 'border-pink-200 bg-pink-50/10 text-pink-700';
      default: return 'border-slate-200 bg-slate-50 text-slate-700';
    }
  };

  const getTeamHeaderBg = (team: string) => {
    switch(team) {
      case 'A': return 'bg-gradient-to-r from-emerald-600 to-emerald-500';
      case 'B': return 'bg-gradient-to-r from-sky-600 to-sky-500';
      case 'C': return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 'D': return 'bg-gradient-to-r from-pink-600 to-pink-500';
      default: return 'bg-slate-700';
    }
  };

  const getTeamBadgeColor = (team: string) => {
    switch(team) {
      case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'B': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'C': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'D': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all duration-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-indigo-600" size={24} />
            Gestão de Turmas e Composição Operacional
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Visualização das 4 equipes de plantão contínuo. {isAdmin ? 'Você possui privilégios de administrador para alterar colaboradores, cargos e turmas.' : 'Como colaborador, você pode consultar a composição de cada turma.'}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1.5">
            <Compass size={14} className="animate-spin-slow" />
            Escala Rotativa 6x2 Ativa
          </span>
        </div>
      </div>

      {/* Bento Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['A', 'B', 'C', 'D'] as const).map(teamKey => {
          const members = teams[teamKey] || [];
          const leaders = members.filter(m => m.position === 'Operador de Painel');
          const others = members.filter(m => m.position !== 'Operador de Painel');
          const orderedMembers = [...leaders, ...others];

          return (
            <div 
              key={teamKey} 
              className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col`}
            >
              {/* Team Card Header */}
              <div className={`${getTeamHeaderBg(teamKey)} p-5 text-white flex justify-between items-center`}>
                <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                    Turma {teamKey}
                  </h3>
                  <p className="text-white/80 text-[11px] font-medium uppercase tracking-wider">
                    {members.length} Colaboradores Ativos • Escala 6x2
                  </p>
                </div>
              </div>

              {/* Members List */}
              <div className="p-5 flex-1 divide-y divide-slate-100">
                {orderedMembers.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-6">Nenhum colaborador nesta turma.</p>
                ) : (
                  orderedMembers.map(emp => {
                    const isLeader = emp.position === 'Operador de Painel';
                    return (
                      <div 
                        key={emp.id} 
                        className={`py-3.5 flex items-center justify-between gap-3 group transition-colors duration-150 ${
                          isAdmin ? 'hover:bg-slate-50/50 -mx-5 px-5 cursor-pointer' : ''
                        }`}
                        onClick={() => handleStartEdit(emp)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {emp.avatar ? (
                              <img 
                                src={emp.avatar} 
                                alt={emp.name} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-2xs shrink-0 text-slate-500">
                                <User size={18} />
                              </div>
                            )}
                            {isLeader && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-[8px] text-white flex items-center justify-center border border-white font-bold" title="Líder de Turma">
                                L
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{emp.name}</span>
                              {isLeader && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase rounded tracking-wider border border-indigo-100">
                                  Líder / Painel
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{emp.position}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getTeamBadgeColor(teamKey)}`}>
                            {emp.team}
                          </span>
                          {isAdmin ? (
                            <button 
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(emp);
                              }}
                            >
                              <Edit3 size={14} />
                            </button>
                          ) : (
                            <Lock size={12} className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Editar Colaborador</h3>
                <p className="text-slate-400 text-xs mt-0.5">Altere os dados de cadastro e locação de turma</p>
              </div>
              <button 
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Cargo / Função
                  </label>
                  <select
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    {POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Alocar na Turma
                  </label>
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="A">Turma A</option>
                    <option value="B">Turma B</option>
                    <option value="C">Turma C</option>
                    <option value="D">Turma D</option>
                  </select>
                </div>
              </div>

              {/* Alert message about schedule impact */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 flex gap-2">
                <span className="font-bold shrink-0">⚠️ Nota:</span>
                <span>
                  Mudar o colaborador de turma alterará automaticamente sua escala de plantão contínuo de forma imediata (passada, presente e futura) para a escala rotativa da nova turma.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Save size={14} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
