@echo off
echo Installing voice packages...
npm install @react-native-voice/voice react-native-tts
echo Voice packages installed successfully!
echo.
echo Please run the following commands:
echo 1. npx react-native link @react-native-voice/voice
echo 2. npx react-native link react-native-tts
echo.
echo For Android, add these permissions to android/app/src/main/AndroidManifest.xml:
echo ^<uses-permission android:name="android.permission.RECORD_AUDIO" /^>
echo ^<uses-permission android:name="android.permission.INTERNET" /^>
pause