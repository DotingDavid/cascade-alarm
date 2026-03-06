import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { TimePicker } from './components/TimePicker';
import { IntervalPicker } from './components/IntervalPicker';
import { AlarmList } from './components/AlarmList';
import { AlarmPopup } from './components/AlarmPopup';
import {
  createAlarms,
  saveAlarms,
  loadAlarms,
  clearAlarms,
  createSnoozeAlarm,
  scheduleAllNotifications,
  scheduleAlarmNotification,
  cancelAllNotifications,
} from './utils/alarmScheduler';
import { configureAudioMode } from './utils/alarmAudio';
import { Alarm } from './types';

// Show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export default function App() {
  const [wakeTime, setWakeTime] = useState({ hours: 9, minutes: 0 });
  const [interval, setInterval] = useState(5);
  const [count, setCount] = useState(5);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [isSetup, setIsSetup] = useState(true);
  const alarmsRef = useRef<Alarm[]>([]);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  // Keep ref in sync so the timer callback sees current alarms
  useEffect(() => {
    alarmsRef.current = alarms;
  }, [alarms]);

  // Setup notifications and audio on mount
  useEffect(() => {
    setupNotifications();
    configureAudioMode().catch(err =>
      console.warn('Audio mode configuration failed:', err)
    );

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const alarmId = notification.request.content.data?.alarmId as string;
        if (alarmId) {
          handleAlarmFired(alarmId);
        }
      }
    );

    // Listen for user tapping on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const alarmId = response.notification.request.content.data?.alarmId as string;
        if (alarmId) {
          handleAlarmFired(alarmId);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Load saved alarms on mount
  useEffect(() => {
    (async () => {
      const saved = await loadAlarms();
      if (saved && saved.length > 0) {
        setAlarms(saved);
        setIsSetup(false);
      }
    })();
  }, []);

  // Foreground timer: check every second if a pending alarm's time has passed
  useEffect(() => {
    const timer = global.setInterval(() => {
      const now = new Date();
      const current = alarmsRef.current;
      const pending = current.filter(a => a.status === 'pending');

      for (const alarm of pending) {
        const alarmTime = new Date(alarm.time);
        if (alarmTime <= now) {
          handleAlarmFired(alarm.id);
          break; // Fire one at a time
        }
      }
    }, 1000);

    return () => global.clearInterval(timer);
  }, []);

  const handleAlarmFired = useCallback((alarmId: string) => {
    setAlarms(prev => {
      const updated = prev.map(a =>
        a.id === alarmId ? { ...a, status: 'fired' as const } : a
      );
      const fired = updated.find(a => a.id === alarmId);
      if (fired) {
        setActiveAlarm(fired);
      }
      saveAlarms(updated);
      return updated;
    });
  }, []);

  const handleSetAlarms = async () => {
    const newAlarms = createAlarms(wakeTime, interval, count);
    // Schedule system notifications for each alarm
    const scheduled = await scheduleAllNotifications(newAlarms);
    setAlarms(scheduled);
    setIsSetup(false);
    await saveAlarms(scheduled);
  };

  const handleCancelAll = async () => {
    await cancelAllNotifications();
    setAlarms([]);
    setIsSetup(true);
    await clearAlarms();
  };

  const handleDismiss = async () => {
    if (activeAlarm) {
      setAlarms(prev => {
        const updated = prev.map(a =>
          a.id === activeAlarm.id ? { ...a, status: 'dismissed' as const } : a
        );
        saveAlarms(updated);
        return updated;
      });
    }
    setActiveAlarm(null);
  };

  const handleSnooze = async () => {
    if (activeAlarm) {
      const snoozeAlarm = createSnoozeAlarm();
      // Schedule notification for snooze
      const notificationId = await scheduleAlarmNotification(snoozeAlarm);
      snoozeAlarm.notificationId = notificationId;
      setAlarms(prev => {
        const updated = [
          ...prev.map(a =>
            a.id === activeAlarm.id ? { ...a, status: 'dismissed' as const } : a
          ),
          snoozeAlarm,
        ];
        saveAlarms(updated);
        return updated;
      });
    }
    setActiveAlarm(null);
  };

  const getPreviewTimes = (): string[] => {
    const times: string[] = [];
    for (let i = 0; i < count; i++) {
      const totalMins = wakeTime.hours * 60 + wakeTime.minutes + (i * interval);
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      times.push(`${hour}:${m.toString().padStart(2, '0')} ${ampm}`);
    }
    return times;
  };

  const pendingCount = alarms.filter(a => a.status === 'pending').length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>Cascade Alarm</Text>
      <Text style={styles.subtitle}>Set once, wake up for sure</Text>

      {/* Status Bar */}
      <View style={[styles.statusBar, pendingCount === 0 && styles.statusBarInactive]}>
        <Text style={[styles.statusText, pendingCount === 0 && styles.statusTextInactive]}>
          {pendingCount > 0
            ? `${pendingCount} alarm${pendingCount > 1 ? 's' : ''} remaining`
            : 'No alarms active'}
        </Text>
      </View>

      {isSetup ? (
        <ScrollView style={styles.setupCard}>
          <Text style={styles.label}>Wake up time</Text>
          <TimePicker value={wakeTime} onChange={setWakeTime} />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Interval</Text>
              <IntervalPicker
                value={interval}
                onChange={setInterval}
                options={[3, 5, 10, 15]}
                suffix="min"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>How many</Text>
              <IntervalPicker
                value={count}
                onChange={setCount}
                options={[3, 4, 5, 6, 8, 10]}
                suffix="alarms"
              />
            </View>
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Alarms will ring at:</Text>
            <Text style={styles.previewTimes}>{getPreviewTimes().join(' → ')}</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSetAlarms}>
            <Text style={styles.primaryButtonText}>Set All Alarms</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.activeCard}>
          <AlarmList alarms={alarms} />
          <TouchableOpacity style={styles.dangerButton} onPress={handleCancelAll}>
            <Text style={styles.dangerButtonText}>Cancel All Alarms</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeAlarm && (
        <AlarmPopup
          alarm={activeAlarm}
          onDismiss={handleDismiss}
          onSnooze={handleSnooze}
        />
      )}
    </View>
  );
}

async function setupNotifications() {
  // Create Android notification channel with alarm priority
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarms',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 200, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== 'granted') {
    await Notifications.requestPermissionsAsync({
      android: {
        allowAlert: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusBar: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  statusBarInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusText: {
    color: '#4ade80',
    textAlign: 'center',
  },
  statusTextInactive: {
    color: '#666',
  },
  setupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
  },
  activeCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
  },
  label: {
    color: '#aaa',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  halfWidth: {
    flex: 1,
  },
  preview: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  previewLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  previewTimes: {
    color: '#fff',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 18,
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 18,
    marginTop: 16,
  },
  dangerButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
