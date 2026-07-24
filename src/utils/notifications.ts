import { UserProfile } from '../types';
import { TURNOS_CONFIG } from '../data/equipes';
import { getDaySchedule, getNextFolga, addDays } from './escala';

export interface NotificationPrefs {
  reminderShiftStart: boolean;
  reminderFolgaAlert: boolean;
}

const PREFS_KEY = 'escala_notification_prefs';
const LAST_SHIFT_ALERT_KEY = 'escala_last_shift_alert_date';
const LAST_FOLGA_ALERT_KEY = 'escala_last_folga_alert_date';

export const getNotificationPrefs = (): NotificationPrefs => {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return { reminderShiftStart: true, reminderFolgaAlert: true };
};

export const saveNotificationPrefs = (prefs: NotificationPrefs) => {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
};

export const checkNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (checkNotificationSupport()) {
    return Notification.permission;
  }
  return 'default';
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!checkNotificationSupport()) {
    throw new Error('Navegador não suporta notificações Push.');
  }
  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Sends a notification using ServiceWorker showNotification if available,
 * falling back to new Notification() for standard desktop browsers.
 */
export const sendPushNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    console.warn('Notification API not supported.');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted.');
    return false;
  }

  const defaultOptions: NotificationOptions & {
    vibrate?: number[];
    badge?: string;
    renotify?: boolean;
  } = {
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    tag: 'escala-6x2-alert',
    renotify: true,
    ...options,
  };

  // 1. Try ServiceWorker registration first (Best for Mobile Chrome, Android, PWAs)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, defaultOptions);
        return true;
      }
    } catch (err) {
      console.warn('ServiceWorker showNotification failed, trying fallback:', err);
    }
  }

  // 2. Fallback to standard Notification constructor (Desktop Chrome/Safari)
  try {
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.error('Standard Notification constructor failed:', err);
    return false;
  }
};

/**
 * Evaluates shift and folga status for today and tomorrow and fires notifications
 * if enabled and not already sent today.
 */
export const checkAndSendScheduledNotifications = async (
  user: UserProfile | null,
  forceTest: boolean = false
): Promise<{ shiftAlertSent: boolean; folgaAlertSent: boolean; message: string }> => {
  if (getNotificationPermission() !== 'granted') {
    return { shiftAlertSent: false, folgaAlertSent: false, message: 'Permissão de notificação não concedida.' };
  }

  const prefs = getNotificationPrefs();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const userTurma = user?.turma || 'A';
  const userName = user?.nome || 'Operador';

  let shiftAlertSent = false;
  let folgaAlertSent = false;
  let statusMessage = 'Sua escala já foi verificada hoje.';

  // 1. Shift Start Lembrete Diário
  const lastShiftAlert = localStorage.getItem(LAST_SHIFT_ALERT_KEY);
  if (prefs.reminderShiftStart && (forceTest || lastShiftAlert !== todayStr)) {
    const schedule = getDaySchedule(today);
    const myShift = schedule.shiftsByTurma[userTurma];
    const config = TURNOS_CONFIG[myShift.turno];

    const title = myShift.turno === 'FOLGA' 
      ? '🎉 Escala 6x2 - Dia de Folga!' 
      : `🏭 Escala 6x2 - Turno de Hoje (${config.nome})`;

    const body = myShift.turno === 'FOLGA'
      ? `Olá ${userName}! Hoje você está de FOLGA na Turma ${userTurma}. Aproveite seu descanso!`
      : `Olá ${userName}! Seu turno hoje na Turma ${userTurma} é das ${config.horario}. Bom trabalho!`;

    const success = await sendPushNotification(title, {
      body,
      tag: 'escala-shift-daily',
    });

    if (success && !forceTest) {
      localStorage.setItem(LAST_SHIFT_ALERT_KEY, todayStr);
      shiftAlertSent = true;
      statusMessage = 'Notificação de turno do dia enviada com sucesso!';
    } else if (success && forceTest) {
      shiftAlertSent = true;
      statusMessage = 'Notificação de teste enviada com sucesso!';
    }
  }

  // 2. Previa de Folga (Alert for tomorrow's folga)
  const lastFolgaAlert = localStorage.getItem(LAST_FOLGA_ALERT_KEY);
  if (prefs.reminderFolgaAlert && (forceTest || lastFolgaAlert !== todayStr)) {
    const tomorrow = addDays(today, 1);
    const tomorrowSchedule = getDaySchedule(tomorrow);
    const tomorrowShift = tomorrowSchedule.shiftsByTurma[userTurma];

    if (tomorrowShift.turno === 'FOLGA') {
      const title = '🌴 Alerta de Folga Amanhã!';
      const body = `Atenção ${userName}! Amanhã será seu 1º dia de folga na Turma ${userTurma}!`;

      const success = await sendPushNotification(title, {
        body,
        tag: 'escala-folga-previa',
      });

      if (success && !forceTest) {
        localStorage.setItem(LAST_FOLGA_ALERT_KEY, todayStr);
        folgaAlertSent = true;
      }
    }
  }

  return { shiftAlertSent, folgaAlertSent, message: statusMessage };
};
