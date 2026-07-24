import React, { useState, useEffect } from 'react';
import { X, Bell, BellRing, CheckCircle, ShieldAlert, Clock, Coffee, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationPrefs,
  saveNotificationPrefs,
  checkAndSendScheduledNotifications,
  checkNotificationSupport,
} from '../utils/notifications';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [prefs, setPrefs] = useState(getNotificationPrefs());
  const [sentTestNotification, setSentTestNotification] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    setPermission(getNotificationPermission());
    setPrefs(getNotificationPrefs());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleShiftStart = (enabled: boolean) => {
    const updated = { ...prefs, reminderShiftStart: enabled };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const handleToggleFolgaAlert = (enabled: boolean) => {
    const updated = { ...prefs, reminderFolgaAlert: enabled };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const handleRequestPermission = async () => {
    if (!checkNotificationSupport()) {
      alert('Seu navegador atual não suporta Notificações Push nativas.');
      return;
    }

    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result === 'granted') {
        const res = await checkAndSendScheduledNotifications(user, true);
        setStatusMessage(res.message);
        setSentTestNotification(true);
        setTimeout(() => setSentTestNotification(false), 4000);
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const handleSendTestNotification = async () => {
    if (permission !== 'granted') return;
    const res = await checkAndSendScheduledNotifications(user, true);
    setStatusMessage(res.message);
    setSentTestNotification(true);
    setTimeout(() => setSentTestNotification(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Notificações Diárias Push
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lembretes de horário de turno e avisos de folga
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {permission === 'granted' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : permission === 'denied' ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Status no Navegador:
              </span>{' '}
              <span className={permission === 'granted' ? 'text-emerald-600 font-semibold' : permission === 'denied' ? 'text-red-600 font-semibold' : 'text-amber-600 font-semibold'}>
                {permission === 'granted'
                  ? 'Ativado (Ativo)'
                  : permission === 'denied'
                  ? 'Bloqueado no navegador'
                  : 'Pendente permissão'}
              </span>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              Ativar
            </button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
            As notificações foram bloqueadas no navegador. Para ativar, toque no ícone de cadeado na barra de endereço do navegador e permita as Notificações.
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-2.5 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer">
            <div className="flex items-center gap-2.5 text-xs">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Lembrete de Início de Turno
                </div>
                <div className="text-[11px] text-slate-400">
                  Aviso diário com o horário da sua turma
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.reminderShiftStart}
              onChange={(e) => handleToggleShiftStart(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer">
            <div className="flex items-center gap-2.5 text-xs">
              <Coffee className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Alerta Prévia de Folga
                </div>
                <div className="text-[11px] text-slate-400">
                  Notificação no dia anterior à sua folga
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.reminderFolgaAlert}
              onChange={(e) => handleToggleFolgaAlert(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>

        {/* Test button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSendTestNotification}
            disabled={permission !== 'granted'}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              permission === 'granted'
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Testar Notificação Agora</span>
          </button>

          {sentTestNotification && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
              {statusMessage || 'Enviado!'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

