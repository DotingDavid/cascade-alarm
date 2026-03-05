import { Audio } from 'expo-av';

let alarmSound: Audio.Sound | null = null;

export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
}

export async function playAlarmSound(): Promise<void> {
  try {
    // Stop any existing sound first
    await stopAlarmSound();

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/alarm.wav'),
      {
        isLooping: true,
        volume: 1.0,
        shouldPlay: true,
      }
    );
    alarmSound = sound;
  } catch (error) {
    console.error('Failed to play alarm sound:', error);
  }
}

export async function stopAlarmSound(): Promise<void> {
  try {
    if (alarmSound) {
      await alarmSound.stopAsync();
      await alarmSound.unloadAsync();
      alarmSound = null;
    }
  } catch (error) {
    console.error('Failed to stop alarm sound:', error);
  }
}
