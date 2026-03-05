import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alarm, TimeValue } from '../types';

const STORAGE_KEY = 'cascadeAlarms';

export function createAlarms(
  wakeTime: TimeValue,
  interval: number,
  count: number
): Alarm[] {
  const alarms: Alarm[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const alarmDate = new Date();
    alarmDate.setHours(wakeTime.hours, wakeTime.minutes + (i * interval), 0, 0);

    // If time has passed today, set for tomorrow
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const alarmId = `cascade-${i}-${Date.now()}`;

    alarms.push({
      id: alarmId,
      time: alarmDate,
      label: formatTime(alarmDate),
      status: 'pending',
    });
  }

  return alarms;
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Cascade Alarm',
      body: `Wake up! ${alarm.label}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { alarmId: alarm.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(alarm.time),
    },
  });
  return notificationId;
}

export async function scheduleAllNotifications(alarms: Alarm[]): Promise<Alarm[]> {
  const scheduled: Alarm[] = [];
  for (const alarm of alarms) {
    if (alarm.status === 'pending') {
      const notificationId = await scheduleAlarmNotification(alarm);
      scheduled.push({ ...alarm, notificationId });
    } else {
      scheduled.push(alarm);
    }
  }
  return scheduled;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

export async function loadAlarms(): Promise<Alarm[] | null> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  const parsed = JSON.parse(saved);
  // Restore Date objects from JSON strings
  return parsed.map((a: any) => ({ ...a, time: new Date(a.time) }));
}

export async function clearAlarms(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function createSnoozeAlarm(): Alarm {
  const snoozeTime = new Date(Date.now() + 2 * 60 * 1000);
  return {
    id: `snooze-${Date.now()}`,
    time: snoozeTime,
    label: formatTime(snoozeTime) + ' (snooze)',
    status: 'pending',
  };
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
