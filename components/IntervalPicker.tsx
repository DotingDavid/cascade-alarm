import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface IntervalPickerProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  suffix: string;
}

export function IntervalPicker({ value, onChange, options, suffix }: IntervalPickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.option, value === option && styles.optionSelected]}
          onPress={() => onChange(option)}
        >
          <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>
            {option} {suffix}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  optionSelected: {
    backgroundColor: '#e94560',
  },
  optionText: {
    color: '#888',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
