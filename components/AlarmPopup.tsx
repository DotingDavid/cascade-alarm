import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration } from 'react-native';
import { Alarm } from '../types';

interface AlarmPopupProps {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: () => void;
}

export function AlarmPopup({ alarm, onDismiss, onSnooze }: AlarmPopupProps) {
  const pulseAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start vibration pattern
    const vibrationPattern = [0, 500, 200, 500];
    Vibration.vibrate(vibrationPattern, true);

    // Play alarm sound
    playAlarmSound();

    return () => {
      Vibration.cancel();
      stopAlarmSound();
    };
  }, []);

  const playAlarmSound = async () => {
    // Skip custom sound for now - use system notification sound
    // TODO: Add custom alarm.wav to assets folder
    console.log('Alarm triggered - using system notification sound');
  };

  const stopAlarmSound = async () => {
    // No-op for now - custom sound disabled
    console.log('Stopping alarm sound');
  };

  const handleDismiss = async () => {
    Vibration.cancel();
    await stopAlarmSound();
    onDismiss();
  };

  const handleSnooze = async () => {
    Vibration.cancel();
    await stopAlarmSound();
    onSnooze();
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <Text style={styles.time}>{alarm.label}</Text>
      <Text style={styles.message}>Time to wake up! 🌅</Text>
      
      <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
        <Text style={styles.dismissButtonText}>I'm Awake!</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.snoozeButton} onPress={handleSnooze}>
        <Text style={styles.snoozeButtonText}>Snooze 2 min</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  time: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  message: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 40,
  },
  dismissButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 60,
    marginBottom: 16,
  },
  dismissButtonText: {
    color: '#e94560',
    fontSize: 20,
    fontWeight: 'bold',
  },
  snoozeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 60,
  },
  snoozeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
