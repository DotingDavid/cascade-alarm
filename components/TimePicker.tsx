import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimeValue } from '../types';

interface TimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  const date = new Date();
  date.setHours(value.hours, value.minutes, 0, 0);

  const formatDisplay = () => {
    const h = value.hours % 12 || 12;
    const m = value.minutes.toString().padStart(2, '0');
    const ampm = value.hours >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${ampm}`;
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange({
        hours: selectedDate.getHours(),
        minutes: selectedDate.getMinutes(),
      });
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>{formatDisplay()}</Text>
      </TouchableOpacity>

      {showPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="spinner"
                  onChange={handleChange}
                  textColor="#fff"
                />
                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  doneButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
