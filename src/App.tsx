import React, { useState, useEffect } from 'react';
import { 
  INITIAL_EMPLOYEES, 
  SHIFT_TYPES, 
  generateInitialShifts, 
  INITIAL_SWAP_REQUESTS 
} from './data/initialData';
import { Employee, Shift, SwapRequest } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import MyShifts from './components/MyShifts';
import AdminPortal from './components/AdminPortal';
import TeamsView from './components/TeamsView';
import { generateBaseShifts, generateBaseShiftsForRange, applySwapsToShifts } from './utils/shiftHelper';
import { 
  Users, 
  Calendar, 
  ArrowUpDown, 
  Clock, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  AlertTriangle,
  BookOpen,
  User,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function safeSetLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[LocalStorage] Não foi possível salvar a chave "${key}":`, e);
  }
}

function compressImage(dataUrl: string, maxDim = 128, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function App() {
  // --- States ---
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [manualOverrides, setManualOverrides] = useState<Shift[]>([]);
  
  // Simulation current user state
  const [currentUser, setCurrentUser] = useState<Employee>(INITIAL_EMPLOYEES[1]); // Default to Celso Cunha

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // --- Initialize state from LocalStorage or Default Mock ---
  useEffect(() => {
    // Clear legacy massive shifts cache if exists
    try {
      localStorage.removeItem('escalacerta_shifts');
    } catch {
      // ignore
    }

    const savedEmployees = localStorage.getItem('escalacerta_employees');
    let loadedEmployees = INITIAL_EMPLOYEES;
    if (savedEmployees) {
      try {
        const parsed: Employee[] = JSON.parse(savedEmployees);
        // Merge missing initial employees (e.g., new positions like Laboratorista)
        INITIAL_EMPLOYEES.forEach(initEmp => {
          if (!parsed.some(e => e.id === initEmp.id)) {
            parsed.push(initEmp);
          }
        });
        setEmployees(parsed);
        loadedEmployees = parsed;
        safeSetLocalStorage('escalacerta_employees', JSON.stringify(parsed));
      } catch {
        setEmployees(INITIAL_EMPLOYEES);
      }
    }

    const savedSwaps = localStorage.getItem('escalacerta_swaps');
    const savedUser = localStorage.getItem('escalacerta_current_user');
    const savedManualOverrides = localStorage.getItem('escalacerta_manual_overrides');

    if (savedSwaps) {
      try { setSwapRequests(JSON.parse(savedSwaps)); } catch { setSwapRequests(INITIAL_SWAP_REQUESTS); }
    } else {
      setSwapRequests(INITIAL_SWAP_REQUESTS);
      safeSetLocalStorage('escalacerta_swaps', JSON.stringify(INITIAL_SWAP_REQUESTS));
    }

    if (savedManualOverrides) {
      try { setManualOverrides(JSON.parse(savedManualOverrides)); } catch { setManualOverrides([]); }
    }

    if (savedUser) {
      const found = loadedEmployees.find(e => e.id === savedUser);
      if (found) setCurrentUser(found);
    } else {
      // Default to Celso Cunha (second in list)
      const found = loadedEmployees.find(e => e.id === 'emp-celso-a');
      if (found) setCurrentUser(found);
    }
  }, []);

  // Compute shifts reactively
  useEffect(() => {
    // Generate standard 6x2 base shifts from July 2025 to July 2027
    const base = generateBaseShiftsForRange(employees, 2025, 6, 2027, 6);
    
    // Apply manual overrides
    const baseWithOverrides = base.map(bShift => {
      const override = manualOverrides.find(o => o.employeeId === bShift.employeeId && o.date === bShift.date);
      return override ? { ...bShift, shiftTypeId: override.shiftTypeId, notes: override.notes || bShift.notes } : bShift;
    });

    // Apply approved swaps
    const withSwaps = applySwapsToShifts(baseWithOverrides, swapRequests);
    setShifts(withSwaps);
    // Note: Do not save all computed shifts to localStorage as it exceeds quota (15k+ objects)
  }, [employees, swapRequests, manualOverrides]);

  // --- Persistent helper ---
  const saveState = (newShifts: Shift[], newSwaps: SwapRequest[]) => {
    setSwapRequests(newSwaps);
    safeSetLocalStorage('escalacerta_swaps', JSON.stringify(newSwaps));
  };

  // --- Handlers / State Machine actions ---

  // 1. Admin schedules a new shift
  const handleAddShift = (employeeId: string, date: string, shiftTypeId: string, notes?: string) => {
    const newOverride: Shift = {
      id: `override-${employeeId}-${date}`,
      employeeId,
      date,
      shiftTypeId,
      notes
    };

    const updatedOverrides = [
      ...manualOverrides.filter(o => !(o.employeeId === employeeId && o.date === date)),
      newOverride
    ];

    setManualOverrides(updatedOverrides);
    safeSetLocalStorage('escalacerta_manual_overrides', JSON.stringify(updatedOverrides));
  };

  // 2. Colab requests direct or open swap
  const handleRequestSwap = (
    requesterShiftId: string, 
    targetShiftId: string | null, 
    receiverId: string | null, 
    message: string
  ) => {
    const newSwap: SwapRequest = {
      id: `swap-${Date.now()}`,
      requesterId: currentUser.id,
      requestedShiftId: requesterShiftId,
      targetShiftId,
      receiverId,
      status: receiverId ? 'PENDING_RECEIVER' : 'PENDING_RECEIVER', // Open is also PENDING_RECEIVER until grabbed
      createdAt: new Date().toISOString(),
      message
    };

    saveState(
      shifts,
      [newSwap, ...swapRequests]
    );
  };

  // 3. Colab accepts or declines a direct swap request
  const handleRespondToSwap = (requestId: string, approve: boolean) => {
    const updatedSwaps = swapRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: approve ? 'APPROVED' as const : 'REJECTED_RECEIVER' as const
        };
      }
      return req;
    });

    saveState(
      shifts,
      updatedSwaps
    );
  };

  // 4. Colab claims an open swap from the board/market
  const handleTakeOpenSwap = (requestId: string, takerShiftId: string) => {
    const updatedSwaps = swapRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          receiverId: currentUser.id,
          targetShiftId: takerShiftId,
          status: 'APPROVED' as const // Moves straight to APPROVED
        };
      }
      return req;
    });

    saveState(
      shifts,
      updatedSwaps
    );
  };

  // 5. Admin approves or rejects the swap (COMMENTS SWAP)
  const handleApproveSwap = (requestId: string, approve: boolean) => {
    const targetRequest = swapRequests.find(r => r.id === requestId);
    if (!targetRequest) return;

    let updatedShifts = [...shifts];

    if (approve) {
      // Swapping mechanic
      const reqShiftIndex = shifts.findIndex(s => s.id === targetRequest.requestedShiftId);
      
      if (targetRequest.targetShiftId) {
        const targetShiftIndex = shifts.findIndex(s => s.id === targetRequest.targetShiftId);

        if (reqShiftIndex !== -1 && targetShiftIndex !== -1) {
          // Both shifts exist. We swap the employeeIds of these two shifts!
          const tempEmpId = updatedShifts[reqShiftIndex].employeeId;
          updatedShifts[reqShiftIndex].employeeId = updatedShifts[targetShiftIndex].employeeId;
          updatedShifts[targetShiftIndex].employeeId = tempEmpId;
        }
      } else {
        // Grabbed shift but no specific target shift from open pool
        // This is a direct takeover where receiver accepts to do requester's shift
        if (reqShiftIndex !== -1 && targetRequest.receiverId) {
          updatedShifts[reqShiftIndex].employeeId = targetRequest.receiverId;
        }
      }
    }

    const updatedSwaps = swapRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: approve ? 'APPROVED' as const : 'REJECTED_ADMIN' as const
        };
      }
      return req;
    });

    saveState(
      updatedShifts,
      updatedSwaps
    );
  };

  // Reset to original data
  const handleResetData = () => {
    localStorage.removeItem('escalacerta_shifts');
    localStorage.removeItem('escalacerta_swaps');
    localStorage.removeItem('escalacerta_logs');
    
    const generated = generateInitialShifts();
    setShifts(generated);
    setSwapRequests(INITIAL_SWAP_REQUESTS);
    
    // reset simulation user
    setCurrentUser(INITIAL_EMPLOYEES[1]);
    
    alert('Dados da escala resetados para o estado original com sucesso!');
  };

  // Handle simulation user profile switches
  const handleProfileSwitch = (empId: string) => {
    const found = employees.find(e => e.id === empId);
    if (found) {
      setCurrentUser(found);
      safeSetLocalStorage('escalacerta_current_user', empId);
      // Let anyone stay on their current tab
      if (activeTab === 'admin' && found.role !== 'ADMIN') {
        setActiveTab('dashboard');
      }
    }
  };

  // Handle profile avatar update
  const handleUpdateAvatar = (newAvatarUrl: string) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === currentUser.id) {
        return { ...emp, avatar: newAvatarUrl };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    setCurrentUser(prev => ({ ...prev, avatar: newAvatarUrl }));
    safeSetLocalStorage('escalacerta_employees', JSON.stringify(updatedEmployees));
  };

  // Handle profile avatar removal
  const handleRemoveAvatar = () => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === currentUser.id) {
        return { ...emp, avatar: undefined };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    setCurrentUser(prev => ({ ...prev, avatar: undefined }));
    safeSetLocalStorage('escalacerta_employees', JSON.stringify(updatedEmployees));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* 1. Header with Simulator Controls */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo Title & Mobile Toggle */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Activity size={22} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-sans leading-none">
                  EscalaVC
                </h1>
                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 tracking-wide uppercase">
                  escala de turnos
                </p>
              </div>
            </div>

            {/* Mobile Simulator Toggle */}
            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className="md:hidden px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-all shadow-xs"
            >
              <Users size={14} />
              <span>Simular Perfil</span>
              <span className="text-[10px] text-indigo-400">({currentUser.name.split(' ')[0]})</span>
            </button>
          </div>

          {/* SIMULATOR BAR (Interactive profile switcher) */}
          <div className={`${isSimulatorOpen ? 'flex' : 'hidden md:flex'} bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2.5 flex-wrap items-center gap-3 md:max-w-xl shadow-inner w-full md:w-auto`}>
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
              <Users size={15} />
              <span>Simular Perfil:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={currentUser.id}
                onChange={(e) => handleProfileSwitch(e.target.value)}
                id="app-simulator-profile-select"
                className="bg-white border border-indigo-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role === 'ADMIN' ? 'Supervisão' : `${emp.position || 'Operador'} - Turma ${emp.team}`})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 pl-2 border-l border-indigo-200">
                <input
                  type="file"
                  id="profile-avatar-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        if (typeof reader.result === 'string') {
                          const compressed = await compressImage(reader.result, 128, 0.85);
                          handleUpdateAvatar(compressed);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {currentUser.avatar ? (
                  <div className="relative group">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
                      onClick={() => {
                        document.getElementById('profile-avatar-input')?.click();
                      }}
                      title="Clique para escolher uma foto da galeria"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAvatar();
                      }}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      title="Remover foto"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ) : (
                  <div 
                    className="w-6 h-6 rounded-full bg-indigo-100 border border-white text-indigo-700 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all text-[10px] font-bold shrink-0"
                    onClick={() => {
                      document.getElementById('profile-avatar-input')?.click();
                    }}
                    title="Clique para escolher uma foto da galeria"
                  >
                    <User size={12} />
                  </div>
                )}
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-600 text-white font-bold">
                  Operador
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 2. Simulation Instructions Tour (Expandable/Dismissible) */}
        <div className={`${isSimulatorOpen ? 'block' : 'hidden md:block'} max-w-7xl mx-auto px-4 pb-3 pt-2 sm:px-6 lg:px-8`}>
          <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-3 text-xs text-slate-700 flex gap-2.5 items-start">
            <BookOpen size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Guia Rápido de Simulação para Testes:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-600">
                <li>
                  <strong>Gestão de Turmas:</strong> Vá na aba <strong>Equipes (6x2)</strong> para ver todos os colaboradores e editar as turmas. Qualquer alteração atualiza a escala instantaneamente!
                </li>
                <li>
                  <strong>Escala Sem Chefia:</strong> Removido o nível de supervisão. Toda permuta de plantão acordada entre os operadores é <strong>aprovada automaticamente</strong> na hora, sem filas de espera!
                </li>
                <li>
                  <strong>Mural de Trocas:</strong> Publique uma vaga no mural de trocas ou solicite permuta direta com qualquer colega.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Desktop only) */}
        <div className="border-t border-slate-100 bg-white hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('dashboard')}
                id="nav-tab-dashboard"
                className={`py-4 px-1 border-b-2 font-semibold text-xs transition-all uppercase tracking-wider flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                <Activity size={14} />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                id="nav-tab-calendar"
                className={`py-4 px-1 border-b-2 font-semibold text-xs transition-all uppercase tracking-wider flex items-center gap-2 ${
                  activeTab === 'calendar'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                <Calendar size={14} />
                Escala Geral
              </button>

              <button
                onClick={() => setActiveTab('teams')}
                id="nav-tab-teams"
                className={`py-4 px-1 border-b-2 font-semibold text-xs transition-all uppercase tracking-wider flex items-center gap-2 ${
                  activeTab === 'teams'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users size={14} />
                Equipes (6x2)
              </button>

              {currentUser.role !== 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('my-shifts')}
                  id="nav-tab-my-shifts"
                  className={`py-4 px-1 border-b-2 font-semibold text-xs transition-all uppercase tracking-wider flex items-center gap-2 ${
                    activeTab === 'my-shifts'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Clock size={14} />
                  Meus Plantões
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 3. Main Stage Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                employees={employees}
                shifts={shifts}
                shiftTypes={SHIFT_TYPES}
                swapRequests={swapRequests}
                onSelectTab={setActiveTab}
                currentUser={currentUser}
                onUpdateAvatar={handleUpdateAvatar}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView 
                employees={employees}
                shifts={shifts}
                shiftTypes={SHIFT_TYPES}
                currentUser={currentUser}
                onAddShift={handleAddShift}
                onRequestSwap={handleRequestSwap}
              />
            )}

            {activeTab === 'teams' && (
              <TeamsView 
                employees={employees}
                currentUser={currentUser}
                onUpdateEmployees={(updated) => {
                  setEmployees(updated);
                  localStorage.setItem('escalacerta_employees', JSON.stringify(updated));
                }}
              />
            )}

            {activeTab === 'my-shifts' && currentUser.role !== 'ADMIN' && (
              <MyShifts 
                currentUser={currentUser}
                shifts={shifts}
                shiftTypes={SHIFT_TYPES}
                employees={employees}
                swapRequests={swapRequests}
                onRespondToSwap={handleRespondToSwap}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
              <AdminPortal 
                currentUser={currentUser}
                employees={employees}
                shifts={shifts}
                shiftTypes={SHIFT_TYPES}
                swapRequests={swapRequests}
                onApproveSwap={handleApproveSwap}
                onResetData={handleResetData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p>EscalaVC © 2026. Em total conformidade com a escala 6x2 e regras da CLT.</p>
        </div>
      </footer>

      {/* 5. Mobile Bottom Navigation Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-around py-3 pb-safe">
        <button
          onClick={() => setActiveTab('dashboard')}
          id="mobile-nav-dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Activity size={18} />
          <span>Início</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          id="mobile-nav-calendar"
          className={`flex flex-col items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
            activeTab === 'calendar' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Calendar size={18} />
          <span>Escala</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          id="mobile-nav-teams"
          className={`flex flex-col items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
            activeTab === 'teams' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Users size={18} />
          <span>Equipes</span>
        </button>

        {currentUser.role !== 'ADMIN' && (
          <button
            onClick={() => setActiveTab('my-shifts')}
            id="mobile-nav-my-shifts"
            className={`flex flex-col items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
              activeTab === 'my-shifts' ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <Clock size={18} />
            <span>Plantões</span>
          </button>
        )}
      </div>

    </div>
  );
}
