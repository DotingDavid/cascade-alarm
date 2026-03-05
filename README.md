# Cascade Alarm

Set one wake-up time → automatically creates multiple backup alarms at intervals.

No more manually setting 5 separate alarms every night.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For Android: Android Studio with emulator, or Expo Go app on your phone
- For iOS: Xcode (Mac only), or Expo Go app on your phone

### Setup

```bash
# Navigate to project
cd cascade-alarm-mobile

# Install dependencies
npm install

# Install the datetime picker
npx expo install @react-native-community/datetimepicker

# Start development server
npx expo start
```

### Running on Your Phone

1. Install **Expo Go** from App Store / Play Store
2. Run `npx expo start`
3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

### Running on Emulator

```bash
# Android
npx expo start --android

# iOS (Mac only)
npx expo start --ios
```

## Project Structure

```
cascade-alarm-mobile/
├── App.tsx              # Main app component
├── types.ts             # TypeScript types
├── components/
│   ├── TimePicker.tsx   # Time selection
│   ├── IntervalPicker.tsx  # Interval/count selection
│   ├── AlarmList.tsx    # List of scheduled alarms
│   └── AlarmPopup.tsx   # Full-screen alarm alert
├── utils/
│   └── alarmScheduler.ts  # Notification scheduling logic
└── assets/
    └── alarm.wav        # Alarm sound (add your own!)
```

## Adding Custom Alarm Sound

1. Add a `.wav` file to `assets/alarm.wav`
2. The app will use it for alarms

If no sound file exists, it falls back to system notification sound.

## Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

### iOS (requires Apple Developer account)

```bash
eas build -p ios --profile preview
```

## Features

- ⏰ Set cascade of alarms with one tap
- 🔄 Configurable interval (3, 5, 10, 15 min)
- 📊 Choose number of alarms (3-10)
- 💤 2-minute snooze option
- 📱 Works on Android and iOS
- 🔔 Alarms fire even when app is closed

## Known Limitations

- **iOS**: Alarms appear as notifications when app is backgrounded (iOS restriction)
- **Android**: Requires exact alarm permission on Android 12+
- **Battery optimization**: On some phones, you may need to disable battery optimization for the app

## Next Steps (Future Features)

- [ ] Custom alarm sounds
- [ ] Gradually increasing volume
- [ ] Widget for quick access
- [ ] Dark/light theme toggle
- [ ] Statistics (how many alarms to actually wake up)
