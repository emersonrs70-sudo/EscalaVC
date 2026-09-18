import React from 'react';
import { 
  ShieldAlert, 
  Check, 
  X, 
  AlertCircle, 
  ArrowRightLeft, 
  Users, 
  Clock, 
  Calendar,
  RotateCcw,
  Plus,
  User
} from 'lucide-react';
import { Employee, Shift, ShiftType, SwapRequest } from '../types';

interface AdminPortalProps {
  currentUser: Employee;
  employees: Employee[];
  shifts: Shift[];
  shiftTypes: ShiftType[];
  swapRequests: SwapRequest[];
  onApproveSwap: (requestId: string, approve: boolean) => void;
  onResetData: () => void;
}

export default function AdminPortal({
  currentUser,
  employees,
  shifts,
  shiftTypes,
  swapRequests,
  onApproveSwap,
  onResetData
}: AdminPortalProps) {
  // Pending Admin Approval Requests
  const pendingApprovals = swapRequests.filter(r => r.status === 'PENDING_ADMIN');

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all duration-200">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <ShieldAlert size={26} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Portal de Homologação e Gestão</h2>
          <p className="text-slate-400 text-xs">Visão restrita de coordenação para aprovação de trocas e auditoria de cobertura</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Approvals list (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Trocas Aguardando Homologação</h3>
              <p className="text-slate-400 text-xs">Estas trocas já foram acordadas por ambas as partes e aguardam validação legal da coordenação</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold font-mono text-xs rounded-md">
              {pendingApprovals.length} Pendentes
            </span>
          </div>

          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={22} />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Tudo em dia!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
                  Nenhuma solicitação de troca pendente de homologação neste momento.
                </p>
              </div>
            ) : (
              pendingApprovals.map((req) => {
                const requester = employees.find(e => e.id === req.requesterId);
                const receiver = employees.find(e => e.id === req.receiverId);
                const reqShift = shifts.find(s => s.id === req.requestedShiftId);
                const targetShift = shifts.find(s => s.id === req.targetShiftId);

                const reqShiftType = reqShift ? shiftTypes.find(t => t.id === reqShift.shiftTypeId) : null;
                const targetShiftType = targetShift ? shiftTypes.find(t => t.id === targetShift.shiftTypeId) : null;

                return (
                  <div key={req.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4 shadow-2xs">
                    
                    {/* Visual Comparison: Swap Exchange */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3">
                      
                      {/* Person 1: Requester */}
                      <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-100 text-center">
                        {requester?.avatar ? (
                          <img 
                            src={requester.avatar} 
                            alt={requester.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover mx-auto mb-2 border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/50 text-slate-500 flex items-center justify-center mx-auto mb-2 shrink-0">
                            <User size={18} />
                          </div>
                        )}
                        <h4 className="font-bold text-slate-800 text-xs truncate">{requester?.name}</h4>
                        <span className="text-[10px] text-slate-400 block">{requester?.position} - Turma {requester?.team}</span>
                        
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Vai Sair Do Plantão:</span>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${reqShiftType?.textColor} ${reqShiftType?.bgColor} border ${reqShiftType?.borderColor}`}>
                            Dia {reqShift?.date.split('-')[2]}/07 - {reqShiftType?.name}
                          </span>
                        </div>
                      </div>

                      {/* Swap Direction Indicator */}
                      <div className="text-center sm:col-span-1 flex flex-col items-center justify-center">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-xs border border-indigo-100">
                          <ArrowRightLeft size={16} />
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Permuta</span>
                      </div>

                      {/* Person 2: Receiver */}
                      <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-100 text-center">
                        {receiver?.avatar ? (
                          <img 
                            src={receiver.avatar} 
                            alt={receiver.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover mx-auto mb-2 border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/50 text-slate-500 flex items-center justify-center mx-auto mb-2 shrink-0">
                            <User size={18} />
                          </div>
                        )}
                        <h4 className="font-bold text-slate-800 text-xs truncate">{receiver?.name}</h4>
                        <span className="text-[10px] text-slate-400 block">{receiver?.position} - Turma {receiver?.team}</span>

                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Vai Assumir O Plantão:</span>
                          {targetShift && targetShiftType ? (
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${targetShiftType.textColor} ${targetShiftType.bgColor} border ${targetShiftType.borderColor}`}>
                              Dia {targetShift.date.split('-')[2]}/07 - {targetShiftType.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-indigo-600 font-semibold block mt-1 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded">
                              Plantão Livre do Banco
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Propose Message */}
                    {req.message && (
                      <div className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-dashed border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nota da Solicitação:</span>
                        "{req.message}"
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 border-t border-slate-200/40 pt-4">
                      <button
                        onClick={() => onApproveSwap(req.id, false)}
                        id={`admin-btn-reject-${req.id}`}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-rose-100"
                      >
                        <X size={14} />
                        Recusar Solicitação
                      </button>
                      
                      <button
                        onClick={() => onApproveSwap(req.id, true)}
                        id={`admin-btn-approve-${req.id}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-indigo-600/15"
                      >
                        <Check size={14} />
                        Homologar e Swap
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Workload balance (1 span) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              Equilíbrio de Carga Horária
            </h3>
            <p className="text-slate-400 text-xs mb-4">Total de plantões distribuídos por colaborador no mês</p>

            <div className="space-y-3">
              {employees.filter(e => e.role !== 'ADMIN').map((emp) => {
                const count = shifts.filter(s => s.employeeId === emp.id).length;
                const hours = count * 8; // simplified estimate 8 hours
                
                return (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      {emp.avatar ? (
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 text-slate-500 flex items-center justify-center shrink-0">
                          <User size={14} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{emp.name}</h4>
                        <p className="text-[10px] text-slate-400">{emp.department.split(' / ')[0]}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-700 block">{count} plantões</span>
                      <span className="text-[10px] text-slate-400 font-mono">~{hours}h estimadas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Config utilities */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Opções de Demonstração</h3>
            
            <button
              onClick={onResetData}
              id="admin-btn-reset"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <RotateCcw size={14} className="text-slate-500" />
              Resetar Escalas Originais
            </button>
            <p className="text-[10px] text-slate-400 mt-2 text-center leading-snug">
              Retorna a escala original e limpa todas as simulações e trocas feitas nesta sessão.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
