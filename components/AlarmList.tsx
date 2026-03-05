import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Alarm } from '../types';

interface AlarmListProps {
  alarms: Alarm[];
}

export function AlarmList({ alarms }: AlarmListProps) {
  const getStatusStyle = (status: Alarm['status']) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'fired':
        return styles.statusFired;
      case 'dismissed':
        return styles.statusDismissed;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {alarms.map((alarm) => (
        <View key={alarm.id} style={styles.alarmItem}>
          <Text style={styles.alarmTime}>{alarm.label}</Text>
          <Text style={[styles.alarmStatus, getStatusStyle(alarm.status)]}>
            {alarm.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  alarmTime: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  alarmStatus: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statusPending: {
    color: '#4ade80',
  },
  statusFired: {
    color: '#e94560',
  },
  statusDismissed: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
});
